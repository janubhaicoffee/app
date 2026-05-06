"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[55vh] flex flex-col items-center justify-center gap-5 text-center">
      <div className="rounded-full bg-accent-red/5 p-6 text-accent-red">
        <AlertTriangle size={38} />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-heading">Workspace crashed</h1>
        <p className="max-w-sm text-sm opacity-50">The current OS screen failed to render. Retry the screen or return to sign in.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button className="bg-accent-brown text-white px-8" onClick={reset}>
          Retry
        </Button>
        <Button variant="outline" className="px-8" onClick={() => window.location.assign("/login")}>
          Sign in
        </Button>
      </div>
    </div>
  );
}
