import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  FileMeta, View, Share, Update, InboxEntry,
  Catalog, CatalogConfig, CatalogListing, CatalogSub, GroupInfo,
} from './types';
import {
  scryFiles, scryViews, scryShares, scryInbox, scryTrusted,
  scryCatalogs, scryCatalogPeers, scryCatalogSubs, scryGroups,
  subscribeUpdates,
} from './api';
import { putCache, getCache, CACHE_SCHEMA_VERSION } from './idb';

function mapSet<K, V>(map: Map<K, V>, key: K, value: V): Map<K, V> {
  return new Map(map).set(key, value);
}

function mapDel<K, V>(map: Map<K, V>, key: K): Map<K, V> {
  const next = new Map(map);
  next.delete(key);
  return next;
}

export function useGroveData(
  isUploadingRef: React.MutableRefObject<boolean>,
  uploadCollectedRef: React.MutableRefObject<string[]>,
) {
  const [files, setFiles] = useState<Map<string, FileMeta>>(new Map());
  const [views, setViews] = useState<Map<string, View>>(new Map());
  const [shares, setShares] = useState<Map<string, Share>>(new Map());
  const [inbox, setInbox] = useState<Map<string, InboxEntry>>(new Map());
  const [trusted, setTrusted] = useState<Set<string>>(new Set());
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [catalogs, setCatalogs] = useState<Map<string, CatalogConfig>>(new Map());
  const [catalogPeers, setCatalogPeers] = useState<Map<string, CatalogListing>>(new Map());
  const [catalogSubs, setCatalogSubs] = useState<CatalogSub[]>([]);
  const [availableGroups, setAvailableGroups] = useState<GroupInfo[]>([]);
  const [connected, setConnected] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingShareFor, setPendingShareFor] = useState<string | null>(null);
  const [shareDialog, setShareDialog] = useState<Share | null>(null);
  const filesRef = useRef(files);
  filesRef.current = files;
  // True once a live scry snapshot has applied — guards the (slower) IDB cache
  // restore so stale cache can never overwrite fresh data (H2).
  const loadedFreshRef = useRef(false);

  const refreshAll = useCallback(async () => {
    // allSettled, not all: one failing scry (e.g. a partially-deployed
    // feature) must not fail-fast and blank the whole app — apply the ones
    // that succeeded and keep going (H3).
    const [fileR, viewR, shareR, inboxR, trustR, catalogR, peerR, subR, groupR] =
      await Promise.allSettled([
        scryFiles(), scryViews(), scryShares(), scryInbox(), scryTrusted(),
        scryCatalogs(), scryCatalogPeers(), scryCatalogSubs(), scryGroups(),
      ]);

    // Total failure (e.g. offline / auth lost) — surface it to the caller so
    // the initial-load path can show an error and retry.
    if ([fileR, viewR, shareR, inboxR, trustR, catalogR, peerR, subR, groupR]
      .every((r) => r.status === 'rejected')) {
      throw (fileR as PromiseRejectedResult).reason;
    }

    if (fileR.status === 'fulfilled') setFiles(new Map(fileR.value.map((m) => [m.id, m])));
    if (viewR.status === 'fulfilled') setViews(new Map(viewR.value.map((w) => [w.name, w])));
    if (shareR.status === 'fulfilled') setShares(new Map(shareR.value.map((sh) => [sh.token, sh])));
    if (inboxR.status === 'fulfilled') setInbox(new Map(inboxR.value.map((e) => [`${e.owner}/${e.fileId}`, e])));
    if (trustR.status === 'fulfilled') { setTrusted(new Set(trustR.value.trusted)); setBlocked(new Set(trustR.value.blocked)); }
    if (catalogR.status === 'fulfilled') setCatalogs(new Map(catalogR.value.map((c) => [c.catalogId, c.config])));
    if (peerR.status === 'fulfilled') setCatalogPeers(new Map(peerR.value.map((l) => [`${l.host}/${l.catalogId}`, l])));
    if (subR.status === 'fulfilled') setCatalogSubs(subR.value);
    if (groupR.status === 'fulfilled') setAvailableGroups(groupR.value);

    loadedFreshRef.current = true;
    setConnected(true);
    setLoadError(null);

    // Only persist a fully-coherent snapshot — never cache a partial result.
    if (fileR.status === 'fulfilled' && viewR.status === 'fulfilled' && shareR.status === 'fulfilled'
      && inboxR.status === 'fulfilled' && trustR.status === 'fulfilled' && catalogR.status === 'fulfilled'
      && peerR.status === 'fulfilled' && subR.status === 'fulfilled' && groupR.status === 'fulfilled') {
      putCache('grove-state', {
        v: CACHE_SCHEMA_VERSION,
        files: fileR.value,
        views: viewR.value,
        shares: shareR.value,
        inbox: inboxR.value,
        trusted: trustR.value.trusted,
        blocked: trustR.value.blocked,
        catalogs: catalogR.value.map((c) => [c.catalogId, c.config]),
        catalogPeers: peerR.value.map((l) => [`${l.host}/${l.catalogId}`, l]),
        catalogSubs: subR.value,
        groups: groupR.value,
      }).catch(() => {});
    }
  }, []);

  const handleUpdate = useCallback((u: Update) => {
    switch (u.type) {
      case 'fileAdded':
      case 'fileUpdated': {
        setFiles((prev) => {
          const existing = prev.get(u.fileId);
          const meta: FileMeta = {
            id: u.fileId, name: u.name, fileMark: u.fileMark, size: u.size,
            tags: u.tags, created: u.created, modified: u.modified,
            description: u.description, starred: u.starred,
            allowed: existing?.allowed ?? [],
            inCatalogs: existing?.inCatalogs ?? [],
          };
          return mapSet(prev, meta.id, meta);
        });
        if (u.type === 'fileAdded' && isUploadingRef.current) {
          uploadCollectedRef.current.push(u.fileId);
        }
        break;
      }
      case 'allowedUpdated':
        setFiles((prev) => {
          const fm = prev.get(u.fileId);
          if (!fm) return prev;
          return mapSet(prev, u.fileId, { ...fm, allowed: u.ships });
        });
        break;
      case 'fileRemoved':
        setFiles((prev) => mapDel(prev, u.fileId));
        setShares((prev) => {
          const n = new Map(prev);
          for (const [k, sh] of n) if (sh.fileId === u.fileId) n.delete(k);
          return n;
        });
        break;
      case 'viewAdded':
        setViews((prev) => mapSet(prev, u.name, { name: u.name, tags: u.tags, color: u.color }));
        break;
      case 'viewRemoved':
        setViews((prev) => mapDel(prev, u.name));
        break;
      case 'shareAdded': {
        const fm = filesRef.current.get(u.fileId);
        if (fm) {
          const sh: Share = { token: u.token, fileId: u.fileId, name: fm.name };
          setShares((ps) => mapSet(ps, u.token, sh));
          setPendingShareFor((pending) => {
            if (pending === u.fileId) {
              setShareDialog(sh);
              return null;
            }
            return pending;
          });
        }
        break;
      }
      case 'shareRemoved':
        setShares((prev) => mapDel(prev, u.token));
        break;
      case 'inboxAdded':
      case 'inboxUpdated':
        setInbox((prev) => mapSet(prev, `${u.entry.owner}/${u.entry.fileId}`, u.entry));
        break;
      case 'inboxRemoved':
        setInbox((prev) => mapDel(prev, `${u.owner}/${u.fileId}`));
        break;
      case 'trustedUpdated':
        setTrusted(new Set(u.trusted));
        setBlocked(new Set(u.blocked));
        break;
      case 'cacheUpdated':
        setInbox((prev) => {
          const k = `${u.owner}/${u.meta.id}`;
          const ent = prev.get(k);
          if (!ent) return prev;
          return mapSet(prev, k, { ...ent, cached: true });
        });
        break;
      case 'cacheRemoved':
        setInbox((prev) => {
          const k = `${u.owner}/${u.fileId}`;
          const ent = prev.get(k);
          if (!ent) return prev;
          return mapSet(prev, k, { ...ent, cached: false });
        });
        break;
      case 'catalogCreated':
        setCatalogs((prev) => mapSet(prev, u.catalogId, u.config));
        break;
      case 'catalogDeleted':
        setCatalogs((prev) => mapDel(prev, u.catalogId));
        break;
      case 'catalogUpdated':
        setCatalogs((prev) => mapSet(prev, u.catalogId, u.config));
        break;
      case 'catalogFileAdded':
        setCatalogs((prev) => {
          const cat = prev.get(u.catalogId);
          if (!cat) return prev;
          return mapSet(prev, u.catalogId, { ...cat, files: [...cat.files, u.fileId] });
        });
        setFiles((prev) => {
          const fm = prev.get(u.fileId);
          if (!fm) return prev;
          if (fm.inCatalogs.includes(u.catalogId)) return prev;
          return mapSet(prev, u.fileId, { ...fm, inCatalogs: [...fm.inCatalogs, u.catalogId] });
        });
        break;
      case 'catalogFileRemoved':
        setCatalogs((prev) => {
          const cat = prev.get(u.catalogId);
          if (!cat) return prev;
          return mapSet(prev, u.catalogId, { ...cat, files: cat.files.filter((f) => f !== u.fileId) });
        });
        setFiles((prev) => {
          const fm = prev.get(u.fileId);
          if (!fm) return prev;
          return mapSet(prev, u.fileId, { ...fm, inCatalogs: fm.inCatalogs.filter((c) => c !== u.catalogId) });
        });
        break;
      case 'catalogPeerUpdated': {
        const key = `${u.listing.host}/${u.listing.catalogId}`;
        setCatalogPeers((prev) => mapSet(prev, key, u.listing));
        break;
      }
      case 'catalogPeerRemoved': {
        const key = `${u.host}/${u.catalogId}`;
        setCatalogPeers((prev) => mapDel(prev, key));
        break;
      }
    }
  }, [isUploadingRef, uploadCollectedRef]);

  useEffect(() => {
    let disposed = false;
    // Subscribe BEFORE the initial scry so no fact is dropped in the gap
    // between snapshot and subscription. Facts that arrive before the
    // snapshot resolves are buffered, then replayed on top of it — so the
    // wholesale snapshot apply can't clobber a live mutation (H1).
    let snapshotReady = false;
    const buffer: Update[] = [];

    const handle = subscribeUpdates(
      (u) => {
        if (snapshotReady) handleUpdate(u);
        else buffer.push(u);
      },
      {
        onQuit: () => refreshAll().catch((e) => { console.error('reconnect refresh failed', e); setLoadError('Connection lost'); }),
        onError: () => setConnected(false),
      },
    );

    // Instant paint from IDB — but only if fresh data hasn't already landed,
    // so stale cache can never overwrite a completed scry/live fact (H2).
    getCache<any>('grove-state').then((cached) => {
      if (disposed || loadedFreshRef.current) return;
      if (cached && cached.v === CACHE_SCHEMA_VERSION && cached.files) {
        setFiles(new Map(cached.files.map((m: FileMeta) => [m.id, m])));
        setViews(new Map(cached.views.map((w: View) => [w.name, w])));
        setShares(new Map(cached.shares.map((sh: Share) => [sh.token, sh])));
        setInbox(new Map(cached.inbox.map((e: InboxEntry) => [`${e.owner}/${e.fileId}`, e])));
        setTrusted(new Set(cached.trusted));
        setBlocked(new Set(cached.blocked));
        setCatalogs(new Map(cached.catalogs));
        setCatalogPeers(new Map(cached.catalogPeers));
        setCatalogSubs(cached.catalogSubs ?? []);
        setAvailableGroups(cached.groups ?? []);
      }
    }).catch(() => {});

    refreshAll()
      .then(() => {
        if (disposed) return;
        snapshotReady = true;
        // Replay any facts that raced ahead of the snapshot.
        for (const u of buffer) handleUpdate(u);
        buffer.length = 0;
      })
      .catch((e) => { console.error('initial load failed', e); setLoadError('Failed to connect to Grove'); });

    return () => { disposed = true; handle.cancel(); };
  }, [refreshAll, handleUpdate]);

  return {
    files, setFiles, views, shares, inbox, trusted, blocked,
    catalogs, catalogPeers, catalogSubs, availableGroups,
    connected, loadError, pendingShareFor, setPendingShareFor, shareDialog, setShareDialog,
    refreshAll,
  };
}
