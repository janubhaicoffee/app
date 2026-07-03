import OfflineBanner from "@/components/pos/OfflineBanner";
import SyncEngineInit from "./SyncEngineInit";

export const metadata = {
  title: "POS | Janu Bhai Coffee",
  robots: "noindex, nofollow",
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
