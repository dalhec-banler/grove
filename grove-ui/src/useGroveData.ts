import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  FileMeta, View, Share, Update, InboxEntry,
  CanopyEntry, CanopyConfig, CanopyListing, GroupInfo,
} from './types';
import {
  scryFiles, scryViews, scryShares, scryInbox, scryTrusted,
  scryCanopyEntries, scryCanopyConfig, scryCanopyPeers, scryGroups,
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
  const [canopyEntries, setCanopyEntries] = useState<Map<string, CanopyEntry>>(new Map());
  const [canopyConfig, setCanopyConfig] = useState<CanopyConfig>({ mode: 'open', name: '', friends: [], groupFlag: null });
  const [availableGroups, setAvailableGroups] = useState<GroupInfo[]>([]);
  const [canopyPeers, setCanopyPeers] = useState<Map<string, CanopyListing>>(new Map());
  const [connected, setConnected] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingShareFor, setPendingShareFor] = useState<string | null>(null);
  const [shareDialog, setShareDialog] = useState<Share | null>(null);
  const filesRef = useRef(files);
  filesRef.current = files;

  const refreshAll = useCallback(async () => {
    const [fileList, viewList, shareList, inboxList, trustData, entryList, canopyConf, peerList, groupList] = await Promise.all([
      scryFiles(), scryViews(), scryShares(), scryInbox(), scryTrusted(),
      scryCanopyEntries(), scryCanopyConfig(), scryCanopyPeers(), scryGroups(),
    ]);
    setFiles(new Map(fileList.map((m) => [m.id, m])));
    setViews(new Map(viewList.map((w) => [w.name, w])));
    setShares(new Map(shareList.map((sh) => [sh.token, sh])));
    setInbox(new Map(inboxList.map((e) => [`${e.owner}/${e.fileId}`, e])));
    setTrusted(new Set(trustData.trusted));
    setBlocked(new Set(trustData.blocked));
    setCanopyEntries(new Map(entryList.map((e) => [e.id, e])));
    setCanopyConfig(canopyConf);
    setCanopyPeers(new Map(peerList.map((l) => [l.host, l])));
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
      case 'canopyEntryAdded':
        setCanopyEntries((prev) => mapSet(prev, u.entry.id, u.entry));
        break;
      case 'canopyEntryRemoved':
        setCanopyEntries((prev) => mapDel(prev, u.fileId));
        break;
      case 'canopyConfigUpdated':
        setCanopyConfig(u.config);
        break;
      case 'canopyPeerUpdated':
        setCanopyPeers((prev) => mapSet(prev, u.listing.host, u.listing));
        break;
      case 'canopyPeerRemoved':
        setCanopyPeers((prev) => mapDel(prev, u.host));
        break;
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
    canopyEntries, canopyConfig, setCanopyConfig, canopyPeers, availableGroups,
    connected, loadError, pendingShareFor, setPendingShareFor, shareDialog, setShareDialog,
  };
}
