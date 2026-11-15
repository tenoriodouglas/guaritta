import { useEffect, useState } from 'react';

/** Current timestamp refreshed at the given interval (for countdowns). */
export function useNow(intervalMs = 1_000): number {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
