"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, Shield, UserPlus, Users } from "lucide-react";

const team = [
  { name: "Aarav Mehta", email: "aarav@janubhai.coffee", role: "Manager", outlet: "Okhla Hub", status: "Active" },
  { name: "Priya Saini", email: "priya@janubhai.coffee", role: "Cashier", outlet: "Okhla Hub", status: "Active" },
  { name: "Naman Khan", email: "naman@janubhai.coffee", role: "Kitchen", outlet: "Saket Hub", status: "Training" },
  { name: "Riya Kapoor", email: "riya@janubhai.coffee", role: "Regional Admin", outlet: "Delhi NCR", status: "Active" },
];

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const filteredTeam = team.filter((user) =>
    `${user.name} ${user.email} ${user.role} ${user.outlet}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading tracking-tight">Users & Roles</h1>
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Staff access and permissions</p>
        </div>
        <Button className="bg-accent-brown text-white px-4">
          <UserPlus size={18} className="mr-2" />
          Invite
        </Button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search users, roles, or outlets"
          className="w-full rounded-2xl border border-black/5 bg-white py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-brown/10"
        />
      </div>

      <section className="grid gap-4">
        {filteredTeam.map((user) => (
          <Card key={user.email} className="p-5 bg-white border-black/5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-accent-brown text-white flex items-center justify-center font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold truncate">{user.name}</h2>
                <p className="text-xs opacity-50 truncate">{user.email}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">{user.outlet}</p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-brown/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                <Shield size={12} />
                {user.role}
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent-green">{user.status}</p>
            </div>
          </Card>
        ))}
        {filteredTeam.length === 0 && (
          <Card glass className="p-10 text-center">
            <Users className="mx-auto mb-4 opacity-30" />
            <h2 className="text-xl font-heading">No users found</h2>
            <p className="text-sm opacity-50">Try a different search term.</p>
          </Card>
        )}
      </section>
    </div>
  );
}
