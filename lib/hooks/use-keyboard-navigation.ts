'use client';

import { useEffect, useCallback, useRef } from 'react';

/**
 * Manages global keyboard navigation:
 * - `/` to focus the search input
 * - Arrow keys to navigate between link cards
 * - `Enter` to open the preview of the selected card
 * - `Escape` to deselect the current card or close overlays
 */
export function useKeyboardNavigation() {
  const selectedRef = useRef<number>(-1);

  const getCardElements = useCallback(() => {
    return Array.from(
      document.querySelectorAll<HTMLElement>('[data-testid="link-card"]'),
    );
  }, []);

  const updateSelection = useCallback((index: number) => {
    const cards = getCardElements();

    // Remove previous selection
    cards.forEach((card) => {
      card.removeAttribute('data-keyboard-selected');
      card.style.outline = '';
      card.style.outlineOffset = '';
    });

    if (index >= 0 && index < cards.length) {
      const card = cards[index];
      card.setAttribute('data-keyboard-selected', 'true');
      card.style.outline = '2px solid rgb(6 182 212)'; // cyan-500
      card.style.outlineOffset = '2px';

      // Scroll into view smoothly
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Focus the card for screen readers
      card.setAttribute('tabindex', '0');
      card.focus();
    }
  }, [getCardElements]);

  const clearSelection = useCallback(() => {
    const cards = getCardElements();
    cards.forEach((card) => {
      card.removeAttribute('data-keyboard-selected');
      card.style.outline = '';
      card.style.outlineOffset = '';
      card.removeAttribute('tabindex');
    });
    selectedRef.current = -1;
  }, [getCardElements]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tagName = target.tagName;
      const isInputFocused =
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT' ||
        target.isContentEditable;

      // `/` to focus search — works everywhere except inside inputs
      if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          '[data-testid="search-input"]',
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // For arrow/enter/escape, we need cards to exist on the page
      const cards = getCardElements();
      if (cards.length === 0) return;

      // Arrow keys to navigate cards — works when not in an input
      if (!isInputFocused) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next =
            selectedRef.current < cards.length - 1
              ? selectedRef.current + 1
              : 0;
          selectedRef.current = next;
          updateSelection(next);
          return;
        }

        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prev =
            selectedRef.current > 0
              ? selectedRef.current - 1
              : cards.length - 1;
          selectedRef.current = prev;
          updateSelection(prev);
          return;
        }

        // Enter to open preview of selected card
        if (e.key === 'Enter' && selectedRef.current >= 0) {
          e.preventDefault();
          const card = cards[selectedRef.current];
          if (card) {
            card.click();
          }
          return;
        }

        // Escape to deselect
        if (e.key === 'Escape' && selectedRef.current >= 0) {
          e.preventDefault();
          clearSelection();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [getCardElements, updateSelection, clearSelection]);
}
