'use client';

import { useState, useEffect } from 'react';
import { Search, Heart, LayoutGrid, Send, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'tool-wave-onboarded';

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: string;
}

const steps: Step[] = [
  {
    icon: <Search className='w-5 h-5' />,
    title: 'Search Resources',
    description: 'Use the search bar to find design resources across all categories. Press `/` to focus it anytime.',
  },
  {
    icon: <Heart className='w-5 h-5' />,
    title: 'Save Favorites',
    description: 'Click the heart icon on any resource card to save it to your favorites. Access them anytime from the header.',
  },
  {
    icon: <LayoutGrid className='w-5 h-5' />,
    title: 'Toggle Views',
    description: 'Switch between grid and list views using the toggle button. Your preference is remembered per page.',
  },
  {
    icon: <Send className='w-5 h-5' />,
    title: 'Submit Resources',
    description: 'Know a great resource? Submit it via the Submit page and help the community discover new tools.',
  },
];

export function OnboardingTooltip() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    try {
      const hasSeenOnboarding = localStorage.getItem(STORAGE_KEY);
      if (!hasSeenOnboarding) {
        // Small delay so the page loads first
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // localStorage may be unavailable
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleDismiss();
    }
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 z-[200] bg-black/20 dark:bg-black/40 transition-opacity duration-300'
        onClick={handleDismiss}
        aria-hidden='true'
      />

      {/* Tooltip */}
      <div
        className={cn(
          'fixed z-[201] bottom-6 left-1/2 -translate-x-1/2',
          'w-[calc(100%-2rem)] max-w-md',
          'bg-white dark:bg-slate-900',
          'rounded-2xl shadow-2xl shadow-black/20',
          'border border-slate-200 dark:border-slate-700',
          'p-6 animate-fade-in',
        )}
        role='dialog'
        aria-label='Welcome to Tool Wave'
        aria-modal='true'
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className='absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          aria-label='Skip onboarding'
        >
          <X className='w-4 h-4' />
        </button>

        {/* Step indicator */}
        <div className='flex items-center gap-1.5 mb-4'>
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                index === currentStep
                  ? 'w-6 bg-cyan-500'
                  : index < currentStep
                    ? 'w-3 bg-cyan-300 dark:bg-cyan-700'
                    : 'w-3 bg-slate-200 dark:bg-slate-700',
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className='flex items-start gap-4 mb-6'>
          <div className='flex-shrink-0 w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400'>
            {step.icon}
          </div>
          <div>
            <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1'>
              {step.title}
            </h3>
            <p className='text-sm text-slate-500 dark:text-slate-400 leading-relaxed'>
              {step.description}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center justify-between'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleDismiss}
            className='text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          >
            Skip all
          </Button>
          <Button
            size='sm'
            onClick={handleNext}
            className='gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700'
          >
            {currentStep < steps.length - 1 ? (
              <>
                Next
                <ChevronRight className='w-4 h-4' />
              </>
            ) : (
              'Get started'
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
