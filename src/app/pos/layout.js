import OfflineBanner from '@/components/pos/OfflineBanner';
import SyncEngineInit from './SyncEngineInit';

export const metadata = {
  title: 'POS | Janu Bhai Coffee',
  robots: 'noindex, nofollow',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'JBC POS',
  },
};

export default function PosLayout({ children }) {
  return (
    <>
      <SyncEngineInit />
      <OfflineBanner />
      {children}
    </>
  );
}
