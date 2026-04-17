import { describe, it, expect } from 'vitest';
import { sortEntries, filterEntries, facets } from './CanopyUtils';
import type { CanopyEntry } from '../types';

function mkEntry(overrides: Partial<CanopyEntry> & { id: string }): CanopyEntry {
  return {
    displayName: overrides.id,
    fileMark: 'png',
    size: 100,
    tags: [],
    published: '~2026.1.1..10.00.00..0000',
    description: '',
    ...overrides,
  };
}

describe('sortEntries', () => {
  it('sorts by name ascending', () => {
    const entries = [mkEntry({ id: 'b' }), mkEntry({ id: 'a' })];
    const result = sortEntries(entries, 'name-asc');
    expect(result.map((e) => e.displayName)).toEqual(['a', 'b']);
  });

  it('sorts by size largest first', () => {
    const entries = [mkEntry({ id: 'a', size: 50 }), mkEntry({ id: 'b', size: 200 })];
    const result = sortEntries(entries, 'largest');
    expect(result.map((e) => e.displayName)).toEqual(['b', 'a']);
  });
});

describe('filterEntries', () => {
  const entries = [
    mkEntry({ id: 'a', tags: ['photo', 'nature'], fileMark: 'png', displayName: 'Sunset photo' }),
    mkEntry({ id: 'b', tags: ['doc'], fileMark: 'pdf', displayName: 'Report' }),
    mkEntry({ id: 'c', tags: ['photo'], fileMark: 'jpg', displayName: 'Beach' }),
  ];

  it('returns all entries when no filters', () => {
    expect(filterEntries(entries, new Set(), new Set(), '')).toHaveLength(3);
  });

  it('filters by tag', () => {
    const result = filterEntries(entries, new Set(['photo']), new Set(), '');
    expect(result.map((e) => e.id)).toEqual(['a', 'c']);
  });

  it('filters by type', () => {
    const result = filterEntries(entries, new Set(), new Set(['pdf']), '');
    expect(result.map((e) => e.id)).toEqual(['b']);
  });

  it('filters by search text', () => {
    const result = filterEntries(entries, new Set(), new Set(), 'beach');
    expect(result.map((e) => e.id)).toEqual(['c']);
  });

  it('combines tag and search filters', () => {
    const result = filterEntries(entries, new Set(['photo']), new Set(), 'sunset');
    expect(result.map((e) => e.id)).toEqual(['a']);
  });
});

describe('facets', () => {
  const entries = [
    mkEntry({ id: 'a', tags: ['photo', 'nature'], fileMark: 'png' }),
    mkEntry({ id: 'b', tags: ['photo'], fileMark: 'png' }),
    mkEntry({ id: 'c', tags: ['doc'], fileMark: 'pdf' }),
  ];

  it('counts tags', () => {
    const result = facets(entries);
    const photoCount = result.tags.find(([t]) => t === 'photo');
    expect(photoCount?.[1]).toBe(2);
  });

  it('counts types', () => {
    const result = facets(entries);
    const pngCount = result.types.find(([t]) => t === 'png');
    expect(pngCount?.[1]).toBe(2);
  });

  it('sorts tags by count descending', () => {
    const result = facets(entries);
    expect(result.tags[0][0]).toBe('photo');
  });
});
