'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { User, LogOut, Loader2 } from 'lucide-react';
import { getCurrentUser, signOut, type AuthUser } from '@/lib/auth';

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
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
    <div className="flex items-center gap-3">
      {/* User Info */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="text-sm">
          <p className="font-medium text-gray-900">{user.full_name || 'User'}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Logout Button */}
      <Button
        onClick={handleSignOut}
        variant="outline"
        disabled={isLoggingOut}
        className="flex items-center gap-2"
      >
        {isLoggingOut ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="hidden sm:inline">Signing out...</span>
          </>
        ) : (
          <>
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </>
        )}
      </Button>
    </div>
  );
}