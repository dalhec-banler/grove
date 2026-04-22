import { useEffect, useState } from 'react';
import type { CatalogSearchHit } from './types';
import { scryCatalogSearch } from './api';

export function useCatalogSearch(term: string) {
  const [hits, setHits] = useState<CatalogSearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = term.trim();
    if (!q) { setHits([]); setError(null); return; }
    let cancelled = false;
    setSearching(true);
    setError(null);
    const h = setTimeout(() => {
      scryCatalogSearch(q)
        .then((r) => { if (!cancelled) setHits(r); })
        .catch((e) => { if (!cancelled) { console.error('search', e); setError('Search failed — try again.'); } })
        .finally(() => { if (!cancelled) setSearching(false); });
    }, 250);
    return () => { cancelled = true; clearTimeout(h); };
  }, [term]);

  return { hits, searching, error };
}
