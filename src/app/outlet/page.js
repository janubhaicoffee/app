"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OutletRootPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/outlet/dashboard"); }, [router]);
  return (
    <div className="outlet-loading">
      <div className="outlet-loading-spinner" />
      <p>Redirecting to dashboard...</p>
    </div>
  );
}
