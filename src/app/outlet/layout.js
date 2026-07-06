import OutletLayoutClient from "./OutletLayoutClient";
import "./outlet.css";

export const metadata = {
  title: "Outlet | Janu Bhai Coffee",
  robots: "noindex, nofollow",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JBC Outlet",
  },
};

export default function OutletLayout({ children }) {
  return <OutletLayoutClient>{children}</OutletLayoutClient>;
}
