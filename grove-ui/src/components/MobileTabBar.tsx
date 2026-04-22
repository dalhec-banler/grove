import type { Selection } from '../types';

interface Props {
  selection: Selection;
  onSelect: (s: Selection) => void;
  onOpenDrawer: () => void;
  inboxBadge: number;
}

export default function MobileTabBar({ selection, onSelect, onOpenDrawer, inboxBadge }: Props) {
  const isFiles = selection.kind === 'all' || selection.kind === 'view' || selection.kind === 'tag';
  const isStarred = selection.kind === 'starred';
  const isInbox = selection.kind === 'inbox';
  const isCatalogs = selection.kind === 'catalogs' || selection.kind === 'catalog'
    || selection.kind === 'browse' || selection.kind === 'browse-peer'
    || selection.kind === 'browse-catalog' || selection.kind === 'discover';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border flex items-center justify-around md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', height: 'calc(56px + env(safe-area-inset-bottom, 0px))' }}
    >
      <TabButton
        icon={<FolderIcon />}
        label="Files"
        active={isFiles}
        onClick={() => onSelect({ kind: 'all' })}
      />
      <TabButton
        icon={<StarIcon />}
        label="Starred"
        active={isStarred}
        onClick={() => onSelect({ kind: 'starred' })}
      />
      <TabButton
        icon={<InboxIcon />}
        label="Inbox"
        active={isInbox}
        badge={inboxBadge}
        onClick={() => onSelect({ kind: 'inbox' })}
      />
      <TabButton
        icon={<CatalogIcon />}
        label="Catalogs"
        active={isCatalogs}
        onClick={() => onSelect({ kind: 'catalogs' })}
      />
      <TabButton
        icon={<MenuIcon />}
        label="More"
        active={false}
        onClick={onOpenDrawer}
      />
    </nav>
  );
}

function TabButton({ icon, label, active, badge, onClick }: {
  icon: React.ReactNode; label: string; active: boolean; badge?: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 flex-1 pt-2 pb-1 relative ${
        active ? 'text-accent' : 'text-muted'
      }`}
    >
      <span className="relative">
        {icon}
        {badge != null && badge > 0 && (
          <span className="absolute -top-1 -right-2 text-[9px] px-1 py-0.5 leading-none rounded-full bg-accent text-white min-w-[14px] text-center">{badge}</span>
        )}
      </span>
      <span className="text-[10px]">{label}</span>
    </button>
  );
}

function FolderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
  );
}

function CatalogIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
