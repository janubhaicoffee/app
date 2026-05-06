"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ReceiptText } from "lucide-react";

const categories = ["Rent", "Electricity", "Raw Material", "Maintenance", "Misc"];

export default function AddExpensePage() {
  const [category, setCategory] = useState(categories[2]);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl font-heading tracking-tight">Add Expense</h1>
        <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Log outlet cost with category</p>
      </header>

      <Card glass className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {categories.map((item) => (
            <button
              key={item}
              className={`rounded-2xl border p-4 text-sm font-bold transition-colors ${category === item ? "border-accent-brown bg-accent-brown/5" : "border-black/5 bg-white"}`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <input
          type="number"
          placeholder="Amount"
          className="w-full rounded-2xl border border-black/5 bg-white px-5 py-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-accent-brown/10"
        />
        <textarea
          placeholder="Note"
          rows={4}
          className="w-full resize-none rounded-2xl border border-black/5 bg-white px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent-brown/10"
        />
        <Button fullWidth className="bg-accent-brown text-white py-5" onClick={() => setSubmitted(true)}>
          <ReceiptText size={18} className="mr-2" />
          Save expense
        </Button>
        {submitted && <p className="text-center text-sm font-bold text-accent-green">Expense logged for {category}.</p>}
      </Card>
    </div>
  );
}
