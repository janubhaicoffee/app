"use client";

import { Card } from "@/components/ui/Card";
import { BarChart3, Store, TrendingUp, Wallet } from "lucide-react";

const outlets = [
  { name: "Okhla Hub", sales: 124000, expenses: 36200, rank: "Top" },
  { name: "Saket Hub", sales: 98400, expenses: 29800, rank: "Stable" },
  { name: "CP Hub", sales: 87600, expenses: 42100, rank: "Watch" },
];

export default function GlobalFinancePage() {
  const sales = outlets.reduce((sum, outlet) => sum + outlet.sales, 0);
  const expenses = outlets.reduce((sum, outlet) => sum + outlet.expenses, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl font-heading tracking-tight">Global Finance</h1>
        <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Network-wide performance</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-accent-brown text-white">
          <TrendingUp className="mb-4 opacity-60" />
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Sales</p>
          <h2 className="text-3xl text-number">Rs {sales.toLocaleString()}</h2>
        </Card>
        <Card className="p-6 bg-white">
          <Wallet className="mb-4 text-accent-red" />
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Expenses</p>
          <h2 className="text-3xl text-number text-accent-red">Rs {expenses.toLocaleString()}</h2>
        </Card>
        <Card className="p-6 bg-accent-green text-white">
          <BarChart3 className="mb-4 opacity-70" />
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Margin</p>
          <h2 className="text-3xl text-number">{Math.round(((sales - expenses) / sales) * 100)}%</h2>
        </Card>
      </section>

      <section className="grid gap-4">
        {outlets.map((outlet) => (
          <Card key={outlet.name} className="p-5 bg-white border-black/5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-accent-brown/5 p-3">
                <Store size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold">{outlet.name}</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{outlet.rank}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">Rs {outlet.sales.toLocaleString()}</p>
              <p className="text-[10px] opacity-40">Exp Rs {outlet.expenses.toLocaleString()}</p>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
