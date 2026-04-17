interface Props {
  count: number;
  onDelete: () => void;
  onTag: () => void;
  onClear: () => void;
}

export default function BulkActionBar({ count, onDelete, onTag, onClear }: Props) {
  return (
    <div className="flex-1 flex items-center gap-3 min-w-0">
      <span className="text-sm font-medium text-accent whitespace-nowrap">{count} selected</span>
      <button
        onClick={onTag}
        className="text-xs px-3 py-1.5 rounded border border-border text-muted hover:text-ink hover:bg-bg whitespace-nowrap"
      >
        Tag
      </button>
      <button
        onClick={onDelete}
        className="text-xs px-3 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 whitespace-nowrap"
      >
        Delete
      </button>
      <button onClick={onClear} className="text-xs text-muted hover:text-ink whitespace-nowrap">
        Clear
      </button>
    </div>
  );
}
