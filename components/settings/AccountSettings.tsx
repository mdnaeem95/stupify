'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, User, Key, Trash2, AlertTriangle } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function AccountSettings() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      if (user) {
        setFullName(user.full_name || '');
        setEmail(user.email || '');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveName = async () => {
    setIsSaving(true);
    setMessage(null);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Name updated successfully!' });
    } catch (error) {
      console.error('Failed to update name:', error);
      setMessage({ type: 'error', text: 'Failed to update name. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: 'Password reset email sent! Check your inbox.' 
      });
    } catch (error) {
      console.error('Failed to send reset email:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to send reset email. Please try again.' 
      });
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      // Call API to delete account and all associated data
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete account');

      // Sign out and redirect
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete account:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to delete account. Please contact support.' 
      });
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Information</h2>
        <p className="text-gray-600">Manage your personal information and account settings</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-3">
        <Label htmlFor="fullName" className="flex items-center gap-2 text-gray-700">
          <User className="w-4 h-4" />
          Full Name
        </Label>
        <div className="flex gap-3">
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="flex-1"
          />
          <Button 
            onClick={handleSaveName}
            disabled={isSaving || !fullName.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </div>

      {/* Email (Read-only) */}
      <div className="space-y-3">
        <Label htmlFor="email" className="flex items-center gap-2 text-gray-700">
          <Mail className="w-4 h-4" />
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          disabled
          className="bg-gray-50 cursor-not-allowed"
        />
        <p className="text-sm text-gray-500">
          Email cannot be changed. Contact support if you need to update it.
        </p>
      </div>

      {/* Change Password */}
      <div className="space-y-3 pt-6 border-t border-gray-200">
        <Label className="flex items-center gap-2 text-gray-700">
          <Key className="w-4 h-4" />
          Password
        </Label>
        <p className="text-sm text-gray-600 mb-3">
          We&apos;ll send a password reset link to your email address.
        </p>
        <Button 
          variant="outline" 
          onClick={handleChangePassword}
          className="border-gray-300"
        >
          Send Password Reset Email
        </Button>
      </div>

      {/* Delete Account */}
      <div className="space-y-3 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Danger Zone</h3>
        </div>
        <p className="text-sm text-gray-600">
          Once you delete your account, there is no going back. This will permanently delete:
        </p>
        <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
          <li>All your conversations and questions</li>
          <li>Your subscription and billing history</li>
          <li>Your achievements and streak data</li>
          <li>Your saved explanations and shared cards</li>
        </ul>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive"
              className="mt-4 bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete My Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Yes, Delete My Account'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}