import { useEffect } from 'react';

type RefObject = React.RefObject<HTMLElement | null>;

export function useClickOutside(
  refs: RefObject | RefObject[],
  handler: (event: MouseEvent) => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    const refArray = Array.isArray(refs) ? refs : [refs];

    const listener = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInside = refArray.some(
        ref => ref.current && ref.current.contains(target),
      );
      if (!isInside) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [refs, handler, enabled]);
}
