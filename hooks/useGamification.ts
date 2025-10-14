/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback } from 'react';

// Hook for streak data
export function useStreak() {
  const [streak, setStreak] = useState<{
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string | null;
    calendar: { date: string; active: boolean }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    try {
      const response = await fetch('/api/gamification/streak');
      if (response.ok) {
        const data = await response.json();
        setStreak(data);
      }
    } catch (error) {
      console.error('Failed to fetch streak:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return { streak, isLoading, refetch: fetchStreak };
}

// Hook for achievements
export function useAchievements() {
  const [achievements, setAchievements] = useState<{
    all: any[];
    byCategory: Record<string, any[]>;
    stats: { total: number; unlocked: number; percentage: number };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    try {
      const response = await fetch('/api/gamification/achievements');
      if (response.ok) {
        const data = await response.json();
        setAchievements(data);
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkNewAchievements = useCallback(async () => {
    try {
      const response = await fetch('/api/gamification/achievements/check', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        return data.newAchievements || [];
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
    return [];
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return { 
    achievements, 
    isLoading, 
    refetch: fetchAchievements,
    checkNewAchievements,
  };
}

// Hook for stats
export function useStats() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/gamification/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, refetch: fetchStats };
}

// Combined hook for gamification features
export function useGamification() {
  const { streak, refetch: refetchStreak } = useStreak();
  const { achievements, refetch: refetchAchievements, checkNewAchievements } = useAchievements();
  const { stats, refetch: refetchStats } = useStats();

  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchStreak(),
      refetchAchievements(),
      refetchStats(),
    ]);
  }, [refetchStreak, refetchAchievements, refetchStats]);

  return {
    streak,
    achievements,
    stats,
    refetchAll,
    checkNewAchievements,
  };
}

// Hook for checking milestones after questions
export function useQuestionTracking() {
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  const [milestoneReached, setMilestoneReached] = useState<number | null>(null);

  const trackQuestion = useCallback(async () => {
    try {
      // Check for new achievements
      const response = await fetch('/api/gamification/achievements/check', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.newAchievements && data.newAchievements.length > 0) {
          setNewAchievements(data.newAchievements);
        }
      }

      // Check streak for milestones
      const streakResponse = await fetch('/api/gamification/streak');
      if (streakResponse.ok) {
        const streakData = await streakResponse.json();
        const milestones = [3, 7, 30, 100];
        if (milestones.includes(streakData.currentStreak)) {
          setMilestoneReached(streakData.currentStreak);
        }
      }
    } catch (error) {
      console.error('Failed to track question:', error);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNewAchievements([]);
    setMilestoneReached(null);
  }, []);

  return {
    newAchievements,
    milestoneReached,
    trackQuestion,
    clearNotifications,
  };
}

export function useGamificationNotifications() {
  const [pendingAchievement, setPendingAchievement] = useState<any>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<number | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);

  // Check for new achievements and milestones after a question
  const checkNotifications = useCallback(async () => {
    try {
      // Check for new achievements
      const achievementResponse = await fetch('/api/gamification/achievements/check', {
        method: 'POST',
      });

      if (achievementResponse.ok) {
        const achievementData = await achievementResponse.json();
        if (achievementData.newAchievements && achievementData.newAchievements.length > 0) {
          // Show first new achievement
          setPendingAchievement(achievementData.newAchievements[0]);
          setShowAchievementModal(true);
        }
      }

      // Check streak for milestones
      const streakResponse = await fetch('/api/gamification/streak');
      if (streakResponse.ok) {
        const streakData = await streakResponse.json();
        const milestones = [3, 7, 30, 100];
        
        // Check if current streak is a milestone (and we haven't shown it yet)
        if (milestones.includes(streakData.currentStreak)) {
          // Only show if it's a new milestone (current === longest means just achieved)
          if (streakData.currentStreak === streakData.longestStreak) {
            setCurrentMilestone(streakData.currentStreak);
            setShowMilestoneModal(true);
          }
        }
      }
    } catch (error) {
      console.error('Failed to check notifications:', error);
    }
  }, []);

  const closeAchievementModal = useCallback(() => {
    setShowAchievementModal(false);
    setPendingAchievement(null);
  }, []);

  const closeMilestoneModal = useCallback(() => {
    setShowMilestoneModal(false);
    setCurrentMilestone(null);
  }, []);

  const closeAll = useCallback(() => {
    closeAchievementModal();
    closeMilestoneModal();
  }, [closeAchievementModal, closeMilestoneModal]);

  return {
    // Achievement modal state
    pendingAchievement,
    showAchievementModal,
    closeAchievementModal,
    
    // Milestone modal state
    currentMilestone,
    showMilestoneModal,
    closeMilestoneModal,
    
    // Actions
    checkNotifications,
    closeAll,
  };
}