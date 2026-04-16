import type { FileMeta, View, Selection, SortKey } from './types';
import { sortByKey } from './sort';

export function filterAndSortFiles(
  files: Map<string, FileMeta>,
  views: Map<string, View>,
  selection: Selection,
  search: string,
  sortKey: SortKey,
): FileMeta[] {
  let list = Array.from(files.values());
  if (selection.kind === 'starred') list = list.filter((f) => f.starred);
  else if (selection.kind === 'view') {
    const view = views.get(selection.name);
    if (!view) list = [];
    else if (view.tags.length > 0) list = list.filter((f) => view.tags.every((t) => f.tags.includes(t)));
  } else if (selection.kind === 'tag') {
    list = list.filter((f) => f.tags.includes(selection.name));
  }
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter((f) =>
      f.name.toLowerCase().includes(q) ||
      f.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  return sortByKey(list, sortKey, {
    name: (f) => f.name,
    date: (f) => f.modified,
    size: (f) => f.size,
    type: (f) => f.fileMark,
  });
}
