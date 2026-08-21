import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string; // If omitted, the item is the current page (not a link)
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label='Breadcrumb'
      className={cn('text-sm text-slate-500 dark:text-slate-400', className)}
    >
      <ol className='flex items-center flex-wrap gap-1'>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className='flex items-center gap-1'>
              {index > 0 && (
                <ChevronRight
                  className='w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0'
                  aria-hidden='true'
                />
              )}
              {isLast || !item.href ? (
                <span
                  className='font-medium text-slate-700 dark:text-slate-300'
                  aria-current='page'
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className='hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors'
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
