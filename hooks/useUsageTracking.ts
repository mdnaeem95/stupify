import { useState, useCallback, useEffect } from 'react';
import { getUserUsage, incrementUsage, type UsageData } from '@/lib/usage';

export function useUsageTracking() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  // Load usage data
  const loadUsage = useCallback(async () => {
    const usageData = await getUserUsage();
    setUsage(usageData);
  }, []);

  // Check if user can ask a question
  const checkCanAsk = useCallback(async () => {
    const currentUsage = await getUserUsage();
    
    if (!currentUsage.canAsk) {
      console.warn('⚠️ Usage limit reached, showing paywall');
      setShowPaywall(true);
      return false;
    }

    return true;
  }, []);

  // Increment usage count
  const increment = useCallback(async () => {
    const incremented = await incrementUsage();
    if (incremented) {
      await loadUsage();
    } else {
      console.error('❌ Failed to increment usage');
    }
    return incremented;
  }, [loadUsage]);

  // Load usage on mount
  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  return {
    usage,
    showPaywall,
    setShowPaywall,
    loadUsage,
    checkCanAsk,
    increment,
  };
}