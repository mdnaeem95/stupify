'use client';

import { useState } from 'react';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { SubscriptionSettings } from '@/components/settings/SubscriptionSettings';
import { PreferencesSettings } from '@/components/settings/PreferencesSettings';
import { UsageSettings } from '@/components/settings/UsageSettings';
import { CompanionSettingsWrapper } from '@/components/settings/CompanionSettingsWrapper';
import { Button } from '@/components/ui/button';
import { User, CreditCard, Settings as SettingsIcon, BarChart3, ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';

type TabType = 'account' | 'companion' | 'subscription' | 'preferences' | 'usage';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('account');

  const tabs = [
    { id: 'account' as TabType, label: 'Account', icon: User },
    { id: 'companion' as TabType, label: 'Companion', icon: Heart }, // Changed to Heart icon
    { id: 'subscription' as TabType, label: 'Subscription', icon: CreditCard },
    { id: 'preferences' as TabType, label: 'Preferences', icon: SettingsIcon },
    { id: 'usage' as TabType, label: 'Usage', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
            <Link href="/chat">
              <Button 
                variant="ghost"
                className="group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" strokeWidth={2} />
                Back to Chat
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar Navigation */}
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-indigo-50 to-violet-50 text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon 
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-700'
                    }`}
                    strokeWidth={2}
                  />
                  <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Content Area */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-8">
            {activeTab === 'account' && <AccountSettings />}
            {activeTab === 'companion' && <CompanionSettingsWrapper />}
            {activeTab === 'subscription' && <SubscriptionSettings />}
            {activeTab === 'preferences' && <PreferencesSettings />}
            {activeTab === 'usage' && <UsageSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}