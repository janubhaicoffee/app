"use client";
import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const isPos = typeof window !== "undefined" &&
        (window.location.hostname.startsWith("pos.") || window.location.pathname.startsWith("/pos"));
      if (isPos) {
        navigator.serviceWorker.register("/sw.js", { scope: "/pos", updateViaCache: "none" }).catch(() => {});
      }
    }
  }, []);
  return null;
}
