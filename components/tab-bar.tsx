'use client';

import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function TabBar({ tabs, activeTab, onTabChange, className }: TabBarProps) {
  return (
    <div className={cn('mb-6 flex flex-wrap gap-2 border-b pb-4', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-4 py-2 rounded transition-colors',
            activeTab === tab.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300',
          )}
          aria-selected={activeTab === tab.id}
          role='tab'
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
