import { AlertCircle, Loader2 } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";

export function LoadingState({ label = "Loading live data" }: { label?: string }) {
  return (
    <Card glass className="p-8 flex items-center justify-center gap-3 text-sm font-bold opacity-70">
      <Loader2 className="animate-spin" size={18} />
      {label}
    </Card>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="p-8 bg-accent-red/5 border-accent-red/10 text-center space-y-4">
      <AlertCircle className="mx-auto text-accent-red" />
      <div className="space-y-1">
        <h2 className="text-xl font-heading">Live data unavailable</h2>
        <p className="text-sm opacity-60">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" className="px-8" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Card>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card glass className="p-10 text-center space-y-2">
      <h2 className="text-xl font-heading">{title}</h2>
      <p className="text-sm opacity-50">{message}</p>
    </Card>
  );
}
