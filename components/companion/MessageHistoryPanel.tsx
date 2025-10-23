/* eslint-disable  @typescript-eslint/no-explicit-any */
/**
 * MESSAGE HISTORY PANEL - Redesigned v2.0
 * 
 * Following STUPIFY Design Principles:
 * - NO EMOJIS (using Lucide icons)
 * - Clean card design with proper shadows
 * - Premium gradient accents
 * - Better typography hierarchy
 * - Mobile-first responsive
 * - Smooth transitions
 * 
 * Features:
 * - View all past messages
 * - Filter by trigger type
 * - Search messages
 * - Pagination with smooth transitions
 * - Message stats overview
 * - Export history
 * - Empty states with proper UX
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageCircle, 
  Search, 
  Download, 
  Sparkles, 
  Loader2,
  Brain,
  Heart,
  Compass,
  X,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { type CompanionArchetype } from '@/lib/companion/archetypes';
import { type MessageTrigger } from '@/lib/companion/personality-prompts';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface CompanionMessage {
  id: string;
  content: string;
  trigger: MessageTrigger;
  createdAt: Date;
  wasProactive: boolean;
  dismissed: boolean;
  context?: Record<string, any>;
}

export interface MessageHistoryPanelProps {
  companionId: string;
  companionName: string;
  archetype: CompanionArchetype;
  className?: string;
}

export interface MessageFilters {
  trigger?: MessageTrigger;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  showDismissed?: boolean;
}

// ============================================================================
// ARCHETYPE DESIGN SYSTEM (NO EMOJIS)
// ============================================================================

const ARCHETYPE_CONFIG = {
  mentor: {
    icon: Brain,
    gradient: 'from-purple-500 to-indigo-600',
    lightBg: 'from-purple-50 to-indigo-50',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconColor: 'text-purple-600',
  },
  friend: {
    icon: Heart,
    gradient: 'from-orange-500 to-pink-500',
    lightBg: 'from-orange-50 to-pink-50',
    textColor: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    iconColor: 'text-pink-600',
  },
  explorer: {
    icon: Compass,
    gradient: 'from-teal-500 to-emerald-600',
    lightBg: 'from-teal-50 to-emerald-50',
    textColor: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    iconColor: 'text-teal-600',
  },
};

// ============================================================================
// TRIGGER LABELS & ICONS
// ============================================================================

const TRIGGER_CONFIG: Record<MessageTrigger, { label: string; icon: any }> = {
  greeting: { label: 'Greeting', icon: MessageCircle },
  encouragement: { label: 'Encouragement', icon: TrendingUp },
  milestone: { label: 'Milestone', icon: Sparkles },
  celebration: { label: 'Celebration', icon: Sparkles },
  streak_reminder: { label: 'Streak Reminder', icon: Calendar },
  curiosity: { label: 'Curiosity', icon: Brain },
  topic_suggestion: { label: 'Topic Suggestion', icon: MessageCircle },
  proactive: { label: 'Check-in', icon: Heart },
  question_asked: { label: 'After Question', icon: MessageCircle },
};

// ============================================================================
// COMPONENT
// ============================================================================

export function MessageHistoryPanel({
  companionId,
  companionName,
  archetype,
  className,
}: MessageHistoryPanelProps) {
  const [messages, setMessages] = useState<CompanionMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<MessageFilters>({
    showDismissed: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);

  const messagesPerPage = 20;
  const config = ARCHETYPE_CONFIG[archetype];
  const CompanionIcon = config.icon;

  // Fetch messages
  useEffect(() => {
    fetchMessages();
  }, [companionId, filters, page]);

  const fetchMessages = async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: messagesPerPage.toString(),
      });

      if (filters.trigger) {
        params.append('trigger', filters.trigger);
      }
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo.toISOString());
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (!filters.showDismissed) {
        params.append('excludeDismissed', 'true');
      }

      const response = await fetch(
        `/api/companion/messages/history?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();

      setMessages(data.messages || []);
      setTotalMessages(data.total || 0);
    } catch (error) {
      console.error('[HISTORY] Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (key: keyof MessageFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page
  };

  // Handle search
  const handleSearch = () => {
    handleFilterChange('search', searchQuery);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({ showDismissed: true });
    setSearchQuery('');
  };

  // Export history
  const handleExport = async () => {
    try {
      const response = await fetch('/api/companion/messages/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `companion-messages-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('[HISTORY] Error exporting:', error);
    }
  };

  const totalPages = Math.ceil(totalMessages / messagesPerPage);
  const hasActiveFilters = !!(filters.trigger || filters.search);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with stats */}
      <Card className={cn(
        'relative overflow-hidden p-6 bg-gradient-to-br',
        config.lightBg
      )}>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Icon with gradient */}
            <div className={cn(
              'p-3 rounded-2xl bg-gradient-to-br shadow-lg',
              config.gradient
            )}>
              <CompanionIcon className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Message History
              </h3>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{totalMessages}</span> messages from {companionName}
              </p>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            className="font-semibold"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Filters - Clean design */}
      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search - takes more space */}
          <div className="md:col-span-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="text-gray-900 pl-10 py-6 rounded-xl border-gray-200 focus:border-indigo-300 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Trigger filter */}
          <div className="md:col-span-4">
            <Select
              value={filters.trigger || 'all'}
              onValueChange={(value: any) =>
                handleFilterChange('trigger', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-white font-medium text-gray-900">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All message types</SelectItem>
                <SelectItem value="greeting">Greeting</SelectItem>
                <SelectItem value="encouragement">Encouragement</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
                <SelectItem value="celebration">Celebration</SelectItem>
                <SelectItem value="topic_suggestion">Topic Suggestion</SelectItem>
                <SelectItem value="curiosity">Curiosity</SelectItem>
                <SelectItem value="proactive">Check-in</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-600">Filters:</span>
            <div className="flex-1 flex flex-wrap gap-2">
              {filters.trigger && (
                <Badge 
                  variant="secondary" 
                  className="px-3 py-1.5 rounded-lg font-medium"
                >
                  {TRIGGER_CONFIG[filters.trigger].label}
                  <button
                    onClick={() => handleFilterChange('trigger', undefined)}
                    className="ml-2 hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.search && (
                <Badge 
                  variant="secondary"
                  className="px-3 py-1.5 rounded-lg font-medium"
                >
                  Search: &quot;{filters.search}&quot;
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      handleFilterChange('search', undefined);
                    }}
                    className="ml-2 hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="font-semibold"
            >
              Clear all
            </Button>
          </div>
        )}
      </Card>

      {/* Messages list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-2xl rounded-full" />
              <Loader2 className="relative w-10 h-10 animate-spin text-indigo-600" />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <EmptyState 
            hasFilters={hasActiveFilters} 
            onClearFilters={clearAllFilters}
            archetype={archetype}
          />
        ) : (
          messages.map((message) => (
            <MessageHistoryItem
              key={message.id}
              message={message}
              companionName={companionName}
              archetype={archetype}
            />
          ))
        )}
      </div>

      {/* Pagination - Clean design */}
      {totalPages > 1 && !isLoading && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{(page - 1) * messagesPerPage + 1}</span> - <span className="font-semibold text-gray-900">{Math.min(page * messagesPerPage, totalMessages)}</span> of <span className="font-semibold text-gray-900">{totalMessages}</span>
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="font-semibold"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="font-semibold"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// MESSAGE ITEM SUB-COMPONENT
// ============================================================================

interface MessageHistoryItemProps {
  message: CompanionMessage;
  companionName: string;
  archetype: CompanionArchetype;
}

function MessageHistoryItem({
  message,
  companionName,
  archetype,
}: MessageHistoryItemProps) {
  const config = ARCHETYPE_CONFIG[archetype];
  const CompanionIcon = config.icon;
  const triggerConfig = TRIGGER_CONFIG[message.trigger];
  const TriggerIcon = triggerConfig.icon;

  return (
    <Card
      className={cn(
        'p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
        message.dismissed && 'opacity-50'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon with gradient background */}
        <div className="flex-shrink-0">
          <div className={cn(
            'p-2.5 rounded-xl bg-gradient-to-br shadow-md',
            config.gradient
          )}>
            <CompanionIcon className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header with name and badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-gray-900">
              {companionName}
            </span>
            
            {/* Trigger badge */}
            <Badge
              variant="secondary"
              className={cn(
                'px-3 py-1 rounded-lg font-medium gap-1.5',
                config.bgColor,
                config.textColor
              )}
            >
              <TriggerIcon className="w-3.5 h-3.5" />
              {triggerConfig.label}
            </Badge>

            {/* Proactive badge */}
            {message.wasProactive && (
              <Badge 
                variant="outline" 
                className="px-3 py-1 rounded-lg font-medium gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Proactive
              </Badge>
            )}

            {/* Dismissed badge */}
            {message.dismissed && (
              <Badge 
                variant="outline" 
                className="px-3 py-1 rounded-lg font-medium text-gray-500"
              >
                Dismissed
              </Badge>
            )}
          </div>

          {/* Message content */}
          <p className="text-base text-gray-700 leading-relaxed">
            {message.content}
          </p>

          {/* Timestamp */}
          <p className="text-sm text-gray-500 font-medium">
            {formatDate(message.createdAt)}
          </p>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// EMPTY STATE SUB-COMPONENT
// ============================================================================

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  archetype: CompanionArchetype;
}

function EmptyState({ hasFilters, onClearFilters, archetype }: EmptyStateProps) {
  const config = ARCHETYPE_CONFIG[archetype];

  if (hasFilters) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 blur-2xl rounded-full opacity-30" />
            <div className="relative bg-gray-100 p-6 rounded-3xl">
              <Search className="w-12 h-12 text-gray-400" strokeWidth={2} />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">
              No messages found
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Try adjusting your filters or search query
            </p>
          </div>

          <Button
            variant="outline"
            onClick={onClearFilters}
            className="font-semibold"
          >
            Clear all filters
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'relative overflow-hidden p-12 text-center bg-gradient-to-br',
      config.lightBg
    )}>
      <div className="relative max-w-md mx-auto space-y-4">
        <div className="relative inline-block">
          <div className={cn(
            'absolute inset-0 blur-3xl rounded-full opacity-30 bg-gradient-to-br',
            config.gradient
          )} />
          <div className={cn(
            'relative p-6 rounded-3xl bg-gradient-to-br',
            config.gradient
          )}>
            <MessageCircle className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">
            No messages yet
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Your companion will send you messages as you learn together. Check back soon!
          </p>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}