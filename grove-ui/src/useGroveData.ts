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

  const refreshAll = useCallback(async () => {
    const [fileList, viewList, shareList, inboxList, trustData, catalogList, peerList, subList, groupList] = await Promise.all([
      scryFiles(), scryViews(), scryShares(), scryInbox(), scryTrusted(),
      scryCatalogs(), scryCatalogPeers(), scryCatalogSubs(), scryGroups(),
    ]);
    setFiles(new Map(fileList.map((m) => [m.id, m])));
    setViews(new Map(viewList.map((w) => [w.name, w])));
    setShares(new Map(shareList.map((sh) => [sh.token, sh])));
    setInbox(new Map(inboxList.map((e) => [`${e.owner}/${e.fileId}`, e])));
    setTrusted(new Set(trustData.trusted));
    setBlocked(new Set(trustData.blocked));
    setCatalogs(new Map(catalogList.map((c) => [c.catalogId, c.config])));
    setCatalogPeers(new Map(peerList.map((l) => [`${l.host}/${l.catalogId}`, l])));
    setCatalogSubs(subList);
    setAvailableGroups(groupList);
    setConnected(true);
    setLoadError(null);
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
    refreshAll().catch((e) => { console.error('initial load failed', e); setLoadError('Failed to connect to Grove'); });
  }, [refreshAll]);

  useEffect(() => {
    const handle = subscribeUpdates(handleUpdate, {
      onQuit: () => refreshAll().catch((e) => { console.error('reconnect refresh failed', e); setLoadError('Connection lost'); }),
      onError: () => setConnected(false),
    });
    return () => handle.cancel();
  }, [refreshAll, handleUpdate]);

  return {
    files, setFiles, views, shares, inbox, trusted, blocked,
    catalogs, catalogPeers, catalogSubs, availableGroups,
    connected, loadError, pendingShareFor, setPendingShareFor, shareDialog, setShareDialog,
  };
}
