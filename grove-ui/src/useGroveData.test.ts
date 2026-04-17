// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGroveData } from './useGroveData';
import type { Update } from './types';

const mockSubscribe = vi.fn((_onEvent: (u: Update) => void, _opts?: any) => ({
  id: Promise.resolve(1),
  cancel: vi.fn(),
}));

vi.mock('./api', () => ({
  scryFiles: vi.fn(() => Promise.resolve([])),
  scryViews: vi.fn(() => Promise.resolve([])),
  scryShares: vi.fn(() => Promise.resolve([])),
  scryInbox: vi.fn(() => Promise.resolve([])),
  scryTrusted: vi.fn(() => Promise.resolve({ trusted: [], blocked: [] })),
  scryCanopyEntries: vi.fn(() => Promise.resolve([])),
  scryCanopyConfig: vi.fn(() => Promise.resolve({ mode: 'open', name: '', friends: [], groupFlag: null })),
  scryCanopyPeers: vi.fn(() => Promise.resolve([])),
  scryGroups: vi.fn(() => Promise.resolve([])),
  scrySharedViewPeers: vi.fn(() => Promise.resolve([])),
  subscribeUpdates: (...args: [any, any?]) => mockSubscribe(...args),
}));

function setup() {
  const isUploadingRef = { current: false };
  const uploadCollectedRef = { current: [] as string[] };
  return renderHook(() => useGroveData(isUploadingRef, uploadCollectedRef));
}

function getSubscriptionHandler(): (u: Update) => void {
  return mockSubscribe.mock.calls[mockSubscribe.mock.calls.length - 1][0];
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useGroveData', () => {
  it('starts connected after initial load', async () => {
    const { result } = setup();
    await act(() => Promise.resolve());
    expect(result.current.connected).toBe(true);
    expect(result.current.loadError).toBeNull();
  });

  it('handles fileAdded update', async () => {
    const { result } = setup();
    await act(() => Promise.resolve());
    const handler = getSubscriptionHandler();

    act(() => {
      handler({
        type: 'fileAdded', fileId: 'f1', name: 'test.png', fileMark: 'png',
        size: 100, tags: ['a'], created: '~2026.1.1..0.0', modified: '~2026.1.1..0.0',
        description: '', starred: false,
      });
    });

    const file = result.current.files.get('f1');
    expect(file).toBeDefined();
    expect(file!.name).toBe('test.png');
    expect(file!.allowed).toEqual([]);
  });

  it('fileAdded preserves existing allowed list', async () => {
    const { result } = setup();
    await act(() => Promise.resolve());
    const handler = getSubscriptionHandler();

    act(() => {
      handler({ type: 'allowedUpdated', fileId: 'f1', ships: ['~zod'] });
    });
    // File doesn't exist yet, so allowedUpdated is a no-op

    act(() => {
      handler({
        type: 'fileAdded', fileId: 'f1', name: 'test.png', fileMark: 'png',
        size: 100, tags: [], created: '~2026.1.1..0.0', modified: '~2026.1.1..0.0',
        description: '', starred: false,
      });
    });

    act(() => {
      handler({ type: 'allowedUpdated', fileId: 'f1', ships: ['~zod', '~bus'] });
    });

    // Now update the file — allowed should be preserved from previous state
    act(() => {
      handler({
        type: 'fileUpdated', fileId: 'f1', name: 'test-renamed.png', fileMark: 'png',
        size: 200, tags: ['b'], created: '~2026.1.1..0.0', modified: '~2026.1.2..0.0',
        description: 'updated', starred: true,
      });
    });

    const file = result.current.files.get('f1');
    expect(file!.name).toBe('test-renamed.png');
    expect(file!.allowed).toEqual(['~zod', '~bus']);
  });

  it('handles fileRemoved and cleans up shares', async () => {
    const { result } = setup();
    await act(() => Promise.resolve());
    const handler = getSubscriptionHandler();

    act(() => {
      handler({
        type: 'fileAdded', fileId: 'f1', name: 'test.png', fileMark: 'png',
        size: 100, tags: [], created: '~2026.1.1..0.0', modified: '~2026.1.1..0.0',
        description: '', starred: false,
      });
      handler({ type: 'shareAdded', token: 'tok1', fileId: 'f1' });
    });

    act(() => {
      handler({ type: 'fileRemoved', fileId: 'f1' });
    });

    expect(result.current.files.has('f1')).toBe(false);
    expect(result.current.shares.has('tok1')).toBe(false);
  });

  it('handles viewAdded and viewRemoved', async () => {
    const { result } = setup();
    await act(() => Promise.resolve());
    const handler = getSubscriptionHandler();

    act(() => {
      handler({ type: 'viewAdded', name: 'photos', tags: ['photo'], color: '#f00' });
    });
    expect(result.current.views.get('photos')).toEqual({ name: 'photos', tags: ['photo'], color: '#f00', shared: undefined });

    act(() => {
      handler({ type: 'viewRemoved', name: 'photos' });
    });
    expect(result.current.views.has('photos')).toBe(false);
  });

  it('handles trustedUpdated', async () => {
    const { result } = setup();
    await act(() => Promise.resolve());
    const handler = getSubscriptionHandler();

    act(() => {
      handler({ type: 'trustedUpdated', trusted: ['~zod'], blocked: ['~bus'] });
    });

    expect(result.current.trusted.has('~zod')).toBe(true);
    expect(result.current.blocked.has('~bus')).toBe(true);
  });

  it('handles inboxAdded and inboxRemoved', async () => {
    const { result } = setup();
    await act(() => Promise.resolve());
    const handler = getSubscriptionHandler();

    const entry = {
      owner: '~zod', fileId: 'f1', name: 'shared.png', fileMark: 'png',
      size: 50, offered: '~2026.1.1..0.0', accepted: true, cached: false,
    };

    act(() => {
      handler({ type: 'inboxAdded', entry });
    });
    expect(result.current.inbox.get('~zod/f1')).toBeDefined();

    act(() => {
      handler({ type: 'inboxRemoved', owner: '~zod', fileId: 'f1' });
    });
    expect(result.current.inbox.has('~zod/f1')).toBe(false);
  });

  it('handles cacheUpdated marking inbox entry cached', async () => {
    const { result } = setup();
    await act(() => Promise.resolve());
    const handler = getSubscriptionHandler();

    const entry = {
      owner: '~zod', fileId: 'f1', name: 'doc.pdf', fileMark: 'pdf',
      size: 100, offered: '~2026.1.1..0.0', accepted: true, cached: false,
    };
    act(() => { handler({ type: 'inboxAdded', entry }); });

    act(() => {
      handler({
        type: 'cacheUpdated', owner: '~zod',
        meta: { id: 'f1', name: 'doc.pdf', fileMark: 'pdf', size: 100, tags: [], created: '', modified: '', description: '', starred: false, allowed: [] },
      });
    });

    expect(result.current.inbox.get('~zod/f1')!.cached).toBe(true);
  });

  it('handles cacheRemoved marking inbox entry uncached', async () => {
    const { result } = setup();
    await act(() => Promise.resolve());
    const handler = getSubscriptionHandler();

    const entry = {
      owner: '~zod', fileId: 'f1', name: 'doc.pdf', fileMark: 'pdf',
      size: 100, offered: '~2026.1.1..0.0', accepted: true, cached: true,
    };
    act(() => { handler({ type: 'inboxAdded', entry }); });
    act(() => { handler({ type: 'cacheRemoved', owner: '~zod', fileId: 'f1' }); });

    expect(result.current.inbox.get('~zod/f1')!.cached).toBe(false);
  });
});
