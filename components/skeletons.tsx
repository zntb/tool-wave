import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-slate-200/50 dark:bg-slate-800/50',
        'border border-slate-200/50 dark:border-slate-700/50',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Matches CategoryNav: flex-wrap centered pills with icon + text.
 * Each pill has the same rounded-full shape and padding as the real links.
 */
function NavSkeleton({ count = 6 }: { count?: number }) {
  return (
    <nav
      className='flex flex-wrap justify-center gap-2 md:gap-3'
      aria-label='Loading categories'
    >
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className='flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 animate-pulse'
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <Skeleton className='w-4 h-4 rounded-sm flex-shrink-0' />
          <Skeleton
            className='h-4 rounded-md'
            style={{ width: `${60 + (i % 3) * 20}px` }}
          />
        </div>
      ))}
    </nav>
  );
}

/**
 * Matches LinkCard in grid view: vertical card with icon, title,
 * description lines, URL, and 3 action buttons.
 */
function GridCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className='rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden'
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className='p-4 md:p-5 pt-5'>
        <div className='flex items-start gap-3 md:gap-4'>
          {/* Icon */}
          <Skeleton className='w-10 h-10 md:w-12 md:h-12 rounded-xl flex-shrink-0' />

          <div className='flex-1 min-w-0 space-y-2'>
            {/* Title */}
            <Skeleton className='h-5 w-3/4 rounded-lg' />
            {/* Description line 1 */}
            <Skeleton className='h-4 w-full rounded-lg' />
            {/* Description line 2 */}
            <Skeleton className='h-4 w-2/3 rounded-lg' />
            {/* Separator */}
            <div className='pt-0.5'>
              <div className='h-px bg-slate-200/50 dark:bg-slate-700/50' />
            </div>
            {/* URL */}
            <Skeleton className='h-3 w-1/2 rounded-md' />
          </div>

          {/* Action buttons */}
          <div className='flex items-center gap-1 flex-shrink-0'>
            <Skeleton className='w-9 h-9 rounded-lg' />
            <Skeleton className='w-9 h-9 rounded-lg' />
            <Skeleton className='w-9 h-9 rounded-lg' />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Matches LinkCard in list view: horizontal layout with icon on left,
 * content in middle, action buttons on right.
 */
function ListCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className='rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm'
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className='py-3 md:py-4 px-4 md:px-5'>
        <div className='flex items-center gap-3 md:gap-4 flex-1'>
          {/* Icon */}
          <Skeleton className='w-10 h-10 md:w-12 md:h-12 rounded-xl flex-shrink-0' />

          <div className='flex-1 min-w-0 flex items-center gap-3 md:gap-4'>
            <div className='flex-1 min-w-0 space-y-2'>
              {/* Title */}
              <Skeleton className='h-5 w-2/3 rounded-lg' />
              {/* Description */}
              <Skeleton className='hidden md:block h-4 w-1/2 rounded-lg' />
              {/* Separator */}
              <div className='pt-0.5'>
                <div className='h-px bg-slate-200/50 dark:bg-slate-700/50' />
              </div>
              {/* URL */}
              <Skeleton className='hidden md:block h-3 w-1/3 rounded-md' />
            </div>
          </div>

          {/* Action buttons */}
          <div className='flex items-center gap-1 flex-shrink-0'>
            <Skeleton className='w-9 h-9 rounded-lg' />
            <Skeleton className='w-9 h-9 rounded-lg' />
            <Skeleton className='w-9 h-9 rounded-lg' />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of card skeletons for the default grid layout.
 */
function LinkGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {[...Array(count)].map((_, i) => (
        <GridCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

/**
 * Full page skeleton: nav pills, heading area, and card grid.
 */
function PageSkeleton() {
  return (
    <div className='space-y-8'>
      <NavSkeleton />
      <div className='space-y-4'>
        <Skeleton className='h-12 w-96 rounded-xl mx-auto' />
        <Skeleton className='h-5 w-64 rounded-lg mx-auto' />
      </div>
      <LinkGridSkeleton />
    </div>
  );
}

/**
 * Loading state used inside Suspense boundaries for link lists.
 */
function LoadingState() {
  return <LinkGridSkeleton count={6} />;
}

export {
  Skeleton,
  NavSkeleton,
  GridCardSkeleton,
  ListCardSkeleton,
  LinkGridSkeleton,
  PageSkeleton,
  LoadingState,
};
