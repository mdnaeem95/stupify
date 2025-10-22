/* eslint-disable  @typescript-eslint/no-explicit-any */
/**
 * MESSAGE HISTORY PANEL - Phase 2, Day 14
 * 
 * Panel for viewing past companion messages.
 * 
 * Features:
 * - View all past messages
 * - Filter by trigger type
 * - Filter by date range
 * - Search messages
 * - Pagination
 * - Message stats
 * - Export history
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Search, Download, Sparkles, Loader2 } from 'lucide-react';
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
// ARCHETYPE COLORS
// ============================================================================

const ARCHETYPE_COLORS: Record<CompanionArchetype, string> = {
  mentor: 'text-purple-600 bg-purple-50 border-purple-200',
  friend: 'text-orange-600 bg-orange-50 border-orange-200',
  explorer: 'text-teal-600 bg-teal-50 border-teal-200',
};

const ARCHETYPE_ICONS: Record<CompanionArchetype, string> = {
  mentor: '🦉',
  friend: '🌟',
  explorer: '🧭',
};

// ============================================================================
// TRIGGER LABELS
// ============================================================================

const TRIGGER_LABELS: Record<MessageTrigger, string> = {
  greeting: 'Greeting',
  encouragement: 'Encouragement',
  milestone: 'Milestone',
  celebration: 'Celebration',
  streak_reminder: 'Streak Reminder',
  curiosity: 'Curiosity',
  topic_suggestion: 'Topic Suggestion',
  proactive: 'Check-in',
  question_asked: 'After Question',
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
  const archetypeIcon = ARCHETYPE_ICONS[archetype];

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

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{archetypeIcon}</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Message History
            </h2>
            <p className="text-gray-600 text-sm">
              {totalMessages} messages from {companionName}
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="flex gap-2">
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Trigger filter */}
          <Select
            value={filters.trigger || 'all'}
            onValueChange={(value: any) =>
              handleFilterChange('trigger', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All message types" />
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

        {/* Active filters */}
        {(filters.trigger || filters.search) && (
          <div className="flex gap-2 mt-3">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.trigger && (
              <Badge variant="secondary">
                {TRIGGER_LABELS[filters.trigger]}
              </Badge>
            )}
            {filters.search && (
              <Badge variant="secondary">
                Search: {filters.search}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters({ showDismissed: true });
                setSearchQuery('');
              }}
            >
              Clear all
            </Button>
          </div>
        )}
      </Card>

      {/* Messages list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No messages found</p>
          </Card>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * messagesPerPage + 1} -{' '}
            {Math.min(page * messagesPerPage, totalMessages)} of {totalMessages}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
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
  const archetypeColor = ARCHETYPE_COLORS[archetype];

  return (
    <Card
      className={cn(
        'p-4 transition-all hover:shadow-md',
        message.dismissed && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-2xl flex-shrink-0">
          {ARCHETYPE_ICONS[archetype]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900">
              {companionName}
            </span>
            <Badge
              variant="secondary"
              className={cn('text-xs', archetypeColor)}
            >
              {TRIGGER_LABELS[message.trigger]}
            </Badge>
            {message.wasProactive && (
              <Badge variant="outline" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Proactive
              </Badge>
            )}
            {message.dismissed && (
              <Badge variant="outline" className="text-xs text-gray-500">
                Dismissed
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-700 leading-relaxed">
            {message.content}
          </p>

          <p className="text-xs text-gray-500 mt-2">
            {formatDate(message.createdAt)}
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