"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Coffee, MapPin, ShoppingBag, Star } from "lucide-react";
import type { MenuItem } from "@/lib/supabase";

const menu: MenuItem[] = [
  {
    id: "cold-brew",
    name: "Signature Cold Brew",
    category: "Coffee",
    base_price: 180,
    image_url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80",
    is_available: true,
  },
  {
    id: "chai-latte",
    name: "Masala Chai Latte",
    category: "Tea",
    base_price: 120,
    image_url: "https://images.unsplash.com/photo-1544787210-2827448636b2?auto=format&fit=crop&w=500&q=80",
    is_available: true,
  },
  {
    id: "filter-coffee",
    name: "Filter Coffee",
    category: "Coffee",
    base_price: 90,
    image_url: "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&w=500&q=80",
    is_available: true,
  },
];

export default function OutletMenuPage() {
  const { addItem, totalItems } = useCart();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-5">
        <Card className="p-0 overflow-hidden bg-white border-black/5">
          <div className="h-48 relative">
            <img
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80"
              alt="Okhla Hub"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-5 left-5 text-white">
              <h1 className="text-3xl font-heading">Okhla Hub</h1>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-80">
                <MapPin size={14} /> 1.2km away
              </p>
            </div>
          </div>
        </Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Star size={16} className="text-accent-gold fill-accent-gold" />
            4.8 rating
          </div>
          <Link href="/app/cart">
            <Button className="bg-accent-brown text-white px-4">
              <ShoppingBag size={16} className="mr-2" />
              {totalItems}
            </Button>
          </Link>
        </div>
      </header>

      <section className="grid gap-4">
        {menu.map((item) => (
          <Card key={item.id} className="p-4 bg-white border-black/5 flex gap-4">
            <img src={item.image_url || ""} alt={item.name} className="h-24 w-24 rounded-2xl object-cover" />
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{item.category}</p>
                <h2 className="text-lg font-heading">{item.name}</h2>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl text-number">Rs {item.base_price}</span>
                <Button className="bg-accent-brown text-white px-4" onClick={() => addItem(item)}>
                  <Coffee size={16} className="mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
