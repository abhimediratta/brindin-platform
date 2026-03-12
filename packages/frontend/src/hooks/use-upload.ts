'use client';

import { useState, useCallback } from 'react';
import { uploadCreative } from '@/lib/api';

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

export function useUpload() {
  const [uploads, setUploads] = useState<Map<string, UploadItem>>(new Map());

  const addFiles = useCallback((files: File[]) => {
    setUploads((prev) => {
      const next = new Map(prev);
      for (const file of files) {
        const id = crypto.randomUUID();
        next.set(id, { id, file, progress: 0, status: 'pending' });
      }
      return next;
    });
  }, []);

  const startUpload = useCallback(async (brandId: string) => {
    const pending = Array.from(uploads.values()).filter(
      (u) => u.status === 'pending'
    );

    for (const item of pending) {
      setUploads((prev) => {
        const next = new Map(prev);
        const current = next.get(item.id);
        if (current) {
          next.set(item.id, { ...current, status: 'uploading', progress: 0 });
        }
        return next;
      });

      try {
        await uploadCreative(brandId, item.file, (progress) => {
          setUploads((prev) => {
            const next = new Map(prev);
            const current = next.get(item.id);
            if (current) {
              next.set(item.id, { ...current, progress });
            }
            return next;
          });
        });

        setUploads((prev) => {
          const next = new Map(prev);
          const current = next.get(item.id);
          if (current) {
            next.set(item.id, { ...current, status: 'complete', progress: 100 });
          }
          return next;
        });
      } catch (err) {
        setUploads((prev) => {
          const next = new Map(prev);
          const current = next.get(item.id);
          if (current) {
            next.set(item.id, {
              ...current,
              status: 'error',
              error: err instanceof Error ? err.message : 'Upload failed',
            });
          }
          return next;
        });
      }
    }
  }, [uploads]);

  const clearCompleted = useCallback(() => {
    setUploads((prev) => {
      const next = new Map(prev);
      for (const [id, item] of next) {
        if (item.status === 'complete') {
          next.delete(id);
        }
      }
      return next;
    });
  }, []);

  const uploadList = Array.from(uploads.values());
  const hasPending = uploadList.some((u) => u.status === 'pending');
  const isUploading = uploadList.some((u) => u.status === 'uploading');

  return { uploads: uploadList, addFiles, startUpload, clearCompleted, hasPending, isUploading };
}
