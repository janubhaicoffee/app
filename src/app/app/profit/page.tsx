"use client";

import { Card } from "@/components/ui/Card";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

const days = [
  { day: "Mon", sales: 5200, expenses: 1300 },
  { day: "Tue", sales: 6100, expenses: 1450 },
  { day: "Wed", sales: 6420, expenses: 1250 },
  { day: "Thu", sales: 5800, expenses: 1700 },
  { day: "Fri", sales: 7300, expenses: 2100 },
];

export default function ProfitPage() {
  const sales = days.reduce((sum, day) => sum + day.sales, 0);
  const expenses = days.reduce((sum, day) => sum + day.expenses, 0);
  const profit = sales - expenses;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl font-heading tracking-tight">Profit Breakdown</h1>
        <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Weekly outlet economics</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-accent-brown text-white">
          <TrendingUp className="mb-4 opacity-50" />
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Sales</p>
          <h2 className="text-3xl text-number">Rs {sales.toLocaleString()}</h2>
        </Card>
        <Card className="p-6 bg-white">
          <TrendingDown className="mb-4 text-accent-red" />
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Expenses</p>
          <h2 className="text-3xl text-number text-accent-red">Rs {expenses.toLocaleString()}</h2>
        </Card>
        <Card className="p-6 bg-accent-green text-white">
          <Wallet className="mb-4 opacity-70" />
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Net Profit</p>
          <h2 className="text-3xl text-number">Rs {profit.toLocaleString()}</h2>
        </Card>
      </section>

      <Card glass className="p-6 space-y-5">
        <h2 className="text-xl font-heading">Daily trend</h2>
        {days.map((day) => (
          <div key={day.day} className="grid grid-cols-[44px_1fr_80px] items-center gap-4">
            <span className="text-xs font-bold opacity-40">{day.day}</span>
            <div className="h-3 rounded-full bg-accent-brown/5 overflow-hidden">
              <div className="h-full rounded-full bg-accent-brown" style={{ width: `${Math.round((day.sales / 7500) * 100)}%` }} />
            </div>
            <span className="text-right text-xs font-bold">Rs {day.sales}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
