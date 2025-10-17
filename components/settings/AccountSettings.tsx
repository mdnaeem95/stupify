'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, User, Key, Trash2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
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
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
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
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Account Information</h2>
        <p className="text-gray-600 leading-relaxed">Manage your personal information and account settings</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`flex items-start gap-3 p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
            : 'bg-gradient-to-r from-red-50 to-pink-50'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
          )}
          <p className={`text-sm font-medium ${
            message.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-3">
        <Label htmlFor="fullName" className="flex items-center gap-2 text-gray-700 font-semibold">
          <User className="w-4 h-4 text-gray-500" strokeWidth={2} />
          Full Name
        </Label>
        <div className="flex gap-3">
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="flex-1 text-gray-600"
          />
          <Button 
            onClick={handleSaveName}
            disabled={isSaving || !fullName.trim()}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={2} />
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
        <Label htmlFor="email" className="flex items-center gap-2 text-gray-700 font-semibold">
          <Mail className="w-4 h-4 text-gray-500" strokeWidth={2} />
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          disabled
          className="bg-gray-50 cursor-not-allowed text-gray-600"
        />
        <p className="text-sm text-gray-500 leading-relaxed">
          Email cannot be changed. Contact support if you need to update it.
        </p>
      </div>

      {/* Change Password */}
      <div className="space-y-4 pt-6 border-t border-gray-100">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-gray-700 font-semibold">
            <Key className="w-4 h-4 text-gray-500" strokeWidth={2} />
            Password
          </Label>
          <p className="text-sm text-gray-600 leading-relaxed">
            We&apos;ll send a password reset link to your email address.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleChangePassword}
          className="hover:bg-gray-50 transition-colors"
        >
          Send Password Reset Email
        </Button>
      </div>

      {/* Delete Account */}
      <div className="space-y-4 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <AlertTriangle className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Danger Zone</h3>
            <p className="text-sm text-gray-600">Permanent account deletion</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 leading-relaxed">
          Once you delete your account, there is no going back. This will permanently delete:
        </p>
        
        <ul className="text-sm text-gray-700 space-y-2 pl-1">
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-1">•</span>
            <span>All your conversations and questions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-1">•</span>
            <span>Your subscription and billing history</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-1">•</span>
            <span>Your achievements and streak data</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-1">•</span>
            <span>Your saved explanations and shared cards</span>
          </li>
        </ul>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive"
              className="mt-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30"
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" strokeWidth={2} />
              Delete My Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="leading-relaxed">
                This action cannot be undone. This will permanently delete your account
                and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={2} />
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