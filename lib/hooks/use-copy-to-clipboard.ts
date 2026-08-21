import { useState, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

export function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), timeout);
      } catch {
        logger.error('Failed to copy to clipboard', 'use-copy-to-clipboard');
      }
    },
    [timeout],
  );

  return { copied, copyToClipboard };
}
