"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChevronRight, History, MapPin, Star, Users, Zap } from "lucide-react";

const bestsellers = [
  {
    id: "cold-brew",
    name: "Cold Brew",
    category: "Coffee",
    base_price: 180,
    image_url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80",
    is_available: true,
  },
  {
    id: "chai-latte",
    name: "Chai Latte",
    category: "Tea",
    base_price: 120,
    image_url: "https://images.unsplash.com/photo-1544787210-2827448636b2?auto=format&fit=crop&w=400&q=80",
    is_available: true,
  },
  {
    id: "latte",
    name: "Latte",
    category: "Coffee",
    base_price: 160,
    image_url: "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&w=400&q=80",
    is_available: true,
  },
];

export default function CustomerHome() {
  const router = useRouter();
  const { addItem } = useCart();

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading tracking-tight">
            Kyun, Janu?
            <br />
            Aaj kya chal raha?
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
            Your coffee ritual - daily
          </p>
        </div>
        <div className="w-12 h-12 bg-accent-brown rounded-2xl flex items-center justify-center text-white shadow-xl shadow-accent-brown/20">
          <Star size={20} />
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Closest to you</h2>
        <Card
          glass
          hoverLift
          className="p-6 border-accent-brown/10 flex justify-between items-center bg-white/40 cursor-pointer"
          onClick={() => router.push("/app/outlet/okhla")}
        >
          <div className="flex gap-4 items-center">
            <div className="p-4 bg-accent-brown text-white rounded-2xl">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="text-xl font-heading">Okhla Hub</h3>
              <p className="text-xs opacity-50 flex items-center gap-1">
                <Star size={10} className="fill-accent-brown text-accent-brown" />
                4.8 - 1.2km away
              </p>
            </div>
          </div>
          <div className="p-3 bg-bg-cream rounded-full">
            <ChevronRight size={16} />
          </div>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Bestsellers</h2>
          <button
            className="text-[10px] font-bold text-accent-red tracking-widest hover:opacity-70 transition-opacity"
            onClick={() => router.push("/app/outlet/okhla")}
          >
            VIEW MENU
          </button>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar -mx-6 px-6">
          {bestsellers.map((item) => (
            <Card
              key={item.id}
              className="min-w-[200px] snap-start p-5 space-y-4 bg-white border-black/5 rounded-[40px] shadow-xl shadow-accent-brown/5 hover:shadow-2xl transition-all duration-500 press-effect group"
            >
              <div className="overflow-hidden rounded-[24px]">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-md font-heading tracking-tight">{item.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-xl text-number">Rs {item.base_price}</span>
                  <button
                    className="p-3 bg-accent-brown text-white rounded-2xl shadow-xl shadow-accent-brown/20 hover:bg-accent-red transition-colors"
                    onClick={() => addItem(item)}
                    aria-label={`Add ${item.name}`}
                  >
                    <Zap size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Community board</h2>
        <Card glass className="p-10 bg-accent-red text-white space-y-8 rounded-[50px] relative overflow-hidden group border-none shadow-2xl shadow-accent-red/20">
          <div className="absolute right-[-40px] top-[-40px] text-white/10 group-hover:scale-125 transition-transform duration-1000 rotate-12">
            <Users size={200} />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-white/20 rounded-full text-[9px] font-bold uppercase tracking-[0.2em]">
                Live event
              </div>
              <span className="text-[11px] font-bold opacity-60 tracking-wider">TODAY - 6:00 PM</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-heading leading-none tracking-tighter">
                Poetry Open Mic
                <br />
                @ Okhla Hub
              </h3>
              <p className="text-lg opacity-80 leading-relaxed font-medium">
                Bring your notes, grab a brew.
                <br />
                Real people, real stories.
              </p>
            </div>
            <Button className="bg-white text-accent-red font-bold uppercase tracking-[0.2em] text-[10px] py-5 px-10 rounded-[20px] shadow-xl hover:scale-105 transition-transform">
              Secure your spot
            </Button>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Recent order</h2>
        <Card className="p-5 flex justify-between items-center bg-white border-black/5">
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-accent-brown-muted rounded-xl text-accent-brown">
              <History size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold">1x Vietnamese Iced Coffee</h3>
              <p className="text-[10px] opacity-40 uppercase tracking-widest">Ordered 2 days ago</p>
            </div>
          </div>
          <Button variant="ghost" className="text-accent-red font-bold text-xs uppercase tracking-widest">
            Reorder
          </Button>
        </Card>
      </section>
    </div>
  );
}
