// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { waitForUploadEvents, useUpload } from './useUpload';

vi.mock('./api', () => ({
  poke: vi.fn(() => Promise.resolve()),
  fileToBase64: vi.fn(() => Promise.resolve('base64data')),
  scryFiles: vi.fn(() => Promise.resolve([])),
  notifyError: vi.fn(),
}));

describe('waitForUploadEvents', () => {
  it('resolves immediately when enough events already collected', async () => {
    const ref = { current: ['a', 'b', 'c'] };
    const result = await waitForUploadEvents(3, ref, 1000, 10);
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('waits for events to arrive', async () => {
    const ref = { current: [] as string[] };
    setTimeout(() => { ref.current.push('a'); }, 20);
    setTimeout(() => { ref.current.push('b'); }, 40);
    const result = await waitForUploadEvents(2, ref, 1000, 10);
    expect(result).toEqual(['a', 'b']);
  });

  it('resolves with partial results on timeout', async () => {
    const ref = { current: ['a'] };
    const result = await waitForUploadEvents(5, ref, 50, 10);
    expect(result).toEqual(['a']);
  });

  it('returns a copy of the array', async () => {
    const ref = { current: ['x'] };
    const result = await waitForUploadEvents(1, ref, 100, 10);
    ref.current.push('y');
    expect(result).toEqual(['x']);
  });
});

function makeHookArgs() {
  const setFiles = vi.fn();
  const isUploadingRef = { current: false };
  const uploadCollectedRef = { current: [] as string[] };
  return { setFiles, isUploadingRef, uploadCollectedRef };
}

describe('useUpload', () => {
  it('starts with idle state', () => {
    const args = makeHookArgs();
    const { result } = renderHook(() => useUpload(args.setFiles, args.isUploadingRef, args.uploadCollectedRef));
    expect(result.current.busy).toBe(false);
    expect(result.current.progress).toBeNull();
    expect(result.current.bulkTagIds).toBeNull();
    expect(result.current.dragActive).toBe(false);
  });

  it('skips upload for empty file list', async () => {
    const { poke } = await import('./api');
    const args = makeHookArgs();
    const { result } = renderHook(() => useUpload(args.setFiles, args.isUploadingRef, args.uploadCollectedRef));
    await act(() => result.current.upload([]));
    expect(poke).not.toHaveBeenCalled();
    expect(result.current.busy).toBe(false);
  });

  it('calls notifyError on upload failure', async () => {
    const { poke, notifyError } = await import('./api');
    (poke as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('network'));
    const args = makeHookArgs();
    const { result } = renderHook(() => useUpload(args.setFiles, args.isUploadingRef, args.uploadCollectedRef));
    const file = new File(['data'], 'test.png', { type: 'image/png' });
    await act(() => result.current.upload([file]));
    expect(notifyError).toHaveBeenCalledWith(expect.stringContaining('Upload failed'));
    expect(result.current.busy).toBe(false);
    expect(args.isUploadingRef.current).toBe(false);
  });
});
