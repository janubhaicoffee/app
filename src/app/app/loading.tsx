import { Coffee } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="min-h-[55vh] flex flex-col items-center justify-center gap-5 text-center">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-4 border-accent-brown/10 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center text-accent-brown">
          <Coffee size={28} />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-heading">Loading workspace</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30">Syncing outlet data</p>
      </div>
    </div>
  );
}
