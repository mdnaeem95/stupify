'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Baby, MessageSquare, GraduationCap, Bell, Save } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';

type SimplicityLevel = '5yo' | 'normal' | 'advanced';

export function PreferencesSettings() {
  const [preferredLevel, setPreferredLevel] = useState<SimplicityLevel>('normal');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [achievementNotifications, setAchievementNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const supabase = createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferred_level, email_notifications, streak_reminders, achievement_notifications')
        .eq('id', user.id)
        .single();

      if (profile) {
        setPreferredLevel((profile.preferred_level || 'normal') as SimplicityLevel);
        setEmailNotifications(profile.email_notifications ?? true);
        setStreakReminders(profile.streak_reminders ?? true);
        setAchievementNotifications(profile.achievement_notifications ?? true);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    setMessage(null);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ 
          preferred_level: preferredLevel,
          email_notifications: emailNotifications,
          streak_reminders: streakReminders,
          achievement_notifications: achievementNotifications,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const levels = [
    {
      id: '5yo' as SimplicityLevel,
      icon: Baby,
      label: 'Explain Like I\'m 5',
      description: 'Super simple explanations using everyday words',
      color: 'from-pink-500 to-orange-500',
    },
    {
      id: 'normal' as SimplicityLevel,
      icon: MessageSquare,
      label: 'Normal',
      description: 'Balanced explanations for everyday learning',
      color: 'from-purple-500 to-blue-500',
    },
    {
      id: 'advanced' as SimplicityLevel,
      icon: GraduationCap,
      label: 'Advanced',
      description: 'Detailed technical explanations with terminology',
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Preferences</h2>
        <p className="text-gray-600">Customize your learning experience</p>
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

      {/* Default Simplicity Level */}
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-semibold text-gray-900">
            Default Simplicity Level
          </Label>
          <p className="text-sm text-gray-600 mt-1">
            Choose how you&apos;d like answers explained by default. You can always change this for individual questions.
          </p>
        </div>

        <div className="grid gap-4">
          {levels.map((level) => {
            const Icon = level.icon;
            const isSelected = preferredLevel === level.id;
            
            return (
              <button
                key={level.id}
                onClick={() => setPreferredLevel(level.id)}
                className={`
                  p-4 rounded-xl border-2 transition-all text-left
                  ${isSelected 
                    ? 'border-purple-500 bg-purple-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    bg-gradient-to-br ${level.color}
                  `}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{level.label}</h3>
                      {isSelected && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                  </div>

                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${isSelected 
                      ? 'border-purple-500 bg-purple-500' 
                      : 'border-gray-300'
                    }
                  `}>
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Email Notifications */}
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-700" />
          <Label className="text-lg font-semibold text-gray-900">
            Email Notifications
          </Label>
        </div>
        
        <p className="text-sm text-gray-600">
          Choose what updates you&apos;d like to receive via email.
        </p>

        <div className="space-y-3">
          {/* General Email Notifications */}
          <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <div>
              <div className="font-medium text-gray-900">All Email Notifications</div>
              <div className="text-sm text-gray-600">Receive all email updates from Stupify</div>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
          </label>

          {/* Streak Reminders */}
          <label className={`flex items-center justify-between p-4 rounded-lg border border-gray-200 cursor-pointer ${
            emailNotifications ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
          }`}>
            <div>
              <div className="font-medium text-gray-900">Streak Reminders</div>
              <div className="text-sm text-gray-600">Get reminded when you&apos;re about to lose your streak</div>
            </div>
            <input
              type="checkbox"
              checked={streakReminders}
              onChange={(e) => setStreakReminders(e.target.checked)}
              disabled={!emailNotifications}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 disabled:opacity-50"
            />
          </label>

          {/* Achievement Notifications */}
          <label className={`flex items-center justify-between p-4 rounded-lg border border-gray-200 cursor-pointer ${
            emailNotifications ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
          }`}>
            <div>
              <div className="font-medium text-gray-900">Achievement Unlocks</div>
              <div className="text-sm text-gray-600">Celebrate when you unlock new achievements</div>
            </div>
            <input
              type="checkbox"
              checked={achievementNotifications}
              onChange={(e) => setAchievementNotifications(e.target.checked)}
              disabled={!emailNotifications}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 disabled:opacity-50"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-6 border-t border-gray-200">
        <Button
          onClick={handleSavePreferences}
          disabled={isSaving}
          className="bg-purple-600 hover:bg-purple-700 px-8"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}