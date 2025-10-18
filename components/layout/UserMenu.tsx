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
import { User, LogOut, Loader2, Crown, Settings, CreditCard, BarChart3, Sparkles } from 'lucide-react';
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create billing portal session');
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL returned from server');
      }
    } catch (error) {
      console.error('Portal error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to open subscription management. Please try again.';
      
      alert(errorMessage);
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
          variant="ghost" 
          className="w-full justify-start gap-3 h-auto p-3 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
        >
          <div className="relative flex-shrink-0">
            {isPremium && (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full blur-md opacity-40" />
            )}
            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
              isPremium 
                ? 'bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25' 
                : 'bg-gray-200'
            }`}>
              {isPremium ? (
                <Crown className="w-4 h-4 text-white" strokeWidth={2.5} />
              ) : (
                <User className="w-4 h-4 text-gray-600" strokeWidth={2} />
              )}
            </div>
          </div>
          
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-64 shadow-xl shadow-indigo-500/10"
      >
        <DropdownMenuLabel>
          <div className="flex items-center gap-3 py-1">
            <div className="relative flex-shrink-0">
              {isPremium && (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full blur-md opacity-40" />
              )}
              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
                isPremium 
                  ? 'bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25' 
                  : 'bg-gray-200'
              }`}>
                {isPremium ? (
                  <Crown className="w-4 h-4 text-white" strokeWidth={2.5} />
                ) : (
                  <User className="w-4 h-4 text-gray-600" strokeWidth={2} />
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {user.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 font-normal truncate">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={() => router.push('/settings')}
          className="cursor-pointer hover:bg-gray-50 transition-colors py-2.5 group"
        >
          <Settings className="w-4 h-4 mr-3 text-gray-600 group-hover:text-gray-900 transition-colors" strokeWidth={2} />
          <span className="flex-1 text-gray-700 group-hover:text-gray-900 transition-colors">Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => router.push('/stats')}
          className="cursor-pointer hover:bg-gray-50 transition-colors py-2.5 group"
        >
          <BarChart3 className="w-4 h-4 mr-3 text-gray-600 group-hover:text-gray-900 transition-colors" strokeWidth={2} />
          <span className="flex-1 text-gray-700 group-hover:text-gray-900 transition-colors">Your Stats</span>
        </DropdownMenuItem>

        {isPremium ? (
          <>
            <DropdownMenuItem 
              onClick={handleManageSubscription}
              disabled={isOpeningPortal}
              className="cursor-pointer hover:bg-gray-50 transition-colors py-2.5 group"
            >
              {isOpeningPortal ? (
                <>
                  <Loader2 className="w-4 h-4 mr-3 animate-spin text-gray-600" strokeWidth={2} />
                  <span className="flex-1 text-gray-700">Loading...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-3 text-gray-600 group-hover:text-gray-900 transition-colors" strokeWidth={2} />
                  <span className="flex-1 text-gray-700 group-hover:text-gray-900 transition-colors">Manage Billing</span>
                </>
              )}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem 
              onClick={() => router.push('/pricing')}
              className="cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-violet-50 transition-all py-2.5 group"
            >
              <div className="w-4 h-4 mr-3 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
              </div>
              <span className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent font-semibold">
                Upgrade to Premium
              </span>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="cursor-pointer hover:bg-red-50 transition-colors py-2.5 group"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="w-4 h-4 mr-3 animate-spin text-red-600" strokeWidth={2} />
              <span className="flex-1 text-red-600">Signing out...</span>
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4 mr-3 text-gray-600 group-hover:text-red-600 transition-colors" strokeWidth={2} />
              <span className="flex-1 text-gray-700 group-hover:text-red-600 transition-colors">Sign Out</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}