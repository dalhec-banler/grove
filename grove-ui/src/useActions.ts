import { useCallback, useMemo } from 'react';
import type { InboxEntry, CatalogMode, Selection, GroupFlag } from './types';
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

// Catalog action callbacks
export function useCatalogActions(
  setSelection: (s: Selection) => void,
) {
  const createCatalog = useCallback(
    (id: string, name: string, description: string, mode: CatalogMode) => {
      pokeSafe({ 'create-catalog': { id, name, description, mode } });
      setSelection({ kind: 'catalog', catalogId: id });
    },
    [setSelection],
  );

  const deleteCatalog = useCallback(
    (id: string) => {
      pokeSafe({ 'delete-catalog': { id } });
      setSelection({ kind: 'catalogs' });
    },
    [setSelection],
  );

  const updateCatalog = useCallback(
    (id: string, name: string, description: string) =>
      pokeSafe({ 'update-catalog': { id, name, description } }),
    [],
  );

  const setCatalogMode = useCallback(
    (id: string, mode: CatalogMode) =>
      pokeSafe({ 'set-catalog-mode': { id, mode } }),
    [],
  );

  const setCatalogGroup = useCallback(
    (id: string, flag: GroupFlag | null) =>
      pokeSafe({ 'set-catalog-group': { id, flag } }),
    [],
  );

  const addCatalogFriend = useCallback(
    (id: string, who: string) =>
      pokeSafe({ 'add-catalog-friend': { id, who } }),
    [],
  );

  const removeCatalogFriend = useCallback(
    (id: string, who: string) =>
      pokeSafe({ 'remove-catalog-friend': { id, who } }),
    [],
  );

  const addToCatalog = useCallback(
    (catalogId: string, fileId: string, displayName: string, tags: string[], description: string) =>
      pokeSafe({ 'add-to-catalog': { id: catalogId, 'file-id': fileId, 'display-name': displayName, tags, description } }),
    [],
  );

  const removeFromCatalog = useCallback(
    (catalogId: string, fileId: string) =>
      pokeSafe({ 'remove-from-catalog': { id: catalogId, 'file-id': fileId } }),
    [],
  );

  const subscribeCatalog = useCallback(
    (who: string, catalogId: string) => {
      pokeSafe({ 'subscribe-catalog': { who, 'catalog-id': catalogId } });
      setSelection({ kind: 'browse-catalog', host: who, catalogId });
    },
    [setSelection],
  );

  const unsubscribeCatalog = useCallback(
    (who: string, catalogId: string) => {
      pokeSafe({ 'unsubscribe-catalog': { who, 'catalog-id': catalogId } });
      setSelection({ kind: 'browse' });
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
    createCatalog, deleteCatalog, updateCatalog,
    setCatalogMode, setCatalogGroup, addCatalogFriend, removeCatalogFriend,
    addToCatalog, removeFromCatalog,
    subscribeCatalog, unsubscribeCatalog,
    fetchEntry, plantEntry, dropCache,
  };
}
