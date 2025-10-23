// ============================================================================
// STUPIFY AI COMPANION FEATURE - COMPANION CARD
// Created: October 22, 2025
// Updated: October 23, 2025 (Phase 3 - Stats added)
// Version: 1.1
// Description: Expanded view of companion (modal/dialog)
// ============================================================================

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Edit2, Check, X, MessageCircle, TrendingUp, Award, Heart } from 'lucide-react';
import { ARCHETYPE_DESCRIPTIONS, type Companion } from '@/lib/companion/types';
import { XPProgressBar } from './XPProgressBar';
import { CompanionMessageList } from './CompanionMessage';
import CompanionStats from './stats/CompanionStats';
import type { CompanionArchetype, CompanionMessage, LevelProgress } from '@/lib/companion/types';

interface CompanionCardProps {
  isOpen: boolean;
  onClose: () => void;
  companion: Companion;
  progress: LevelProgress;
  messages?: CompanionMessage[];
  stats?: {
    total_messages: number;
    total_interactions: number;
    questions_asked: number;
  };
  onUpdateCompanion?: (updates: { name?: string; archetype?: CompanionArchetype }) => Promise<void>;
  onMarkMessageAsRead?: (messageId: string) => void;
}

const ARCHETYPE_ICONS = {
  mentor: '🧙‍♂️',
  friend: '🤗',
  explorer: '🚀',
};

/**
 * CompanionCard - Expanded view of companion
 * 
 * Features:
 * - Companion details and stats
 * - Edit name and archetype
 * - View message history
 * - Level progress
 * - Interaction stats (Phase 3)
 * - Companion stats (happiness, energy, knowledge)
 * - Tabbed interface
 */
