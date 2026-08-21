'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Home, Heart, Send, Shield, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Autocomplete } from '@/components/autocomplete';
import { FavoritesButton } from '@/components/favorites-button';
import { useClickOutside } from '@/lib/hooks/use-click-outside';
import { useRef } from 'react';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLogout: () => void;
  searchParams: URLSearchParams;
}

export function MobileNavDrawer({
  isOpen,
  onClose,
  isAdmin,
  onLogout,
  searchParams,
}: MobileNavDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useClickOutside(drawerRef, useCallback(() => onClose(), [onClose]), isOpen);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleNavClick = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('q', query.trim());
      onClose();
      router.push(`/search?${params.toString()}`);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden='true'
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className='flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-800'>
          <span className='font-display font-bold text-lg text-foreground'>
            Menu
          </span>
          <Button
            variant='ghost'
            size='icon'
            onClick={onClose}
            aria-label='Close menu'
            className='rounded-lg'
          >
            <X className='w-5 h-5' />
          </Button>
        </div>

        {/* Search */}
        <div className='px-4 py-3 border-b border-slate-200 dark:border-slate-800'>
          <Autocomplete
            placeholder='Search resources...'
            onSearch={handleSearch}
          />
        </div>

        {/* Navigation Links */}
        <nav className='px-2 py-3' role='navigation' aria-label='Mobile navigation'>
          <button
            onClick={() => handleNavClick('/')}
            className='w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
          >
            <Home className='w-5 h-5 text-slate-400' />
            Home
          </button>

          <button
            onClick={() => handleNavClick('/favorites')}
            className='w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
          >
            <Heart className='w-5 h-5 text-slate-400' />
            Favorites
          </button>

          <button
            onClick={() => handleNavClick('/submit')}
            className='w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
          >
            <Send className='w-5 h-5 text-slate-400' />
            Submit Resource
          </button>

          {isAdmin && (
            <>
              <div className='my-2 border-t border-slate-200 dark:border-slate-800' />
              <button
                onClick={() => handleNavClick('/admin')}
                className='w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
              >
                <Shield className='w-5 h-5 text-slate-400' />
                Admin Dashboard
              </button>
            </>
          )}
        </nav>

        {/* Footer Actions */}
        <div className='absolute bottom-0 left-0 right-0 border-t border-slate-200 dark:border-slate-800 p-4 space-y-3'>
          {isAdmin && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                onClose();
                onLogout();
              }}
              className='w-full justify-start gap-2 text-slate-600 dark:text-slate-400'
            >
              Logout
            </Button>
          )}

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <FavoritesButton />
              <ThemeToggle />
            </div>
            <Link
              href='/'
              className='text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors'
              onClick={onClose}
            >
              Tool Wave
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
