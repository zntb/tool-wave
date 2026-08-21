'use client';

import type { ViewMode } from '@/lib/types';
import { cn } from '@/lib/utils';

export function LinkGrid({
  view = 'grid',
  className,
  children,
}: {
  view?: ViewMode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'stagger-children',
        view === 'list'
          ? 'flex flex-col gap-2'
          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
        className,
      )}
      role='region'
      aria-label={view === 'list' ? 'Resource list view' : 'Resource grid view'}
      aria-live='polite'
      aria-atomic='false'
    >
      {children}
    </div>
  );
}
