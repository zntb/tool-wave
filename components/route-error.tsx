'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function RouteError({ error, reset }: RouteErrorProps) {
  const router = useRouter();

  useEffect(() => {
    logger.error('Route error', 'RouteError', error);
  }, [error]);

  return (
    <div className='min-h-[60vh] flex items-center justify-center p-6'>
      <div className='text-center max-w-md'>
        <div className='w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center'>
          <svg
            className='w-8 h-8 text-red-500 dark:text-red-400'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
        </div>

        <h2 className='text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2'>
          Something went wrong
        </h2>

        <p className='text-slate-500 dark:text-slate-400 mb-6'>
          An unexpected error occurred. Please try again.
        </p>

        {error.digest && (
          <p className='text-xs text-slate-400 dark:text-slate-500 font-mono mb-6'>
            Error ID: {error.digest}
          </p>
        )}

        <div className='flex gap-3 justify-center'>
          <Button onClick={reset} variant='default'>
            Try again
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant='outline'
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
