"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, ReceiptText } from "lucide-react";

const expenses = [
  { category: "Raw Material", amount: 1250, note: "Milk and cream", time: "Today, 10:30" },
  { category: "Electricity", amount: 850, note: "Utility bill", time: "Today, 08:20" },
  { category: "Maintenance", amount: 400, note: "Machine cleaning", time: "Yesterday" },
];

export default function ExpensesPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading tracking-tight">Expense Log</h1>
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Daily outlet costs</p>
        </div>
        <Link href="/app/add-expense">
          <Button className="bg-accent-brown text-white px-4">
            <Plus size={18} className="mr-2" />
            Add
          </Button>
        </Link>
      </header>

      <section className="grid gap-4">
        {expenses.map((expense) => (
          <Card key={`${expense.category}-${expense.time}`} className="p-5 bg-white border-black/5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-accent-brown/5 p-3">
                <ReceiptText size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold">{expense.category}</h2>
                <p className="text-xs opacity-50">{expense.note}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">{expense.time}</p>
              </div>
            </div>
            <span className="text-xl text-number text-accent-red">Rs {expense.amount}</span>
          </Card>
        ))}
      </section>
    </div>
  );
}
