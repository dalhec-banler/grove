import type { SortKey } from './types';

interface SortAccessors<T> {
  name: (item: T) => string;
  date: (item: T) => string;
  size: (item: T) => number;
  type: (item: T) => string;
}

export function sortByKey<T>(list: T[], key: SortKey, acc: SortAccessors<T>): T[] {
  const sorted = list.slice();
  switch (key) {
    case 'newest':    sorted.sort((a, b) => acc.date(b).localeCompare(acc.date(a))); break;
    case 'oldest':    sorted.sort((a, b) => acc.date(a).localeCompare(acc.date(b))); break;
    case 'name-asc':  sorted.sort((a, b) => acc.name(a).localeCompare(acc.name(b))); break;
    case 'name-desc': sorted.sort((a, b) => acc.name(b).localeCompare(acc.name(a))); break;
    case 'largest':   sorted.sort((a, b) => acc.size(b) - acc.size(a)); break;
    case 'smallest':  sorted.sort((a, b) => acc.size(a) - acc.size(b)); break;
    case 'type':      sorted.sort((a, b) => acc.type(a).localeCompare(acc.type(b)) || acc.name(a).localeCompare(acc.name(b))); break;
  }
  return sorted;
}

const SORT_KEYS: readonly SortKey[] = ['newest', 'oldest', 'name-asc', 'name-desc', 'largest', 'smallest', 'type'];

function isSortKey(v: string): v is SortKey {
  return (SORT_KEYS as readonly string[]).includes(v);
}

export function parseSortKey(v: string): SortKey {
  return isSortKey(v) ? v : 'newest';
}