export function CompanionCard({
  isOpen,
  onClose,
  companion,
  progress,
  messages = [],
  stats,
  onUpdateCompanion,
  onMarkMessageAsRead,
}: CompanionCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(companion.name);
  const [selectedArchetype, setSelectedArchetype] = useState(companion.archetype);
  const [isUpdating, setIsUpdating] = useState(false);

  const icon = ARCHETYPE_ICONS[companion.archetype];

  // Handle name save
  const handleSaveName = async () => {
    if (!editedName.trim() || !onUpdateCompanion) return;
    
    setIsUpdating(true);
    try {
      await onUpdateCompanion({ name: editedName.trim() });
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to update name:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle archetype change
  const handleArchetypeChange = async (newArchetype: string) => {
    if (!onUpdateCompanion) return;
    
    setIsUpdating(true);
    try {
      if (newArchetype in ARCHETYPE_DESCRIPTIONS) {
        await onUpdateCompanion({ archetype: newArchetype as CompanionArchetype });
        setSelectedArchetype(newArchetype as CompanionArchetype);
      }
      setSelectedArchetype(newArchetype as typeof companion.archetype);
    } catch (error) {
      console.error('Failed to update archetype:', error);
      setSelectedArchetype(companion.archetype); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Companion Profile</DialogTitle>
          <DialogDescription>View and manage your AI companion</DialogDescription>
        </DialogHeader>
        
        {/* Header with gradient background */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 p-8 text-white">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
          </div>

          {/* Header content */}
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Companion avatar */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-lg"
              >
                <span className="text-5xl">{icon}</span>
              </motion.div>

              {/* Name and level */}
              <div>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') {
                          setIsEditingName(false);
                          setEditedName(companion.name);
                        }
                      }}
                      className="h-8 w-40 bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/50"
                      placeholder="Companion name"
                      maxLength={50}
                      disabled={isUpdating}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSaveName}
                      disabled={isUpdating || !editedName.trim()}
                      className="h-8 w-8 p-0 text-white hover:bg-white/20"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsEditingName(false);
                        setEditedName(companion.name);
                      }}
                      disabled={isUpdating}
                      className="h-8 w-8 p-0 text-white hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="group flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <h2 className="text-2xl font-bold">{companion.name}</h2>
                    <Edit2 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                    Level {companion.level}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 capitalize">
                    {companion.current_avatar}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Sparkle decoration */}
            <Sparkles className="h-6 w-6" strokeWidth={2} />
          </div>

          {/* XP Progress */}
          <div className="relative mt-6">
            <XPProgressBar
              progress={progress}
              showLabel={false}
              showXPNumbers={true}
              size="md"
              className="[&_.bg-gray-200]:bg-white/20 [&_.bg-gradient-to-r]:!bg-white"
            />
          </div>
        </div>

        {/* Tabbed content */}
        <Tabs defaultValue="overview" className="flex-1 overflow-hidden">
          <div className="border-b px-6">
            <TabsList className="grid w-full grid-cols-3 bg-transparent">
              <TabsTrigger value="overview" className="gap-2">
                <Heart className="h-4 w-4" strokeWidth={2} />
                Overview
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2">
                <MessageCircle className="h-4 w-4" strokeWidth={2} />
                Messages
                {messages.filter(m => !m.was_read).length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 min-w-5 p-0 text-xs">
                    {messages.filter(m => !m.was_read).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="stats" className="gap-2">
                <TrendingUp className="h-4 w-4" strokeWidth={2} />
                Stats
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 300px)' }}>
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              {/* Companion Stats (Phase 3) */}
              <div>
                <h3 className="mb-4 text-base font-bold text-gray-900">
                  Companion Stats
                </h3>
                <CompanionStats
                  happiness={companion.happiness}
                  energy={companion.energy}
                  knowledge={companion.knowledge}
                />
              </div>

              {/* Personality */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
                  <Award className="h-5 w-5" strokeWidth={2} />
                  Personality
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(ARCHETYPE_DESCRIPTIONS).map(([archetype, description]) => {
                    const archetypeIcon = ARCHETYPE_ICONS[archetype as keyof typeof ARCHETYPE_ICONS];
                    const isSelected = selectedArchetype === archetype;
                    
                    return (
                      <button
                        key={archetype}
                        onClick={() => handleArchetypeChange(archetype)}
                        disabled={isUpdating}
                        className={`
                          relative overflow-hidden rounded-2xl p-4 text-left
                          transition-all duration-300
                          ${isSelected
                            ? 'bg-gradient-to-br from-indigo-50 to-violet-50 shadow-lg hover:shadow-xl'
                            : 'bg-white hover:shadow-lg hover:shadow-gray-100/50 hover:-translate-y-0.5'
                          }
                        `}
                      >
                        <div className="text-3xl mb-2">{archetypeIcon}</div>
                        <div className="font-bold text-gray-900 capitalize mb-1 text-sm">
                          {archetype}
                        </div>
                        <div className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                          {description}
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-indigo-600 rounded-full p-0.5">
                            <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Favorite Topics */}
              {companion.favorite_topics && companion.favorite_topics.length > 0 && (
                <div>
                  <h3 className="mb-3 text-base font-bold text-gray-900">
                    Favorite Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {companion.favorite_topics.slice(0, 10).map((topic, index) => (
                      <Badge key={index} variant="secondary" className="font-medium">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Journey Stats */}
              <div>
                <h3 className="mb-4 text-base font-bold text-gray-900">
                  Learning Journey
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-5">
                    <div className="text-3xl font-bold text-indigo-600">
                      {companion.total_xp.toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-gray-600 mt-1">Total XP Earned</div>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-5">
                    <div className="text-3xl font-bold text-green-600">
                      {companion.total_interactions}
                    </div>
                    <div className="text-sm font-medium text-gray-600 mt-1">Interactions</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="mt-0">
              <CompanionMessageList
                messages={messages}
                archetype={companion.archetype}
                companionName={companion.name}
                onMarkAsRead={onMarkMessageAsRead}
              />
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="mt-0 space-y-4">
              {stats && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white shadow-sm hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 p-5">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.questions_asked}
                    </div>
                    <div className="text-sm font-medium text-gray-600 mt-1">Questions Asked</div>
                  </div>
                  <div className="rounded-2xl bg-white shadow-sm hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 p-5">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.total_messages}
                    </div>
                    <div className="text-sm font-medium text-gray-600 mt-1">Messages Sent</div>
                  </div>
                  <div className="rounded-2xl bg-white shadow-sm hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 p-5">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.total_interactions}
                    </div>
                    <div className="text-sm font-medium text-gray-600 mt-1">Total Interactions</div>
                  </div>
                  <div className="rounded-2xl bg-white shadow-sm hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 p-5">
                    <div className="text-2xl font-bold text-gray-900">
                      {companion.level}
                    </div>
                    <div className="text-sm font-medium text-gray-600 mt-1">Current Level</div>
                  </div>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}