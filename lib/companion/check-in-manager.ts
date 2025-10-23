/**
 * ============================================================================
 * STUPIFY - Companion Check-In Manager (UTC Aligned)
 * Created: 2025-10-24
 * Notes:
 * - All date logic is aligned to *UTC days* to match the DB unique index:
 *   ((checked_in_at AT TIME ZONE 'UTC')::date)
 * - No external libraries required.
 * ============================================================================
 */

/** Reward definition returned by getCheckInReward / getUpcomingRewards */
export interface CheckInReward {
  type: 'xp' | 'stat_boost';
  amount: number;
  stats?: {
    happiness: number;
    energy: number;
    knowledge: number;
  };
  dayInCycle: number; // 1..7
}

/** Fixed timezone used across the client for day math (must match DB index) */
const CHECKIN_TZ = 'UTC' as const;

/* -------------------------------------------------------------------------- */
/*                              Timezone Helpers                              */
/* -------------------------------------------------------------------------- */

/** Extracts Y/M/D for a Date in a target IANA timezone using Intl APIs. */
function ymdInTZ(date: Date, timeZone: string): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const getNum = (type: string) => Number(parts.find(p => p.type === type)?.value);
  return { y: getNum('year'), m: getNum('month'), d: getNum('day') };
}

/** Returns a stable "day number" (days since epoch) in the given timezone. */
function dayNumber(date: Date, timeZone: string): number {
  const { y, m, d } = ymdInTZ(date, timeZone);
  // Construct midnight UTC using the Y/M/D *of the target timezone day*.
  return Date.UTC(y, m - 1, d) / 86_400_000; // 86,400,000 ms/day
}

/** Difference in whole days (a - b) measured by calendar days in target TZ. */
function daysBetweenInTZ(a: Date, b: Date, timeZone: string): number {
  return dayNumber(a, timeZone) - dayNumber(b, timeZone);
}

/* -------------------------------------------------------------------------- */
/*                              Public API (UTC)                              */
/* -------------------------------------------------------------------------- */

/**
 * Check if user can check in today (UTC-day aligned).
 * @param lastCheckInAt ISO string of last check-in timestamp, or null
 * @returns true if the current UTC day is strictly after the last check-in UTC day
 */
export function canCheckInToday(lastCheckInAt: string | null): boolean {
  if (!lastCheckInAt) return true;
  const last = new Date(lastCheckInAt);
  const now = new Date();
  // Can check in if we've moved to a *new* UTC day
  return daysBetweenInTZ(now, last, CHECKIN_TZ) >= 1;
}

/**
 * Get current day in 7-day cycle (1..7).
 * @param totalCheckIns Total successful check-ins to date
 */
export function getDayInCycle(totalCheckIns: number): number {
  // If totalCheckIns=0, next check-in should be day 1
  return ((totalCheckIns % 7) + 1);
}

/**
 * Calculate check-in reward based on day in cycle (1..7).
 */
export function getCheckInReward(dayInCycle: number): CheckInReward {
  // Define rewards as a readonly map for better type-safety.
  const rewards: Readonly<Record<number, CheckInReward>> = {
    1: {
      type: 'stat_boost',
      amount: 0,
      stats: { happiness: 10, energy: 15, knowledge: 5 },
      dayInCycle: 1,
    },
    2: {
      type: 'xp',
      amount: 50,
      stats: { happiness: 5, energy: 10, knowledge: 3 },
      dayInCycle: 2,
    },
    3: {
      type: 'stat_boost',
      amount: 0,
      stats: { happiness: 15, energy: 10, knowledge: 10 },
      dayInCycle: 3,
    },
    4: {
      type: 'xp',
      amount: 100,
      stats: { happiness: 8, energy: 12, knowledge: 5 },
      dayInCycle: 4,
    },
    5: {
      type: 'stat_boost',
      amount: 0,
      stats: { happiness: 12, energy: 15, knowledge: 8 },
      dayInCycle: 5,
    },
    6: {
      type: 'xp',
      amount: 150,
      stats: { happiness: 10, energy: 15, knowledge: 8 },
      dayInCycle: 6,
    },
    7: {
      type: 'xp',
      amount: 200,
      stats: { happiness: 20, energy: 20, knowledge: 15 },
      dayInCycle: 7,
    },
  };

  return rewards[dayInCycle] ?? rewards[1];
}

/**
 * Update streak based on UTC-day boundaries (aligned with DB).
 * - If last check-in was *yesterday* (UTC), increment.
 * - If it was *today* (UTC), keep as-is.
 * - Otherwise, reset to 1.
 */
export function updateStreak(lastCheckInAt: string | null, currentStreak: number): number {
  if (!lastCheckInAt) return 1;

  const last = new Date(lastCheckInAt);
  const now = new Date();
  const diff = daysBetweenInTZ(now, last, CHECKIN_TZ);

  if (diff === 1) return currentStreak + 1; // checked in yesterday (UTC)
  if (diff === 0) return currentStreak;     // already checked in today (UTC)
  return 1;                                  // missed ≥1 days
}

/**
 * Get days remaining until the current 7-day cycle completes.
 * @param dayInCycle Current day (1..7)
 */
export function getDaysUntilCycleComplete(dayInCycle: number): number {
  // If on day 7, remaining is 0.
  return Math.max(0, 7 - dayInCycle);
}

/**
 * Get reward preview for the next 3 days (wrapping over 7-day cycle).
 * @param currentDay Current day in cycle (1..7)
 */
export function getUpcomingRewards(currentDay: number): CheckInReward[] {
  const upcoming: CheckInReward[] = [];
  for (let i = 1; i <= 3; i++) {
    const nextDay = ((currentDay + i - 1) % 7) + 1;
    upcoming.push(getCheckInReward(nextDay));
  }
  return upcoming;
}

/* -------------------------------------------------------------------------- */
/*                               Usage Guidance                               */
/* -------------------------------------------------------------------------- */
/*
  - Make the server the source of truth:
      1) Read the latest companion aggregate (last_check_in_at, total_check_ins, current_check_in_streak).
      2) Call canCheckInToday(last_check_in_at). If true, attempt insert.
      3) Let the DB's unique index (user_id, ((checked_in_at AT TIME ZONE 'UTC')::date)) enforce 1/day.

  - Race conditions:
      Even if two clients try at once, one insert will violate the unique index.
      Catch that error client-side and treat it as "already checked in today".

  - Midnight edges:
      Because we align on UTC, device local timezones and DST won't cause off-by-one
      errors relative to the DB.

  - If you ever change the DB index timezone, update CHECKIN_TZ accordingly.
*/
