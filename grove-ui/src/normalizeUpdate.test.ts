import { describe, it, expect } from 'vitest';
import { normalizeUpdate } from './api';

describe('normalizeUpdate', () => {
  it('returns null for null/undefined input', () => {
    expect(normalizeUpdate(null)).toBeNull();
    expect(normalizeUpdate(undefined)).toBeNull();
  });

  it('returns null for data without type', () => {
    expect(normalizeUpdate({})).toBeNull();
    expect(normalizeUpdate({ foo: 'bar' })).toBeNull();
  });

  it('returns null for unknown type', () => {
    expect(normalizeUpdate({ type: 'unknownEvent' })).toBeNull();
  });

  it('normalizes fileAdded', () => {
    const result = normalizeUpdate({
      type: 'fileAdded',
      fileId: 'abc',
      name: 'test.png',
      fileMark: 'png',
      size: 1024,
      tags: ['photo'],
      created: '~2026.1.1',
      modified: '~2026.1.2',
      description: 'A photo',
      starred: true,
    });
    expect(result).toEqual({
      type: 'fileAdded',
      fileId: 'abc',
      name: 'test.png',
      fileMark: 'png',
      size: 1024,
      tags: ['photo'],
      created: '~2026.1.1',
      modified: '~2026.1.2',
      description: 'A photo',
      starred: true,
    });
  });

  it('defaults missing tags and description on fileAdded', () => {
    const result = normalizeUpdate({
      type: 'fileAdded',
      fileId: 'x',
      name: 'f.txt',
      fileMark: 'txt',
      size: 0,
      created: '~2026.1.1',
      modified: '~2026.1.1',
    });
    expect(result!.type).toBe('fileAdded');
    if (result!.type === 'fileAdded') {
      expect(result!.tags).toEqual([]);
      expect(result!.description).toBe('');
      expect(result!.starred).toBe(false);
    }
  });

  it('normalizes fileUpdated', () => {
    const result = normalizeUpdate({
      type: 'fileUpdated',
      fileId: 'abc',
      name: 'renamed.png',
      fileMark: 'png',
      size: 2048,
      tags: [],
      created: '~2026.1.1',
      modified: '~2026.1.3',
      description: '',
      starred: false,
    });
    expect(result?.type).toBe('fileUpdated');
  });

  it('normalizes fileRemoved', () => {
    expect(normalizeUpdate({ type: 'fileRemoved', fileId: 'abc' }))
      .toEqual({ type: 'fileRemoved', fileId: 'abc' });
  });

  it('normalizes viewAdded', () => {
    expect(normalizeUpdate({ type: 'viewAdded', name: 'photos', tags: ['png'], color: '#ff0' }))
      .toEqual({ type: 'viewAdded', name: 'photos', tags: ['png'], color: '#ff0' });
  });

  it('defaults missing tags on viewAdded', () => {
    const result = normalizeUpdate({ type: 'viewAdded', name: 'v', color: '#000' });
    expect(result?.type).toBe('viewAdded');
    if (result?.type === 'viewAdded') expect(result.tags).toEqual([]);
  });

  it('normalizes viewRemoved', () => {
    expect(normalizeUpdate({ type: 'viewRemoved', name: 'photos' }))
      .toEqual({ type: 'viewRemoved', name: 'photos' });
  });

  it('normalizes shareAdded', () => {
    expect(normalizeUpdate({ type: 'shareAdded', token: 'tok1', fileId: 'f1' }))
      .toEqual({ type: 'shareAdded', token: 'tok1', fileId: 'f1' });
  });

  it('normalizes shareRemoved', () => {
    expect(normalizeUpdate({ type: 'shareRemoved', token: 'tok1' }))
      .toEqual({ type: 'shareRemoved', token: 'tok1' });
  });

  it('normalizes allowedUpdated', () => {
    expect(normalizeUpdate({ type: 'allowedUpdated', fileId: 'f1', ships: ['~zod'] }))
      .toEqual({ type: 'allowedUpdated', fileId: 'f1', ships: ['~zod'] });
  });

  it('defaults ships to empty array on allowedUpdated', () => {
    const result = normalizeUpdate({ type: 'allowedUpdated', fileId: 'f1' });
    if (result?.type === 'allowedUpdated') expect(result.ships).toEqual([]);
  });

  it('normalizes inboxAdded with entry', () => {
    const result = normalizeUpdate({
      type: 'inboxAdded',
      entry: {
        owner: '~zod',
        'file-id': 'abc',
        name: 'shared.pdf',
        'file-mark': 'pdf',
        size: 500,
        offered: '~2026.1.1',
        accepted: false,
        cached: false,
      },
    });
    expect(result?.type).toBe('inboxAdded');
    if (result?.type === 'inboxAdded') {
      expect(result.entry.fileId).toBe('abc');
      expect(result.entry.fileMark).toBe('pdf');
    }
  });

  it('normalizes inboxUpdated', () => {
    const result = normalizeUpdate({
      type: 'inboxUpdated',
      entry: {
        owner: '~zod',
        fileId: 'abc',
        name: 'shared.pdf',
        fileMark: 'pdf',
        size: 500,
        offered: '~2026.1.1',
        accepted: true,
        cached: true,
      },
    });
    expect(result?.type).toBe('inboxUpdated');
  });

  it('normalizes inboxRemoved', () => {
    expect(normalizeUpdate({ type: 'inboxRemoved', owner: '~zod', fileId: 'abc' }))
      .toEqual({ type: 'inboxRemoved', owner: '~zod', fileId: 'abc' });
  });

  it('normalizes trustedUpdated', () => {
    expect(normalizeUpdate({ type: 'trustedUpdated', trusted: ['~zod'], blocked: ['~bus'] }))
      .toEqual({ type: 'trustedUpdated', trusted: ['~zod'], blocked: ['~bus'] });
  });

  it('defaults trusted/blocked to empty arrays', () => {
    const result = normalizeUpdate({ type: 'trustedUpdated' });
    if (result?.type === 'trustedUpdated') {
      expect(result.trusted).toEqual([]);
      expect(result.blocked).toEqual([]);
    }
  });

  it('normalizes cacheUpdated', () => {
    const result = normalizeUpdate({
      type: 'cacheUpdated',
      owner: '~zod',
      meta: {
        id: 'f1', name: 'file.txt', 'file-mark': 'txt', size: 100,
        tags: [], created: '~2026.1.1', modified: '~2026.1.1',
        description: '', starred: false, allowed: [],
      },
    });
    expect(result?.type).toBe('cacheUpdated');
    if (result?.type === 'cacheUpdated') {
      expect(result.owner).toBe('~zod');
      expect(result.meta.fileMark).toBe('txt');
    }
  });

  it('normalizes cacheRemoved', () => {
    expect(normalizeUpdate({ type: 'cacheRemoved', owner: '~zod', fileId: 'f1' }))
      .toEqual({ type: 'cacheRemoved', owner: '~zod', fileId: 'f1' });
  });

  it('normalizes canopyEntryAdded', () => {
    const result = normalizeUpdate({
      type: 'canopyEntryAdded',
      entry: {
        id: 'e1', 'display-name': 'My File', 'file-mark': 'png',
        size: 2048, tags: ['art'], published: '~2026.1.1', description: 'Nice',
      },
    });
    expect(result?.type).toBe('canopyEntryAdded');
    if (result?.type === 'canopyEntryAdded') {
      expect(result.entry.displayName).toBe('My File');
      expect(result.entry.fileMark).toBe('png');
    }
  });

  it('normalizes canopyEntryRemoved', () => {
    expect(normalizeUpdate({ type: 'canopyEntryRemoved', fileId: 'e1' }))
      .toEqual({ type: 'canopyEntryRemoved', fileId: 'e1' });
  });

  it('normalizes canopyConfigUpdated', () => {
    const result = normalizeUpdate({
      type: 'canopyConfigUpdated',
      config: { mode: 'friends', name: 'My Canopy', friends: ['~zod'], 'group-flag': null },
    });
    expect(result?.type).toBe('canopyConfigUpdated');
    if (result?.type === 'canopyConfigUpdated') {
      expect(result.config.mode).toBe('friends');
      expect(result.config.friends).toEqual(['~zod']);
    }
  });

  it('normalizes canopyPeerUpdated', () => {
    const result = normalizeUpdate({
      type: 'canopyPeerUpdated',
      listing: { host: '~zod', name: 'Zod Files', mode: 'open', entries: [] },
    });
    expect(result?.type).toBe('canopyPeerUpdated');
    if (result?.type === 'canopyPeerUpdated') {
      expect(result.listing.host).toBe('~zod');
    }
  });

  it('normalizes canopyPeerRemoved', () => {
    expect(normalizeUpdate({ type: 'canopyPeerRemoved', host: '~zod' }))
      .toEqual({ type: 'canopyPeerRemoved', host: '~zod' });
  });
});
