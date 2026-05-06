import { BottomNav } from "@/components/ui/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-cream text-accent-brown">
      <main className="max-w-4xl mx-auto p-6 md:p-10 pb-40">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
