'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      // Path changed: fade out, then fade in
      setIsVisible(false);
      prevPathname.current = pathname;

      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <div
      className={cn(
        'transition-opacity duration-300 ease-out',
        isVisible ? 'opacity-100' : 'opacity-0',
      )}
    >
      {children}
    </div>
  );
}
