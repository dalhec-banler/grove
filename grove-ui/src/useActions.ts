import { useCallback, useMemo } from 'react';
import type { InboxEntry, CanopyMode, Selection } from './types';
import { pokeSafe } from './api';

// Inbox action callbacks — all pure pokeSafe wrappers.
export function useInboxActions() {
  return useMemo(() => ({
    accept: (e: InboxEntry) => pokeSafe({ 'accept-offer': { owner: e.owner, id: e.fileId } }),
    decline: (e: InboxEntry) => pokeSafe({ 'decline-offer': { owner: e.owner, id: e.fileId } }),
    trust: (s: string) => pokeSafe({ 'trust-ship': { who: s } }),
    untrust: (s: string) => pokeSafe({ 'untrust-ship': { who: s } }),
    block: (s: string) => pokeSafe({ 'block-ship': { who: s } }),
    unblock: (s: string) => pokeSafe({ 'unblock-ship': { who: s } }),
    fetch: (e: InboxEntry) => pokeSafe({ fetch: { owner: e.owner, id: e.fileId } }),
    plant: (e: InboxEntry) => pokeSafe({ plant: { owner: e.owner, id: e.fileId } }),
    dropCache: (e: InboxEntry) => pokeSafe({ 'drop-cache': { owner: e.owner, id: e.fileId } }),
  }), []);
}

// Canopy action callbacks — most are pure pokeSafe, a few update local state.
export function useCanopyActions(
  setSelection: (s: Selection) => void,
) {
  const unpublish = useCallback(
    (id: string) => pokeSafe({ unpublish: { id } }),
    [],
  );

  const setMode = useCallback(
    (m: CanopyMode) => {
      pokeSafe({ 'set-canopy-mode': { mode: m } });
    },
    [],
  );

  const setName = useCallback(
    (name: string) => pokeSafe({ 'set-canopy-name': { name } }),
    [],
  );

  const addFriend = useCallback(
    (who: string) => pokeSafe({ 'add-friend': { who } }),
    [],
  );

  const removeFriend = useCallback(
    (who: string) => pokeSafe({ 'remove-friend': { who } }),
    [],
  );

  const setGroup = useCallback(
    (flag: { host: string; name: string } | null) =>
      pokeSafe({ 'set-canopy-group': { flag: flag ?? null } }),
    [],
  );

  const subscribe = useCallback(
    (ship: string) => {
      pokeSafe({ 'subscribe-to': { who: ship } });
      setSelection({ kind: 'canopy-peer', ship });
    },
    [setSelection],
  );

  const unsubscribe = useCallback(
    (ship: string) => {
      pokeSafe({ 'unsubscribe-from': { who: ship } });
      setSelection({ kind: 'canopy-browse' });
    },
    [setSelection],
  );

  const fetchEntry = useCallback(
    (host: string, id: string) => pokeSafe({ fetch: { owner: host, id } }),
    [],
  );

  const plantEntry = useCallback(
    (host: string, id: string) => pokeSafe({ plant: { owner: host, id } }),
    [],
  );

  const dropCache = useCallback(
    (host: string, id: string) => pokeSafe({ 'drop-cache': { owner: host, id } }),
    [],
  );

  return {
    unpublish, setMode, setName, addFriend, removeFriend, setGroup,
    subscribe, unsubscribe, fetchEntry, plantEntry, dropCache,
  };
}
