interface Props {
  count: number;
  onDelete: () => void;
  onTag: () => void;
  onClear: () => void;
}

export default function BulkActionBar({ count, onDelete, onTag, onClear }: Props) {
  return (
    <div className="sticky bottom-0 bg-surface border-t border-border px-6 py-2.5 flex items-center gap-3 z-10">
      <span className="text-sm font-medium">{count} selected</span>
      <button
        onClick={onTag}
        className="text-xs px-3 py-1.5 rounded border border-border text-muted hover:text-ink hover:bg-bg"
      >
        Tag
      </button>
      <button
        onClick={onDelete}
        className="text-xs px-3 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
      <button onClick={onClear} className="text-xs text-muted hover:text-ink ml-auto">
        Clear
      </button>
    </div>
  );
}
