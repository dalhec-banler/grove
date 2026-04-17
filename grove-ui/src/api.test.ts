import { describe, it, expect } from 'vitest';
import { fileFromJson, entryFromJson, canopyEntryFromJson, normalizeUpdate } from './api';
import type { RawFileMeta, RawInboxEntry, RawCanopyEntry } from './types';

describe('fileFromJson', () => {
  const raw: RawFileMeta = {
    id: 'f1', name: 'doc.pdf', 'file-mark': 'pdf', size: 1024,
    tags: ['work'], created: '~2026.1.1..0.0', modified: '~2026.1.2..0.0',
    description: 'A document', starred: true, allowed: ['~zod'],
  };

  it('maps kebab-case fields to camelCase', () => {
    const result = fileFromJson(raw);
    expect(result.fileMark).toBe('pdf');
    expect(result.id).toBe('f1');
    expect(result.name).toBe('doc.pdf');
    expect(result.starred).toBe(true);
    expect(result.allowed).toEqual(['~zod']);
  });

  it('defaults optional fields', () => {
    const minimal: RawFileMeta = {
      id: 'f2', name: 'x.txt', 'file-mark': 'txt', size: 0,
      created: '', modified: '',
    };
    const result = fileFromJson(minimal);
    expect(result.tags).toEqual([]);
    expect(result.description).toBe('');
    expect(result.starred).toBe(false);
    expect(result.allowed).toEqual([]);
  });
});

describe('entryFromJson', () => {
  it('accepts kebab-case fields (scry format)', () => {
    const raw: RawInboxEntry = {
      owner: '~zod', 'file-id': 'f1', name: 'pic.png', 'file-mark': 'png',
      size: 500, offered: '~2026.1.1..0.0', accepted: true, cached: false,
    };
    const result = entryFromJson(raw);
    expect(result.fileId).toBe('f1');
    expect(result.fileMark).toBe('png');
  });

  it('accepts camelCase fields (subscription format)', () => {
    const raw: RawInboxEntry = {
      owner: '~bus', fileId: 'f2', name: 'doc.pdf', fileMark: 'pdf',
      size: 100, offered: '~2026.1.1..0.0',
    };
    const result = entryFromJson(raw);
    expect(result.fileId).toBe('f2');
    expect(result.fileMark).toBe('pdf');
    expect(result.accepted).toBe(false);
    expect(result.cached).toBe(false);
  });
});

describe('canopyEntryFromJson', () => {
  it('accepts kebab-case display-name', () => {
    const raw: RawCanopyEntry = {
      id: 'c1', 'display-name': 'My File', 'file-mark': 'png',
      size: 200, published: '~2026.1.1..0.0',
    };
    const result = canopyEntryFromJson(raw);
    expect(result.displayName).toBe('My File');
    expect(result.fileMark).toBe('png');
  });

  it('accepts camelCase displayName', () => {
    const raw: RawCanopyEntry = {
      id: 'c2', displayName: 'Photo', fileMark: 'jpg',
      size: 300, published: '~2026.1.1..0.0', tags: ['art'],
    };
    const result = canopyEntryFromJson(raw);
    expect(result.displayName).toBe('Photo');
    expect(result.tags).toEqual(['art']);
  });

  it('falls back to name when display-name missing', () => {
    const raw: RawCanopyEntry = {
      id: 'c3', name: 'fallback.txt', 'file-mark': 'txt',
      size: 10, published: '~2026.1.1..0.0',
    };
    const result = canopyEntryFromJson(raw);
    expect(result.displayName).toBe('fallback.txt');
  });
});

describe('normalizeUpdate', () => {
  it('returns null for null/undefined input', () => {
    expect(normalizeUpdate(null)).toBeNull();
    expect(normalizeUpdate(undefined)).toBeNull();
  });

  it('returns null for unknown type', () => {
    expect(normalizeUpdate({ type: 'unknownType' })).toBeNull();
  });

  it('normalizes fileAdded update', () => {
    const result = normalizeUpdate({
      type: 'fileAdded', fileId: 'f1', name: 'test.png', fileMark: 'png',
      size: 100, tags: ['a'], created: '~2026.1.1..0.0', modified: '~2026.1.1..0.0',
      description: '', starred: false,
    });
    expect(result).not.toBeNull();
    expect(result!.type).toBe('fileAdded');
  });

  it('normalizes viewAdded update', () => {
    const result = normalizeUpdate({ type: 'viewAdded', name: 'photos', tags: ['photo'], color: '#f00' });
    expect(result).toEqual({ type: 'viewAdded', name: 'photos', tags: ['photo'], color: '#f00' });
  });

  it('normalizes trustedUpdated update', () => {
    const result = normalizeUpdate({ type: 'trustedUpdated', trusted: ['~zod'], blocked: [] });
    expect(result).toEqual({ type: 'trustedUpdated', trusted: ['~zod'], blocked: [] });
  });
});
