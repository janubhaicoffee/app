"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { SEO } from '@/components/ui/SEO';
import { Card } from '@/components/ui/Card';
import { MagneticButton } from '@/components/ui/motion/MagneticButton';
import { Button } from '@/components/ui/Button';
import { Vote, MapPin, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

interface Poll {
  id: string;
  question: string;
  cost: number;
  optionA: { label: string; votes: number };
  optionB: { label: string; votes: number };
}

const MOCK_POLLS: Poll[] = [
  {
    id: '1',
    question: 'Where should we open the next Adda?',
    cost: 10,
    optionA: { label: 'North Campus', votes: 342 },
    optionB: { label: 'Hauz Khas', votes: 289 },
  },
  {
    id: '2',
    question: 'Should we add Kulhad as a cup option?',
    cost: 5,
    optionA: { label: 'Yes, Kulhad FTW', votes: 580 },
    optionB: { label: 'Nah, keep it simple', votes: 412 },
  },
];

function VotingCard({ poll }: { poll: Poll }) {
  const [voted, setVoted] = useState<'A' | 'B' | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const bgOpacityA = useTransform(x, [-200, 0], [0.3, 0]);
  const bgOpacityB = useTransform(x, [0, 200], [0, 0.3]);

  const totalVotes = poll.optionA.votes + poll.optionB.votes;
  const pctA = Math.round((poll.optionA.votes / totalVotes) * 100);
  const pctB = 100 - pctA;

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -100) {
      setVoted('A');
    } else if (info.offset.x > 100) {
      setVoted('B');
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto" style={{ minHeight: 420 }}>
      <AnimatePresence mode="wait">
        {!voted ? (
          <motion.div
            key="card"
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="cursor-grab active:cursor-grabbing"
          >
            <Card className="bg-white border-2 border-espresso-900/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              {/* Swipe Indicators */}
              <motion.div
                style={{ opacity: bgOpacityA }}
                className="absolute inset-0 bg-accent-gold rounded-[2rem] pointer-events-none"
              />
              <motion.div
                style={{ opacity: bgOpacityB }}
                className="absolute inset-0 bg-accent-red rounded-[2rem] pointer-events-none"
              />

              <div className="relative z-10 space-y-8">
                {/* Cost Badge */}
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-espresso-900/40 flex items-center gap-1">
                    <Vote size={12} /> Community Poll
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent-red flex items-center gap-1">
                    <Zap size={10} /> {poll.cost} Credits to Vote
                  </span>
                </div>

                {/* Question */}
                <h3 className="text-2xl md:text-3xl font-heading tracking-tight uppercase text-espresso-900 leading-tight text-center">
                  {poll.question}
                </h3>

                {/* Swipe Hint */}
                <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest pt-4">
                  <div className="flex items-center gap-2 text-accent-gold">
                    <ChevronLeft size={16} /> {poll.optionA.label}
                  </div>
                  <div className="flex items-center gap-2 text-accent-red">
                    {poll.optionB.label} <ChevronRight size={16} />
                  </div>
                </div>

                <p className="text-center text-espresso-900/30 text-xs font-bold uppercase tracking-widest">
                  ← Swipe to vote →
                </p>

                {/* Desktop Fallback Buttons */}
                <div className="flex gap-4 pt-2">
                  <MagneticButton intensity={0.2} className="flex-1">
                    <Button
                      fullWidth
                      onClick={() => setVoted('A')}
                      size="lg"
                      className="bg-accent-gold text-espresso-900 rounded-full font-bold uppercase tracking-widest py-5 hover:bg-espresso-900 hover:text-bg-cream transition-all"
                    >
                      {poll.optionA.label}
                    </Button>
                  </MagneticButton>
                  <MagneticButton intensity={0.2} className="flex-1">
                    <Button
                      fullWidth
                      onClick={() => setVoted('B')}
                      size="lg"
                      className="bg-accent-red text-white rounded-full font-bold uppercase tracking-widest py-5 hover:bg-espresso-900 transition-all"
                    >
                      {poll.optionB.label}
                    </Button>
                  </MagneticButton>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          /* Results View */
          <motion.div
            key="results"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <Card className="bg-white border-2 border-espresso-900/10 rounded-[2rem] p-8 shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <p className="text-accent-red text-[10px] font-bold uppercase tracking-widest">Vote Recorded</p>
                <h3 className="text-xl font-heading tracking-tight uppercase text-espresso-900">{poll.question}</h3>
                <p className="text-espresso-900/40 text-xs font-bold uppercase tracking-widest">
                  {totalVotes + 1} Total Votes
                </p>
              </div>

              {/* Results Bars */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold uppercase tracking-wider">
                    <span className="text-espresso-900 flex items-center gap-2">
                      <MapPin size={12} /> {poll.optionA.label}
                      {voted === 'A' && <span className="text-accent-gold text-[10px]">(Your Vote)</span>}
                    </span>
                    <span className="text-accent-gold font-number font-black">{voted === 'A' ? pctA + 1 : pctA}%</span>
                  </div>
                  <div className="h-4 bg-espresso-900/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${voted === 'A' ? pctA + 1 : pctA}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-accent-gold rounded-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold uppercase tracking-wider">
                    <span className="text-espresso-900 flex items-center gap-2">
                      <MapPin size={12} /> {poll.optionB.label}
                      {voted === 'B' && <span className="text-accent-red text-[10px]">(Your Vote)</span>}
                    </span>
                    <span className="text-accent-red font-number font-black">{voted === 'B' ? pctB + 1 : pctB}%</span>
                  </div>
                  <div className="h-4 bg-espresso-900/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${voted === 'B' ? pctB + 1 : pctB}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      className="h-full bg-accent-red rounded-full"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VotePage() {
  return (
    <div className="min-h-screen bg-bg-cream text-espresso-900 font-sans selection:bg-accent-red selection:text-white pb-24">
      <SEO title="Adda DAO | Janu Bhai" description="Vote on the future of the movement." />

      <header className="max-w-4xl mx-auto px-6 pt-12 pb-8 text-center space-y-4">
        <p className="text-accent-red text-xs font-bold uppercase tracking-[0.4em]">Decentralized Governance</p>
        <h1 className="text-5xl md:text-7xl font-heading tracking-tighter uppercase text-espresso-900">
          The Adda <span className="text-accent-gold">DAO</span>
        </h1>
        <p className="text-espresso-900/40 font-bold uppercase tracking-widest text-sm max-w-md mx-auto">
          Your credits. Your voice. Shape the movement.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-6 space-y-12">
        {MOCK_POLLS.map((poll) => (
          <VotingCard key={poll.id} poll={poll} />
        ))}
      </main>
    </div>
  );
}
