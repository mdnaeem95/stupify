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
    description: 'Super simple words',
    gradient: 'from-indigo-500 to-violet-500',
    textColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    ringColor: 'ring-indigo-200',
  },
  {
    value: 'normal' as SimplicityLevel,
    label: 'Normal person',
    description: 'Clear and conversational',
    gradient: 'from-violet-500 to-purple-500',
    textColor: 'text-violet-600',
    bgColor: 'bg-violet-50',
    ringColor: 'ring-violet-200',
  },
  {
    value: 'advanced' as SimplicityLevel,
    label: 'Advanced',
    description: 'More depth, still clear',
    gradient: 'from-purple-500 to-pink-500',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    ringColor: 'ring-purple-200',
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
          'flex items-center gap-2.5 px-4 py-2.5 rounded-xl',
          'bg-white hover:bg-gray-50',
          'transition-all duration-200',
          'min-h-[44px]',
          'shadow-lg shadow-gray-900/10 hover:shadow-xl hover:shadow-gray-900/15',
          'ring-1 ring-gray-900/5',
          isOpen && 'ring-2 ring-indigo-200 shadow-xl'
        )}
      >
        <span className={cn('font-semibold text-sm', selectedLevel.textColor)}>
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
              'absolute z-50 mt-2 w-72 rounded-2xl',
              'bg-white shadow-2xl shadow-gray-900/20',
              'overflow-hidden',
              'ring-1 ring-gray-900/5',
              'right-0'
            )}
          >
            {levels.map((level) => {
              const isSelected = level.value === selected;
              
              return (
                <button
                  key={level.value}
                  onClick={() => handleSelect(level.value)}
                  className={cn(
                    'w-full px-5 py-4 flex items-center gap-4',
                    'hover:bg-gray-50 transition-all duration-200',
                    'text-left',
                    'min-h-[68px]',
                    'group',
                    isSelected && level.bgColor
                  )}
                >
                  {/* Icon + Check */}
                  <div className="flex items-center justify-center flex-shrink-0">
                    {isSelected ? (
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        `bg-gradient-to-br ${level.gradient}`,
                        'shadow-lg',
                        `shadow-${level.gradient.split('-')[1]}-500/30`
                      )}>
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      'font-semibold text-base mb-1',
                      isSelected ? level.textColor : 'text-gray-900'
                    )}>
                      {level.label}
                    </div>
                    <div className="text-sm text-gray-500 leading-relaxed">
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