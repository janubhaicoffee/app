"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '@/components/ui/SEO';
import { Card } from '@/components/ui/Card';
import { Mascot } from '@/components/ui/motion/Mascot';
import { CheckCircle2, Circle, Gauge, Thermometer, SprayCan, ShieldCheck } from 'lucide-react';

interface QATask {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  checked: boolean;
}

const INITIAL_TASKS: QATask[] = [
  {
    id: 'pressure',
    title: 'Espresso Machine Pressure',
    description: 'Verify extraction gauge reads 9 bar. Flush group head for 5 seconds.',
    icon: Gauge,
    checked: false,
  },
  {
    id: 'milk',
    title: 'Milk Temperature Calibrated',
    description: 'Fridge at 4°C. Steam wand purged. Fresh milk batch loaded.',
    icon: Thermometer,
    checked: false,
  },
  {
    id: 'hygiene',
    title: 'Floor & Counter Hygiene',
    description: 'Mopped, sanitized, and dry. Waste bin emptied. Handwash station stocked.',
    icon: SprayCan,
    checked: false,
  },
];

export default function QAPage() {
  const [tasks, setTasks] = useState<QATask[]>(INITIAL_TASKS);
  const [storeReady, setStoreReady] = useState(false);

  const allChecked = tasks.every((t) => t.checked);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => t.id === id ? { ...t, checked: !t.checked } : t);
      const nowAllDone = updated.every((t) => t.checked);
      if (nowAllDone && !storeReady) {
        // Log to Supabase store_logs in production
        setTimeout(() => setStoreReady(true), 300);
      }
      return updated;
    });
  }, [storeReady]);

  return (
    <div className="min-h-screen bg-bg-cream text-espresso-900 font-sans selection:bg-accent-red selection:text-white p-6 md:p-12 pb-24">
      <SEO title="Quality Control | Janu Bhai OS" description="Daily pre-open audit for franchise operators." />

      <header className="max-w-2xl mx-auto mb-12 space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-accent-red" size={28} />
          <h1 className="text-3xl font-heading font-black tracking-tighter uppercase text-espresso-900">
            Poshtik QA Audit
          </h1>
        </div>
        <p className="text-espresso-900/50 font-bold uppercase tracking-widest text-xs">
          Complete all checks before the first order of the day
        </p>
      </header>

      <div className="max-w-2xl mx-auto space-y-4">
        <AnimatePresence>
          {!storeReady ? (
            <motion.div key="checklist" className="space-y-4">
              {tasks.map((task, idx) => {
                const Icon = task.icon;
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="w-full text-left"
                    >
                      <Card className={`p-6 rounded-2xl border-2 transition-all duration-300 flex items-start gap-5 group ${
                        task.checked
                          ? 'bg-accent-gold/10 border-accent-gold/30 shadow-lg'
                          : 'bg-white border-espresso-900/10 hover:border-espresso-900/20'
                      }`}>
                        {/* Check Icon */}
                        <div className={`mt-1 shrink-0 transition-colors ${task.checked ? 'text-accent-gold' : 'text-espresso-900/20 group-hover:text-espresso-900/40'}`}>
                          {task.checked ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <Icon size={16} className={task.checked ? 'text-accent-gold' : 'text-espresso-900/40'} />
                            <h3 className={`font-bold uppercase tracking-wider text-sm ${
                              task.checked ? 'text-espresso-900 line-through decoration-accent-gold decoration-2' : 'text-espresso-900'
                            }`}>
                              {task.title}
                            </h3>
                          </div>
                          <p className="text-xs font-medium text-espresso-900/40 leading-relaxed ml-7">
                            {task.description}
                          </p>
                        </div>
                      </Card>
                    </button>
                  </motion.div>
                );
              })}

              {/* Progress */}
              <div className="pt-4">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-espresso-900/40 mb-2">
                  <span>Audit Progress</span>
                  <span>{tasks.filter(t => t.checked).length}/{tasks.length}</span>
                </div>
                <div className="h-2 bg-espresso-900/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent-gold rounded-full"
                    animate={{ width: `${(tasks.filter(t => t.checked).length / tasks.length) * 100}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            /* STORE READY Celebration */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex flex-col items-center text-center py-16 space-y-8"
            >
              <Mascot size={180} state="success" />

              <div className="space-y-3">
                <h2 className="text-5xl md:text-7xl font-heading tracking-tighter uppercase text-accent-gold leading-none">
                  Store Ready
                </h2>
                <p className="text-espresso-900/50 font-bold uppercase tracking-widest text-sm max-w-sm">
                  All quality checks passed. POS terminal unlocked. Let's brew.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 bg-accent-gold/20 text-accent-gold px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest">
                <ShieldCheck size={14} /> Audit logged at {new Date().toLocaleTimeString('en-IN')}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
