import { useEffect, useState } from 'react';
import type { CanopySearchHit } from './types';
import { scryCanopySearch } from './api';

export function useCanopySearch(term: string) {
  const [hits, setHits] = useState<CanopySearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = term.trim();
    if (!q) { setHits([]); setError(null); return; }
    let cancelled = false;
    setSearching(true);
    setError(null);
    const h = setTimeout(() => {
      scryCanopySearch(q)
        .then((r) => { if (!cancelled) setHits(r); })
        .catch((e) => { if (!cancelled) { console.error('search', e); setError('Search failed — try again.'); } })
        .finally(() => { if (!cancelled) setSearching(false); });
    }, 250);
    return () => { cancelled = true; clearTimeout(h); };
  }, [term]);

  return { hits, searching, error };
}
