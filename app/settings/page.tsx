'use client';

import { useState } from 'react';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { SubscriptionSettings } from '@/components/settings/SubscriptionSettings';
import { PreferencesSettings } from '@/components/settings/PreferencesSettings';
import { UsageSettings } from '@/components/settings/UsageSettings';
import { Button } from '@/components/ui/button';
import { User, CreditCard, Settings as SettingsIcon, BarChart3 } from 'lucide-react';
import Link from 'next/link';

type TabType = 'account' | 'subscription' | 'preferences' | 'usage';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('account');

  const tabs = [
    { id: 'account' as TabType, label: 'Account', icon: User },
    { id: 'subscription' as TabType, label: 'Subscription', icon: CreditCard },
    { id: 'preferences' as TabType, label: 'Preferences', icon: SettingsIcon },
    { id: 'usage' as TabType, label: 'Usage', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account and preferences</p>
            </div>
            <Link href="/chat">
              <Button variant="outline">
                Back to Chat
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar Navigation */}
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                    ${isActive 
                      ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Content Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {activeTab === 'account' && <AccountSettings />}
            {activeTab === 'subscription' && <SubscriptionSettings />}
            {activeTab === 'preferences' && <PreferencesSettings />}
            {activeTab === 'usage' && <UsageSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}