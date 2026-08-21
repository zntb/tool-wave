'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { isUrl, cn } from '@/lib/utils';

interface IconFallbackProps {
  /** The icon value — could be a URL, emoji, or text */
  icon?: string | null;
  /** Title used for the first-letter fallback and alt text */
  title?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-lg rounded-lg',
  md: 'w-10 h-10 md:w-12 md:h-12 text-2xl md:text-3xl rounded-xl',
  lg: 'w-[200px] h-[200px] text-4xl rounded-xl',
} as const;

const imageSizes = {
  sm: 32,
  md: 48,
  lg: 200,
} as const;

export function IconFallback({
  icon,
  title,
  size = 'md',
  className,
}: IconFallbackProps) {
  const [imgError, setImgError] = useState(false);

  // No icon — show default search icon
  if (!icon) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900',
          sizeClasses[size],
          className,
        )}
      >
        <Search
          className={cn(
            'text-slate-400',
            size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-5 h-5',
          )}
        />
      </div>
    );
  }

  // URL icon — try loading as image, fall back to first letter
  if (isUrl(icon)) {
    if (imgError) {
      const fallbackChar = title?.charAt(0)?.toUpperCase() || '?';
      return (
        <div
          className={cn(
            'flex items-center justify-center bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-900/40 dark:to-blue-900/40 font-bold text-cyan-700 dark:text-cyan-300',
            sizeClasses[size],
            className,
          )}
        >
          {fallbackChar}
        </div>
      );
    }

    return (
      <div
        className={cn(
          'overflow-hidden flex-shrink-0',
          size === 'lg' ? 'rounded-xl' : size === 'md' ? 'rounded-xl' : 'rounded-lg',
          className,
        )}
      >
        <Image
          src={icon}
          alt={title || 'Icon'}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className={cn(
            'object-cover',
            size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-[200px] h-[200px]' : 'w-10 h-10 md:w-12 md:h-12',
          )}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Emoji or text icon — render directly
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-inner',
        sizeClasses[size],
        className,
      )}
    >
      <span>{icon}</span>
    </div>
  );
}
