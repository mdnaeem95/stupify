'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { SimplicityLevel } from '@/lib/prompts';
import { cn } from '@/lib/utils';

interface CompactLevelSelectorProps {
  selected: SimplicityLevel;
  onSelect: (level: SimplicityLevel) => void;
  isMobile?: boolean;
  triggerHaptic?: (type?: 'light' | 'medium' | 'heavy') => void;
}

const levels = [
  {
    value: '5yo' as SimplicityLevel,
    label: '5 years old',
    emoji: '🎈',
    description: 'Super simple words',
    color: 'text-purple-600',
  },
  {
    value: 'normal' as SimplicityLevel,
    label: 'Normal person',
    emoji: '💬',
    description: 'Clear and conversational',
    color: 'text-blue-600',
  },
  {
    value: 'advanced' as SimplicityLevel,
    label: 'Advanced',
    emoji: '📚',
    description: 'More depth, still clear',
    color: 'text-green-600',
  },
];

export function CompactLevelSelector({ 
  selected, 
  onSelect,
  isMobile,
  triggerHaptic 
}: CompactLevelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLevel = levels.find(l => l.value === selected) || levels[1];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (isMobile && triggerHaptic) {
      triggerHaptic('light');
    }
  };

  const handleSelect = (level: SimplicityLevel) => {
    onSelect(level);
    setIsOpen(false);
    if (isMobile && triggerHaptic) {
      triggerHaptic('medium');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'border-2 border-gray-200 hover:border-gray-300',
          'bg-white hover:bg-gray-50',
          'transition-all duration-200',
          'min-h-[44px]',
          isOpen && 'border-purple-400 ring-2 ring-purple-200'
        )}
      >
        <span className="text-base">{selectedLevel.emoji}</span>
        <span className={cn('font-medium text-sm', selectedLevel.color)}>
          {selectedLevel.label}
        </span>
        <ChevronDown 
          className={cn(
            'w-4 h-4 transition-transform text-gray-400',
            isOpen && 'rotate-180'
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          {isMobile && (
            <div 
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Menu */}
          <div 
            className={cn(
              'absolute z-50 mt-2 w-64 rounded-xl shadow-lg',
              'bg-white border-2 border-gray-200',
              'overflow-hidden',
              isMobile ? 'right-0' : 'left-0'
            )}
          >
            {levels.map((level) => {
              const isSelected = level.value === selected;
              
              return (
                <button
                  key={level.value}
                  onClick={() => handleSelect(level.value)}
                  className={cn(
                    'w-full px-4 py-3 flex items-start gap-3',
                    'hover:bg-gray-50 transition-colors',
                    'text-left border-b border-gray-100 last:border-0',
                    'min-h-[60px]',
                    isSelected && 'bg-purple-50'
                  )}
                >
                  {/* Emoji + Check */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xl">{level.emoji}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-purple-600" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      'font-semibold text-sm mb-0.5',
                      isSelected ? level.color : 'text-gray-900'
                    )}>
                      {level.label} mode
                    </div>
                    <div className="text-xs text-gray-500">
                      {level.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}