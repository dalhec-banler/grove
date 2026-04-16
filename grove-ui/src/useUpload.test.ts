import { describe, it, expect, vi } from 'vitest';
import { waitForUploadEvents } from './useUpload';

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
