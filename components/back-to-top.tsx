'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Button
      size='icon'
      onClick={scrollToTop}
      aria-label='Back to top'
      title='Back to top'
      className={cn(
        'fixed bottom-6 right-6 z-40',
        'h-11 w-11 rounded-full',
        'bg-slate-900 text-white shadow-lg',
        'hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300',
        'transition-all duration-300',
        'hover:scale-110 hover:shadow-xl',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none',
      )}
    >
      <ArrowUp className='w-5 h-5' />
    </Button>
  );
}
