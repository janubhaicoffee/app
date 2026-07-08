'use client';
import { useState, useEffect } from 'react';
import { getSyncQueueCount } from '@/lib/db';
import { onSyncChange } from '@/lib/syncEngine';

export default function useSyncStatus() {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSyncQueueCount().then((count) => {
      setPendingCount(count);
      setLoading(false);
    });
    const unsub = onSyncChange((count) => setPendingCount(count));
    return unsub;
  }, []);

  return { pendingCount, loading };
}
