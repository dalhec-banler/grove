import type { DragEvent } from 'react';

/** Custom MIME type for internal file drag-and-drop within Grove. */
export const GROVE_DRAG_MIME = 'application/x-grove-file-ids';

/** Set file IDs on a drag event's data transfer. */
export function setDragFileIds(e: DragEvent, ids: string[]): void {
  e.dataTransfer.setData(GROVE_DRAG_MIME, JSON.stringify(ids));
  e.dataTransfer.effectAllowed = 'copy';
}

/** Read file IDs from a drop event. Returns null if not a Grove drag. */
export function getDragFileIds(e: DragEvent): string[] | null {
  const data = e.dataTransfer.getData(GROVE_DRAG_MIME);
  if (!data) return null;
  try { return JSON.parse(data); } catch { return null; }
}

/** Check if a drag event contains Grove file data. */
export function isGroveDrag(e: DragEvent): boolean {
  return e.dataTransfer.types.includes(GROVE_DRAG_MIME);
}
