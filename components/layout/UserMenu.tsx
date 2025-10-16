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
import { User, LogOut, Loader2, Crown, Settings, ChevronDown, CreditCard, BarChart3 } from 'lucide-react';
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
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-12 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer"
        >
          <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            {isPremium ? (
              <Crown className="w-4 h-4 text-yellow-300" />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{user.full_name || 'User'}</p>
              <p className="text-xs text-gray-500 font-normal">{user.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Settings */}
        <DropdownMenuItem 
          onClick={() => router.push('/settings')}
          className="cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>

        {/* Stats */}
        <DropdownMenuItem 
          onClick={() => router.push('/stats')}
          className="cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Your Stats
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Manage Subscription or Upgrade */}
        {isPremium ? (
          <DropdownMenuItem 
            onClick={handleManageSubscription}
            disabled={isOpeningPortal}
            className="cursor-pointer hover:bg-gray-100 transition-colors"
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
          <DropdownMenuItem 
            onClick={() => router.push('/pricing')}
            className="cursor-pointer hover:bg-purple-50 transition-colors"
          >
            <Crown className="w-4 h-4 mr-2 text-yellow-500" />
            Upgrade to Premium
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="cursor-pointer hover:bg-red-50 transition-colors"
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