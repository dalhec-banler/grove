import { useCallback, useRef, useState } from 'react';
import type { FileMeta } from './types';
import { inferMark } from './format';
import { poke, fileToBase64, scryFiles } from './api';

export function waitForUploadEvents(
  expected: number,
  ref: React.MutableRefObject<string[]>,
  timeoutMs = 3000,
  pollMs = 50,
): Promise<string[]> {
  return new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs;
    function check() {
      if (ref.current.length >= expected || Date.now() >= deadline) {
        if (ref.current.length < expected) {
          console.warn(`[upload] timed out waiting for events: got ${ref.current.length}/${expected}`);
        }
        resolve([...ref.current]);
        return;
      }
      setTimeout(check, pollMs);
    }
    check();
  });
}

export function useUpload(
  setFiles: React.Dispatch<React.SetStateAction<Map<string, FileMeta>>>,
  isUploadingRef: React.MutableRefObject<boolean>,
  uploadCollectedRef: React.MutableRefObject<string[]>,
) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [bulkTagIds, setBulkTagIds] = useState<string[] | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const dragCounter = useRef(0);

  const upload = useCallback(async (list: FileList | File[]) => {
    const fileArr = Array.from(list);
    if (fileArr.length === 0) return;
    isUploadingRef.current = true;
    uploadCollectedRef.current = [];
    setBusy(true);
    setProgress({ done: 0, total: fileArr.length });
    try {
      for (let i = 0; i < fileArr.length; i++) {
        const f = fileArr[i];
        const data = await fileToBase64(f);
        await poke({ upload: { name: f.name, 'file-mark': inferMark(f.name), data, tags: [] } });
        setProgress({ done: i + 1, total: fileArr.length });
      }
      const collected = await waitForUploadEvents(fileArr.length, uploadCollectedRef);
      if (collected.length > 0) setBulkTagIds(collected);
      const fresh = await scryFiles();
      setFiles(new Map(fresh.map((m) => [m.id, m])));
    } catch (e) {
      console.error('upload failed', e);
      alert(`Upload failed: ${(e as Error).message ?? e}`);
    } finally {
      isUploadingRef.current = false;
      uploadCollectedRef.current = [];
      setBusy(false);
      setProgress(null);
    }
  }, [setFiles, isUploadingRef, uploadCollectedRef]);

  const onDragEnter = (e: React.DragEvent) => {
    if (!e.dataTransfer?.types?.includes('Files')) return;
    e.preventDefault();
    dragCounter.current++;
    setDragActive(true);
  };
  const onDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer?.types?.includes('Files')) return;
    e.preventDefault();
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) setDragActive(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragActive(false);
    const f = e.dataTransfer?.files;
    if (f && f.length > 0) upload(f);
  };

  return {
    busy, progress, bulkTagIds, setBulkTagIds,
    dragActive, upload,
    dragHandlers: { onDragEnter, onDragOver, onDragLeave, onDrop },
  };
}
