import { GRID_STYLE } from '../styles';

interface Props<T> {
  items: T[];
  viewMode: 'list' | 'grid';
  keyFn: (item: T) => string;
  renderRow: (item: T) => React.ReactNode;
  renderCard: (item: T) => React.ReactNode;
}

export default function ListGridLayout<T>({ items, viewMode, keyFn, renderRow, renderCard }: Props<T>) {
  if (viewMode === 'grid') {
    return (
      <div className="grid gap-4" style={GRID_STYLE}>
        {items.map((item) => <div key={keyFn(item)}>{renderCard(item)}</div>)}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((item) => <div key={keyFn(item)}>{renderRow(item)}</div>)}
    </div>
  );
}
