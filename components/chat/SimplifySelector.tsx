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
    selectedColor: 'bg-purple-500 hover:bg-purple-600 text-white border-purple-500',
    unselectedColor: 'bg-white hover:bg-white text-purple-700 hover:text-purple-900 border-purple-200 hover:border-purple-400',
  },
  {
    value: 'normal' as SimplicityLevel,
    label: "I'm a normal person",
    icon: User,
    selectedColor: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500',
    unselectedColor: 'bg-white hover:bg-white text-blue-700 hover:text-blue-900 border-blue-200 hover:border-blue-400',
  },
  {
    value: 'advanced' as SimplicityLevel,
    label: "I know some stuff",
    icon: Briefcase,
    selectedColor: 'bg-green-500 hover:bg-green-600 text-white border-green-500',
    unselectedColor: 'bg-white hover:bg-white text-green-700 hover:text-green-900 border-green-200 hover:border-green-400',
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
            className={`flex-1 h-auto py-3 px-4 transition-all border-2 ${
              isSelected 
                ? `${level.selectedColor} shadow-lg scale-105` 
                : level.unselectedColor
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