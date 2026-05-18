import { GRID_STYLE } from '../styles';

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="aspect-square bg-bg animate-pulse" />
      <div className="p-2 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-bg animate-pulse shrink-0" />
          <div className="w-3/4 h-3 rounded bg-bg animate-pulse" />
        </div>
        <div className="flex justify-between">
          <div className="w-12 h-2.5 rounded bg-bg animate-pulse" />
          <div className="w-16 h-2.5 rounded bg-bg animate-pulse" />
        </div>
        <div className="flex gap-1">
          <div className="w-10 h-3.5 rounded bg-bg animate-pulse" />
          <div className="w-8 h-3.5 rounded bg-bg animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      <td className="pl-3 py-2"><div className="w-3.5 h-3.5 rounded bg-bg animate-pulse" /></td>
      <td className="pl-1"><div className="w-4 h-4 rounded bg-bg animate-pulse" /></td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-bg animate-pulse shrink-0" />
          <div className="w-32 h-3 rounded bg-bg animate-pulse" />
        </div>
      </td>
      <td className="px-3 py-2 hidden md:table-cell">
        <div className="flex gap-1">
          <div className="w-12 h-4 rounded bg-bg animate-pulse" />
          <div className="w-10 h-4 rounded bg-bg animate-pulse" />
        </div>
      </td>
      <td className="px-3 py-2 hidden md:table-cell"><div className="w-12 h-3 rounded bg-bg animate-pulse ml-auto" /></td>
      <td className="px-3 py-2 hidden md:table-cell"><div className="w-20 h-3 rounded bg-bg animate-pulse ml-auto" /></td>
      <td className="pr-4 hidden md:table-cell" />
    </tr>
  );
}

export function SkeletonFileGrid() {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid gap-4" style={GRID_STYLE}>
        {Array.from({ length: 12 }, (_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

export function SkeletonFileList() {
  return (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted uppercase tracking-wider bg-bg sticky top-0">
          <tr>
            <th className="w-8 pl-3" />
            <th className="w-8" />
            <th className="text-left font-normal px-3 py-2">Name</th>
            <th className="text-left font-normal px-3 py-2 w-48 hidden md:table-cell">Tags</th>
            <th className="text-right font-normal px-3 py-2 w-24 hidden md:table-cell">Size</th>
            <th className="text-right font-normal px-3 py-2 w-36 hidden md:table-cell">Modified</th>
            <th className="w-28 hidden md:table-cell" />
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }, (_, i) => <SkeletonRow key={i} />)}
        </tbody>
      </table>
    </div>
  );
}
