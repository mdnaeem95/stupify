'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Baby, MessageSquare, GraduationCap, Bell, Save, CheckCircle2, XCircle } from 'lucide-react';
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" strokeWidth={2} />
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
      color: 'from-indigo-500 to-violet-500',
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
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Preferences</h2>
        <p className="text-gray-600 leading-relaxed">Customize your learning experience</p>
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

      {/* Default Simplicity Level */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-lg font-semibold text-gray-900">
            Default Simplicity Level
          </Label>
          <p className="text-sm text-gray-600 leading-relaxed">
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
                  group p-5 rounded-2xl transition-all text-left cursor-pointer
                  ${isSelected 
                    ? 'bg-gradient-to-br from-indigo-50 to-violet-50 shadow-lg shadow-indigo-500/10' 
                    : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    relative w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                    bg-gradient-to-br ${level.color} shadow-lg
                    ${isSelected ? 'shadow-indigo-500/20' : 'shadow-gray-500/20'}
                    ${!isSelected && 'group-hover:scale-105 transition-transform'}
                  `}>
                    <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{level.label}</h3>
                      {isSelected && (
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                          Active
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{level.description}</p>
                  </div>

                  <div className={`
                    w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                    ${isSelected 
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30' 
                      : 'bg-gray-200'
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
      <div className="space-y-4 pt-6 border-t border-gray-100">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-gray-600" strokeWidth={2} />
            <Label className="text-lg font-semibold text-gray-900">
              Email Notifications
            </Label>
          </div>
          
          <p className="text-sm text-gray-600 leading-relaxed">
            Choose what updates you&apos;d like to receive via email.
          </p>
        </div>

        <div className="space-y-3">
          {/* General Email Notifications */}
          <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
            <div>
              <div className="font-semibold text-gray-900">All Email Notifications</div>
              <div className="text-sm text-gray-600 leading-relaxed">Receive all email updates from Stupify</div>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
            />
          </label>

          {/* Streak Reminders */}
          <label className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
            emailNotifications 
              ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer' 
              : 'bg-gray-50 opacity-50 cursor-not-allowed'
          }`}>
            <div>
              <div className="font-semibold text-gray-900">Streak Reminders</div>
              <div className="text-sm text-gray-600 leading-relaxed">Get reminded when you&apos;re about to lose your streak</div>
            </div>
            <input
              type="checkbox"
              checked={streakReminders}
              onChange={(e) => setStreakReminders(e.target.checked)}
              disabled={!emailNotifications}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
            />
          </label>

          {/* Achievement Notifications */}
          <label className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
            emailNotifications 
              ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer' 
              : 'bg-gray-50 opacity-50 cursor-not-allowed'
          }`}>
            <div>
              <div className="font-semibold text-gray-900">Achievement Unlocks</div>
              <div className="text-sm text-gray-600 leading-relaxed">Celebrate when you unlock new achievements</div>
            </div>
            <input
              type="checkbox"
              checked={achievementNotifications}
              onChange={(e) => setAchievementNotifications(e.target.checked)}
              disabled={!emailNotifications}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-6 border-t border-gray-100">
        <Button
          onClick={handleSavePreferences}
          disabled={isSaving}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all px-8 cursor-pointer"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={2} />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" strokeWidth={2} />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}