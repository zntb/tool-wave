'use client';

import { Suspense } from 'react';
import { ViewToggle } from '@/components/view-toggle';
import { SortDropdown } from '@/components/sort-dropdown';
import { cn } from '@/lib/utils';
import type { SortOrder } from '@/lib/types';

interface ViewSortControlsProps {
  defaultValue?: SortOrder;
  className?: string;
}

export function ViewSortControls({
  defaultValue = 'newest',
  className,
}: ViewSortControlsProps) {
  return (
    <div
      className={cn(
        'flex justify-end items-center gap-2',
        className,
      )}
    >
      <Suspense fallback={null}>
        <ViewToggle />
      </Suspense>
      <SortDropdown defaultValue={defaultValue} />
    </div>
  );
}
