'use client';

import { Button } from '@/components/ui/button';
import { SimplicityLevel } from '@/lib/prompts';
import { Brain, User, Briefcase } from 'lucide-react';

interface SimplifySelectorProps {
  selected: SimplicityLevel;
  onSelect: (level: SimplicityLevel) => void;
}

const levels = [
  {
    value: '5yo' as SimplicityLevel,
    label: "I'm 5 years old",
    icon: Brain,
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  {
    value: 'normal' as SimplicityLevel,
    label: "I'm a normal person",
    icon: User,
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    value: 'advanced' as SimplicityLevel,
    label: "I know some stuff",
    icon: Briefcase,
    color: 'bg-green-500 hover:bg-green-600',
  },
];

export function SimplifySelector({ selected, onSelect }: SimplifySelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full max-w-2xl mx-auto p-4">
      {levels.map((level) => {
        const Icon = level.icon;
        const isSelected = selected === level.value;
        
        return (
          <Button
            key={level.value}
            variant="outline"
            onClick={() => onSelect(level.value)}
            className={`flex-1 h-auto py-3 px-4 transition-all ${
              isSelected 
                ? `${level.color} text-white border-transparent shadow-lg scale-105` 
                : 'hover:border-gray-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              <span className="font-medium">{level.label}</span>
            </div>
          </Button>
        );
      })}
    </div>
  );
}