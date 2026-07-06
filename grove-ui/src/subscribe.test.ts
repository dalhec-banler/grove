// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Shared mock state for a fake @urbit/http-api client.
const h = vi.hoisted(() => ({
  subscribeCalls: [] as any[],
  unsubscribed: [] as number[],
  counter: { n: 0 },
  nextResult: null as null | (() => Promise<number>),
}));

vi.mock('@urbit/http-api', () => ({
  default: class {
    ship = '';
    onError: any;
    onRetry: any;
    onOpen: any;
    subscribe(params: any) {
      h.subscribeCalls.push(params);
      if (h.nextResult) {
        const impl = h.nextResult;
        h.nextResult = null;
        return impl();
      }
      return Promise.resolve(++h.counter.n);
    }
    unsubscribe(id: number) {
      h.unsubscribed.push(id);
      return Promise.resolve();
    }
  },
}));

import { subscribeUpdates } from './api';

beforeEach(() => {
  h.subscribeCalls.length = 0;
  h.unsubscribed.length = 0;
  h.counter.n = 0;
  h.nextResult = null;
  vi.useFakeTimers();
  // Deterministic backoff: no jitter, so delay === backoff exactly.
  vi.spyOn(Math, 'random').mockReturnValue(0);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('subscribeUpdates reconnect', () => {
  it('reconnects after an err callback (C3) and re-hydrates via onQuit', async () => {
    const onError = vi.fn();
    const onQuit = vi.fn();
    subscribeUpdates(() => {}, { onError, onQuit });
    await vi.advanceTimersByTimeAsync(0); // resolve initial subscribe
    expect(h.subscribeCalls).toHaveLength(1);

    // Simulate a channel error — must schedule a reconnect, not just log.
    h.subscribeCalls[0].err('boom');
    expect(onError).toHaveBeenCalledTimes(1);

    // Base backoff is 1s (jitter mocked to 0).
    await vi.advanceTimersByTimeAsync(1000);
    expect(h.subscribeCalls).toHaveLength(2);
    expect(onQuit).toHaveBeenCalledTimes(1); // reconnect re-hydrates state
  });

  it('reconnects after a quit callback', async () => {
    subscribeUpdates(() => {}, {});
    await vi.advanceTimersByTimeAsync(0);
    expect(h.subscribeCalls).toHaveLength(1);

    h.subscribeCalls[0].quit();
    await vi.advanceTimersByTimeAsync(1000);
    expect(h.subscribeCalls).toHaveLength(2);
  });

  it('retries when the initial open rejects (no unhandled rejection)', async () => {
    h.nextResult = () => Promise.reject(new Error('nope'));
    const onError = vi.fn();
    const handle = subscribeUpdates(() => {}, { onError });
    handle.id.catch(() => {}); // first-open rejection is expected
    await vi.advanceTimersByTimeAsync(0);
    expect(h.subscribeCalls).toHaveLength(1);
    expect(onError).toHaveBeenCalledTimes(1);

    // Next open succeeds after backoff.
    await vi.advanceTimersByTimeAsync(1000);
    expect(h.subscribeCalls).toHaveLength(2);
  });

  it('applies exponential backoff across successive failures', async () => {
    subscribeUpdates(() => {}, {});
    await vi.advanceTimersByTimeAsync(0);
    expect(h.subscribeCalls).toHaveLength(1);

    // First quit → 1s.
    h.subscribeCalls[0].quit();
    await vi.advanceTimersByTimeAsync(1000);
    expect(h.subscribeCalls).toHaveLength(2);

    // Second quit without any event → backoff doubled to 2s.
    h.subscribeCalls[1].quit();
    await vi.advanceTimersByTimeAsync(1000);
    expect(h.subscribeCalls).toHaveLength(2); // not yet
    await vi.advanceTimersByTimeAsync(1000);
    expect(h.subscribeCalls).toHaveLength(3); // fired at 2s
  });

  it('resets backoff after a successful event', async () => {
    subscribeUpdates(() => {}, {});
    await vi.advanceTimersByTimeAsync(0);

    h.subscribeCalls[0].quit();
    await vi.advanceTimersByTimeAsync(1000);
    expect(h.subscribeCalls).toHaveLength(2); // backoff now 2s

    // A live event confirms the channel → backoff resets to 1s.
    h.subscribeCalls[1].event({ type: 'viewRemoved', name: 'x' });
    h.subscribeCalls[1].quit();
    await vi.advanceTimersByTimeAsync(1000);
    expect(h.subscribeCalls).toHaveLength(3); // fired at 1s again
  });

  it('cancel() targets the live (reconnected) sub id and stops timers', async () => {
    const handle = subscribeUpdates(() => {}, {});
    await vi.advanceTimersByTimeAsync(0); // sub id 1

    h.subscribeCalls[0].quit();
    await vi.advanceTimersByTimeAsync(1000); // reconnect → sub id 2

    handle.cancel();
    expect(h.unsubscribed).toContain(2); // the live one, not the stale id 1

    // A late quit after cancel must not schedule another reconnect.
    h.subscribeCalls[1].quit();
    await vi.advanceTimersByTimeAsync(30000);
    expect(h.subscribeCalls).toHaveLength(2);
  });
});
