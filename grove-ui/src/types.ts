export type FileId = string;
export type ShareToken = string;

export interface FileMeta {
  id: FileId;
  name: string;
  fileMark: string;
  size: number;
  tags: string[];
  created: string;
  modified: string;
  description: string;
  starred: boolean;
  allowed: string[];
}

export interface View {
  name: string;
  tags: string[];
  color: string;
}

export interface Share {
  token: ShareToken;
  fileId: FileId;
  name: string;
}

export interface InboxEntry {
  owner: string;
  fileId: FileId;
  name: string;
  fileMark: string;
  size: number;
  offered: string;
  accepted: boolean;
  cached: boolean;
}

export interface Trust {
  trusted: string[];
  blocked: string[];
}

export type CanopyMode = 'open' | 'friends';

export interface CanopyEntry {
  id: FileId;
  displayName: string;
  fileMark: string;
  size: number;
  tags: string[];
  published: string;
  description: string;
}

export interface CanopyConfig {
  mode: CanopyMode;
  name: string;
  friends: string[];
}

export interface CanopyListing {
  host: string;
  name: string;
  mode: CanopyMode;
  entries: CanopyEntry[];
}

export type Update =
  | { type: 'fileAdded'; fileId: FileId; name: string; fileMark: string; size: number; tags: string[]; created: string; modified: string; description: string; starred: boolean }
  | { type: 'fileUpdated'; fileId: FileId; name: string; fileMark: string; size: number; tags: string[]; created: string; modified: string; description: string; starred: boolean }
  | { type: 'fileRemoved'; fileId: FileId }
  | { type: 'viewAdded'; name: string; tags: string[]; color: string }
  | { type: 'viewRemoved'; name: string }
  | { type: 'shareAdded'; token: ShareToken; fileId: FileId }
  | { type: 'shareRemoved'; token: ShareToken }
  | { type: 'allowedUpdated'; fileId: FileId; ships: string[] }
  | { type: 'inboxAdded'; entry: InboxEntry }
  | { type: 'inboxUpdated'; entry: InboxEntry }
  | { type: 'inboxRemoved'; owner: string; fileId: FileId }
  | { type: 'trustedUpdated'; trusted: string[]; blocked: string[] }
  | { type: 'cacheUpdated'; owner: string; meta: FileMeta }
  | { type: 'cacheRemoved'; owner: string; fileId: FileId }
  | { type: 'canopyEntryAdded'; entry: CanopyEntry }
  | { type: 'canopyEntryRemoved'; fileId: FileId }
  | { type: 'canopyConfigUpdated'; config: CanopyConfig }
  | { type: 'canopyPeerUpdated'; listing: CanopyListing }
  | { type: 'canopyPeerRemoved'; host: string };

export type Selection =
  | { kind: 'all' }
  | { kind: 'starred' }
  | { kind: 'view'; name: string }
  | { kind: 'tag'; name: string }
  | { kind: 'inbox' }
  | { kind: 'canopy-mine' }
  | { kind: 'canopy-browse' }
  | { kind: 'canopy-peer'; ship: string };
