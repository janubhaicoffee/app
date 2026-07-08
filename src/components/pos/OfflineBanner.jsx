'use client';
import { WifiOff, RefreshCw } from 'lucide-react';
import useOnlineStatus from '@/hooks/useOnlineStatus';
import useSyncStatus from '@/hooks/useSyncStatus';
import { processSyncQueue } from '@/lib/syncEngine';

export default function OfflineBanner() {
  const online = useOnlineStatus();
  const { pendingCount } = useSyncStatus();

  if (online && pendingCount === 0) return null;

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: '6px 12px',
        fontSize: 12,
        fontWeight: 600,
        textAlign: 'center',
        background: online ? '#fff3cd' : '#ffebee',
        color: online ? '#856404' : '#c62828',
        borderBottom: `1px solid ${online ? '#ffc107' : '#ef9a9a'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {!online ? (
        <>
          <WifiOff size={14} />
          You are offline — orders will sync when connected
        </>
      ) : pendingCount > 0 ? (
        <>
          <RefreshCw size={14} />
          {pendingCount} pending order{pendingCount > 1 ? 's' : ''} to sync
          <button
            onClick={() => processSyncQueue()}
            style={{
              background: '#856404',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '2px 8px',
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            Sync Now
          </button>
        </>
      ) : null}
    </div>
  );
}
