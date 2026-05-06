"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center gap-6 text-center">
        <div className="rounded-full bg-accent-brown/5 p-8">
          <ShoppingBag size={42} className="opacity-40" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-heading">Cart is empty</h1>
          <p className="text-sm opacity-50">Pick a drink from the nearest hub.</p>
        </div>
        <Link href="/app/home">
          <Button className="bg-accent-brown text-white px-8">Browse menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl font-heading tracking-tight">Cart</h1>
        <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Review and checkout</p>
      </header>

      <section className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="p-5 bg-white border-black/5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold">{item.name}</h2>
              <p className="text-xs opacity-40">Rs {item.base_price} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-xl bg-accent-brown/5 p-2" onClick={() => updateQuantity(item.id, -1)}>
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
              <button className="rounded-xl bg-accent-brown/5 p-2" onClick={() => updateQuantity(item.id, 1)}>
                <Plus size={14} />
              </button>
              <button className="rounded-xl bg-accent-red/5 p-2 text-accent-red" onClick={() => removeItem(item.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          </Card>
        ))}
      </section>

      <Card glass className="p-6 space-y-5 sticky bottom-28">
        <div className="flex items-end justify-between">
          <span className="text-xs font-bold uppercase tracking-widest opacity-40">Total</span>
          <span className="text-3xl text-number">Rs {totalPrice}</span>
        </div>
        <Button fullWidth className="py-5 bg-accent-brown text-white" onClick={clearCart}>
          Place demo order
        </Button>
      </Card>
    </div>
  );
}
