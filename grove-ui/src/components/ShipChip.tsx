export default function ShipChip({ ship, onRemove }: { ship: string; onRemove: () => void }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded bg-bg border border-border flex items-center gap-1 font-mono">
      {ship}
      <button onClick={onRemove} className="text-faint hover:text-red-600">×</button>
    </span>
  );
}
