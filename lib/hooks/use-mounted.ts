import { useState, useEffect } from 'react';

/**
 * Returns `false` during SSR and initial hydration, then `true` on the client.
 * Use this to avoid hydration mismatches when rendering client-only values
 * (e.g., localStorage data, browser APIs).
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return mounted;
}
