import Link from 'next/link';
import { Search, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPopularResources } from '@/lib/analytics';
import type { PopularResource } from '@/lib/types';

interface EmptyStateProps {
  title: string;
  description?: string;
  query?: string;
  className?: string;
}

async function PopularSuggestions() {
  let popular: PopularResource[] = [];
  try {
    popular = await getPopularResources(5);
  } catch {
    // Silently fail — popular suggestions are non-critical
  }

  if (popular.length === 0) return null;

  return (
    <div className='mt-8 w-full max-w-md mx-auto'>
      <p className='text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider'>
        Popular Resources
      </p>
      <ul className='space-y-2'>
        {popular.map((resource) => (
          <li key={resource.id}>
            <Link
              href={resource.url}
              target='_blank'
              rel='noopener noreferrer'
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl',
                'bg-slate-50 dark:bg-slate-800/50',
                'border border-slate-100 dark:border-slate-700/50',
                'hover:bg-slate-100 dark:hover:bg-slate-800',
                'hover:border-slate-200 dark:hover:border-slate-600',
                'transition-all duration-200 group',
              )}
            >
              <div className='flex-1 min-w-0 text-left'>
                <p className='text-sm font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors'>
                  {resource.title}
                </p>
                <p className='text-xs text-slate-400 dark:text-slate-500'>
                  {resource.categoryName} · {resource.clicks} clicks
                </p>
              </div>
              <ExternalLink className='w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-cyan-500 transition-colors flex-shrink-0' />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function EmptyState({
  title,
  description,
  query,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4',
        className,
      )}
    >
      {/* Illustration */}
      <div className='relative mb-6'>
        <div className='w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center'>
          <Search className='w-8 h-8 text-slate-300 dark:text-slate-500' />
        </div>
        <div className='absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center'>
          <span className='text-white text-xs font-bold'>?</span>
        </div>
      </div>

      {/* Message */}
      <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1'>
        {title}
      </h3>
      {description && (
        <p className='text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm'>
          {description}
        </p>
      )}
      {query && (
        <p className='text-sm text-slate-400 dark:text-slate-500 mt-1'>
          for &quot;{query}&quot;
        </p>
      )}

      {/* Popular resource suggestions */}
      <PopularSuggestions />
    </div>
  );
}
