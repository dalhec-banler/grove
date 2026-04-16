import { describe, it, expect } from 'vitest';
import { filterAndSortFiles } from './filter';
import { parseSortKey } from './sort';
import { parseViewMode } from './format';
import type { FileMeta, View, Selection } from './types';

function mkFile(overrides: Partial<FileMeta> & { id: string }): FileMeta {
  return {
    name: overrides.id,
    fileMark: 'txt',
    size: 100,
    tags: [],
    created: '~2026.1.1..00.00',
    modified: '~2026.1.1..00.00',
    description: '',
    starred: false,
    allowed: [],
    ...overrides,
  };
}

function toMap(files: FileMeta[]): Map<string, FileMeta> {
  return new Map(files.map((f) => [f.id, f]));
}

const emptyViews = new Map<string, View>();

describe('filterAndSortFiles', () => {
  const fileA = mkFile({ id: 'a', name: 'alpha.txt', size: 300, modified: '~2026.1.3..00.00', tags: ['docs', 'important'] });
  const fileB = mkFile({ id: 'b', name: 'beta.png', fileMark: 'png', size: 100, modified: '~2026.1.1..00.00', tags: ['photo'], starred: true });
  const fileC = mkFile({ id: 'c', name: 'charlie.pdf', fileMark: 'pdf', size: 200, modified: '~2026.1.2..00.00', tags: ['docs'] });
  const files = toMap([fileA, fileB, fileC]);

  describe('selection filtering', () => {
    it('returns all files for kind=all', () => {
      const result = filterAndSortFiles(files, emptyViews, { kind: 'all' }, '', 'newest');
      expect(result).toHaveLength(3);
    });

    it('filters starred files', () => {
      const result = filterAndSortFiles(files, emptyViews, { kind: 'starred' }, '', 'newest');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('b');
    });

    it('filters by tag', () => {
      const result = filterAndSortFiles(files, emptyViews, { kind: 'tag', name: 'docs' }, '', 'newest');
      expect(result).toHaveLength(2);
      expect(result.map((f) => f.id).sort()).toEqual(['a', 'c']);
    });

    it('filters by view with AND semantics across tags', () => {
      const views = new Map([['important-docs', { name: 'important-docs', tags: ['docs', 'important'], color: '#f00' }]]);
      const result = filterAndSortFiles(files, views, { kind: 'view', name: 'important-docs' }, '', 'newest');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('a');
    });

    it('returns all files for view with empty tags', () => {
      const views = new Map([['everything', { name: 'everything', tags: [], color: '#000' }]]);
      const result = filterAndSortFiles(files, views, { kind: 'view', name: 'everything' }, '', 'newest');
      expect(result).toHaveLength(3);
    });

    it('returns empty for non-existent view', () => {
      const result = filterAndSortFiles(files, emptyViews, { kind: 'view', name: 'missing' }, '', 'newest');
      expect(result).toHaveLength(0);
    });
  });

  describe('search filtering', () => {
    it('filters by name substring', () => {
      const result = filterAndSortFiles(files, emptyViews, { kind: 'all' }, 'alph', 'newest');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('a');
    });

    it('filters by tag substring', () => {
      const result = filterAndSortFiles(files, emptyViews, { kind: 'all' }, 'photo', 'newest');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('b');
    });

    it('is case-insensitive', () => {
      const result = filterAndSortFiles(files, emptyViews, { kind: 'all' }, 'ALPHA', 'newest');
      expect(result).toHaveLength(1);
    });

    it('trims whitespace', () => {
      const result = filterAndSortFiles(files, emptyViews, { kind: 'all' }, '  beta  ', 'newest');
      expect(result).toHaveLength(1);
    });

    it('returns all when search is empty', () => {
      const result = filterAndSortFiles(files, emptyViews, { kind: 'all' }, '', 'newest');
      expect(result).toHaveLength(3);
    });
  });

  describe('sorting', () => {
    it('sorts newest first', () => {
      const result = filterAndSortFiles(files, emptyViews, { kind: 'all' }, '', 'newest');
      expect(result.map((f) => f.id)).toEqual(['a', 'c', 'b']);
    });

    it('sorts oldest first', () => {
      const result = filterAndSortFiles(files, emptyViews, { kind: 'all' }, '', 'oldest');
      expect(result.map((f) => f.id)).toEqual(['b', 'c', 'a']);
    });

    it('sorts name ascending', () => {
      const result = filterAndSortFiles(files, emptyViews, { kind: 'all' }, '', 'name-asc');
      expect(result.map((f) => f.id)).toEqual(['a', 'b', 'c']);
    });

    it('sorts name descending', () => {
      const result = filterAndSortFiles(files, emptyViews, { kind: 'all' }, '', 'name-desc');
      expect(result.map((f) => f.id)).toEqual(['c', 'b', 'a']);
    });

    it('sorts largest first', () => {
      const result = filterAndSortFiles(files, emptyViews, { kind: 'all' }, '', 'largest');
      expect(result.map((f) => f.id)).toEqual(['a', 'c', 'b']);
    });

    it('sorts smallest first', () => {
      const result = filterAndSortFiles(files, emptyViews, { kind: 'all' }, '', 'smallest');
      expect(result.map((f) => f.id)).toEqual(['b', 'c', 'a']);
    });

    it('sorts by type then name', () => {
      const result = filterAndSortFiles(files, emptyViews, { kind: 'all' }, '', 'type');
      expect(result.map((f) => f.id)).toEqual(['c', 'b', 'a']);
    });
  });

  it('combines selection, search, and sort', () => {
    const result = filterAndSortFiles(files, emptyViews, { kind: 'tag', name: 'docs' }, 'cha', 'name-asc');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c');
  });
});

describe('parseSortKey', () => {
  it('returns valid sort keys unchanged', () => {
    expect(parseSortKey('newest')).toBe('newest');
    expect(parseSortKey('oldest')).toBe('oldest');
    expect(parseSortKey('name-asc')).toBe('name-asc');
    expect(parseSortKey('type')).toBe('type');
  });

  it('returns newest for invalid values', () => {
    expect(parseSortKey('invalid')).toBe('newest');
    expect(parseSortKey('')).toBe('newest');
  });
});

describe('parseViewMode', () => {
  it('returns valid modes unchanged', () => {
    expect(parseViewMode('list')).toBe('list');
    expect(parseViewMode('grid')).toBe('grid');
  });

  it('returns grid for invalid values', () => {
    expect(parseViewMode('invalid')).toBe('grid');
    expect(parseViewMode('')).toBe('grid');
  });
});
