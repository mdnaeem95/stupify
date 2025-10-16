'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Loader2, Crown, Settings, ChevronDown, CreditCard } from 'lucide-react';
import { getCurrentUser, signOut, type AuthUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      // Check premium status
      const supabase = createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', currentUser.id)
        .single();
      
      setIsPremium(profile?.subscription_status === 'premium');
    }
    
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
      setIsLoggingOut(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsOpeningPortal(true);
    
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open subscription management. Please try again.');
      setIsOpeningPortal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 text-black">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            {isPremium ? (
              <Crown className="w-4 h-4 text-yellow-300" />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          <span className="hidden sm:inline">{user.full_name || 'Account'}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div>
            <p className="font-medium">{user.full_name || 'User'}</p>
            <p className="text-xs text-gray-500 font-normal">{user.email}</p>
            {isPremium && (
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-xs font-semibold">
                <Crown className="w-3 h-3" />
                Premium
              </div>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Settings */}
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>

        {/* Manage Subscription or Upgrade */}
        {isPremium ? (
          <DropdownMenuItem 
            onClick={handleManageSubscription}
            disabled={isOpeningPortal}
          >
            {isOpeningPortal ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Billing
              </>
            )}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => router.push('/pricing')}>
            <Crown className="w-4 h-4 mr-2 text-yellow-500" />
            Upgrade to Premium
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}