"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '@/components/ui/SEO';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock, Users, ShieldAlert, Fingerprint } from 'lucide-react';

const STAFF_MOCK = [
  { id: '1', name: 'Rahul Sharma', role: 'cashier', status: 'active', timeIn: '08:00 AM' },
  { id: '2', name: 'Vikram Singh', role: 'kitchen', status: 'active', timeIn: '07:30 AM' },
  { id: '3', name: 'Ayesha Khan', role: 'cashier', status: 'offline', timeIn: '--' },
];

export default function StaffManagementPage() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [authMode, setAuthMode] = useState(false);

  const handleClockToggle = () => {
    // In production, this would trigger a Supabase RPC to log staff_logs timestamp
    setIsClockedIn(!isClockedIn);
  };

  return (
    <div className="min-h-screen bg-bg-cream text-espresso-900 p-6 md:p-12 font-sans selection:bg-accent-red selection:text-white">
      <SEO title="Staff Roster | Janu Bhai OS" description="Manage shift operations" />

      <header className="mb-12 flex justify-between items-end border-b border-espresso-900/10 pb-6">
        <div>
          <h1 className="text-3xl font-heading font-black tracking-tighter uppercase text-espresso-900 flex items-center gap-3">
            <Users className="text-accent-red" /> Shift Operations
          </h1>
          <p className="text-espresso-900/50 font-bold tracking-widest uppercase text-xs mt-2">Ghafoor Nagar Hub</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        
        {/* Left: The Clock-In System */}
        <section className="flex flex-col justify-center items-center">
          <div className="text-center mb-8">
            <h2 className="text-sm font-bold tracking-widest uppercase text-espresso-900/50 flex items-center gap-2 justify-center mb-2">
              <Clock size={16} /> Terminal Authentication
            </h2>
            <p className="text-3xl font-heading uppercase text-espresso-900">Current Operator</p>
          </div>

          <div className="relative w-full max-w-sm aspect-square">
            <AnimatePresence mode="wait">
              {!isClockedIn ? (
                <motion.button
                  key="clock-in"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.1, opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClockToggle}
                  className="w-full h-full rounded-full bg-accent-gold text-espresso-900 border-8 border-bg-cream shadow-[0_20px_60px_rgba(255,184,0,0.4)] flex flex-col items-center justify-center gap-4 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
                  <Fingerprint size={64} strokeWidth={1} />
                  <span className="text-3xl font-black font-heading uppercase tracking-widest">Start Shift</span>
                </motion.button>
              ) : (
                <motion.button
                  key="clock-out"
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClockToggle}
                  className="w-full h-full rounded-full bg-accent-red text-white border-8 border-bg-cream shadow-[0_20px_60px_rgba(226,55,68,0.4)] flex flex-col items-center justify-center gap-4 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-black/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
                  <Clock size={64} strokeWidth={1} />
                  <span className="text-3xl font-black font-heading uppercase tracking-widest">End Shift</span>
                  <span className="text-xs font-bold tracking-widest opacity-80">Logged as: Rahul S.</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Right: The Roster */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold tracking-widest uppercase text-espresso-900/50">Active Roster</h2>
            <Button variant="outline" size="md" onClick={() => setAuthMode(!authMode)} className="text-[10px] font-bold uppercase tracking-widest border-espresso-900/20 text-espresso-900">
              <ShieldAlert size={12} className="mr-2" /> Owner Override
            </Button>
          </div>

          <Card className="bg-white border-2 border-espresso-900/10 shadow-xl overflow-hidden rounded-[2rem]">
            <div className="divide-y divide-espresso-900/10">
              {STAFF_MOCK.map((staff) => (
                <div key={staff.id} className="p-6 flex items-center justify-between hover:bg-black/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-espresso-900/10 rounded-full flex items-center justify-center text-espresso-900 font-bold uppercase">
                        {staff.name.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${staff.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                    <div>
                      <p className="font-bold text-espresso-900">{staff.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                          staff.role === 'cashier' ? 'bg-accent-gold/20 text-espresso-900' : 'bg-espresso-900/10 text-espresso-900'
                        }`}>
                          {staff.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-espresso-900/50">Clocked In</p>
                    <p className="font-bold font-number text-espresso-900">{staff.timeIn}</p>
                  </div>

                  {/* Owner Override Actions */}
                  {authMode && (
                    <div className="ml-4 flex items-center gap-2">
                      <Button size="md" className="bg-accent-red text-white text-[10px] uppercase font-bold px-3 py-1">Force Out</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </section>

      </div>
    </div>
  );
}
