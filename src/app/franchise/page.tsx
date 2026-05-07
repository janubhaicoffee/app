"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  IndianRupee, 
  ShieldCheck, 
  ChevronRight, 
  Users, 
  TrendingUp, 
  Building2, 
  Eye, 
  FileText, 
  Video, 
  Target,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SEO } from '@/components/ui/SEO';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export default function FranchisePublicPage() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-bg-cream text-accent-brown selection:bg-accent-red selection:text-white">
      <SEO 
        title="Start Your Coffee Empire | Janu Bhai Franchise" 
        description="Join the Janu Bhai decentralized coffee chain. Own a part of a community-powered movement. Low investment, high returns, and full tech support."
        keywords="coffee franchise india, start coffee shop india, janu bhai coffee partnership"
      />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center pt-24 pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/franchise.png" alt="Proud Franchise Owner" className="w-full h-full object-cover opacity-20 grayscale brightness-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-cream/50 via-transparent to-bg-cream" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-red/10 border border-accent-red/20 text-accent-red text-[10px] font-bold uppercase tracking-[0.3em] mb-4"
          >
            <Zap size={14} />
            A Decentralized Coffee Chain
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-heading tracking-tighter leading-[0.85] uppercase"
          >
            Own Part.<br/><span className="text-accent-red">Earn Forever.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl font-medium opacity-70 max-w-2xl mx-auto leading-relaxed"
          >
            Janu Bhai Coffee is a people-powered movement. We build and run outlets in your community — and you become a 5-year partner in that outlet's success.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
          >
            <Button size="lg" className="px-12 py-8 text-xl" onClick={() => document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })}>
              Apply to Partner
            </Button>
            <Button variant="outline" size="lg" className="px-12 py-8 text-xl border-accent-brown/20" onClick={() => document.getElementById('financials')?.scrollIntoView({ behavior: 'smooth' })}>
              View Financials
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: <Users />, title: "FOR PEOPLE", desc: "Creating jobs and local opportunities." },
            { icon: <CheckCircle2 />, title: "FOR COMMUNITY", desc: "A place to connect, share & grow." },
            { icon: <TrendingUp />, title: "FOR INVESTORS", desc: "A stable, transparent and scalable income." },
            { icon: <Building2 />, title: "FOR FUTURE", desc: "Building a strong, self-reliant brand." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-8 bg-white border border-black/5 rounded-[40px] space-y-4 text-center group transition-all duration-500 hover:shadow-2xl hover:shadow-accent-brown/5"
            >
              <div className="w-16 h-16 bg-accent-brown/5 rounded-2xl flex items-center justify-center text-accent-brown mx-auto group-hover:bg-accent-brown group-hover:text-white transition-colors duration-500">
                {item.icon}
              </div>
              <h4 className="font-bold text-xs tracking-[0.2em] uppercase opacity-40">{item.title}</h4>
              <p className="text-sm font-medium opacity-70">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Investment Overview & Sample Financials */}
      <section id="financials" className="py-24 px-6 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left Side: Overview */}
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-accent-red">Investment Overview</h2>
              <h3 className="text-5xl font-heading tracking-tight leading-none uppercase">Transparent.<br/>Realistic. <span className="text-accent-red">Honest.</span></h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <Card className="p-10 border-black/5 bg-bg-cream/30 rounded-[48px] space-y-4 relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 text-black/[0.03] group-hover:scale-110 transition-transform duration-700">
                  <IndianRupee size={160} />
                </div>
                <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">Investment per outlet</p>
                <div className="text-5xl font-heading text-number leading-none">₹1,00,000</div>
                <ul className="space-y-3 pt-6">
                  {['One-time investment', 'No royalty or hidden fees', '5-year partnership agreement', 'Exit option available'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider opacity-60">
                      <div className="w-4 h-4 bg-accent-green/10 text-accent-green rounded-full flex items-center justify-center">
                        <CheckCircle2 size={10} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-10 border-black/5 bg-accent-red/5 rounded-[48px] space-y-4 relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 text-accent-red/[0.03] group-hover:scale-110 transition-transform duration-700">
                  <TrendingUp size={160} />
                </div>
                <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">Your 5-Year Share</p>
                <div className="text-5xl font-heading text-accent-red leading-none">20%</div>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-60 pt-4 leading-relaxed">
                  Of net profit from that specific outlet for 5 years.
                </p>
              </Card>
            </div>

            {/* How it works list */}
            <div className="space-y-8 pt-8">
              <h4 className="text-sm font-bold uppercase tracking-[0.3em] opacity-40">How It Works</h4>
              <div className="space-y-10">
                {[
                  { step: "01", title: "YOU INVEST", desc: "Invest ₹1,00,000 in the outlet of your choice." },
                  { step: "02", title: "WE OPERATE", desc: "Our trained team runs the outlet efficiently and professionally." },
                  { step: "03", title: "PROFIT IS MADE", desc: "Sales - All Expenses = Net Profit (Transparent monthly reporting)" },
                  { step: "04", title: "YOU EARN", desc: "You receive 20% of the Net Profit every month, for 5 years." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 items-start">
                    <div className="w-12 h-12 bg-accent-brown text-white rounded-2xl flex items-center justify-center font-heading text-xl shrink-0">
                      {item.step}
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-bold uppercase tracking-widest text-sm">{item.title}</h5>
                      <p className="text-md opacity-60 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Financial Table */}
          <div className="space-y-8">
            <h4 className="text-xs font-bold uppercase tracking-[0.4em] opacity-40 mb-8">Sample Financials (Per Outlet)</h4>
            <Card className="overflow-hidden border-black/5 rounded-[48px] shadow-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-accent-brown text-white">
                    <th className="p-6 uppercase tracking-widest text-[10px] font-bold">Daily Performance (Realistic)</th>
                    <th className="p-6 text-right uppercase tracking-widest text-[10px] font-bold">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  <tr className="border-b border-black/5">
                    <td className="p-6 opacity-60">Average Daily Sales</td>
                    <td className="p-6 text-right font-bold">5,000</td>
                  </tr>
                  <tr className="border-b border-black/5">
                    <td className="p-6 opacity-60">Cost of Goods Sold (COGS)</td>
                    <td className="p-6 text-right font-bold text-accent-red">2,000</td>
                  </tr>
                  <tr className="bg-accent-brown/5">
                    <td className="p-6 font-bold">Gross Profit</td>
                    <td className="p-6 text-right font-bold text-accent-green">3,000</td>
                  </tr>
                  
                  <tr className="bg-accent-red text-white">
                    <th className="p-6 uppercase tracking-widest text-[10px] font-bold">Monthly Performance (30 Days)</th>
                    <th className="p-6 text-right uppercase tracking-widest text-[10px] font-bold"></th>
                  </tr>
                  <tr className="border-b border-black/5">
                    <td className="p-6 opacity-60">Total Sales</td>
                    <td className="p-6 text-right font-bold">1,50,000</td>
                  </tr>
                  <tr className="border-b border-black/5">
                    <td className="p-6 opacity-60">Total COGS</td>
                    <td className="p-6 text-right font-bold">60,000</td>
                  </tr>
                  <tr className="border-b border-black/5">
                    <td className="p-6 opacity-60">Gross Profit</td>
                    <td className="p-6 text-right font-bold">90,000</td>
                  </tr>
                  <tr className="border-b border-black/5">
                    <td className="p-6 opacity-60">Operating Expenses<br/><span className="text-[10px] opacity-40 uppercase">(Rent, Salaries, Utilities, etc.)</span></td>
                    <td className="p-6 text-right font-bold text-accent-red">35,000</td>
                  </tr>
                  <tr className="bg-accent-green/10">
                    <td className="p-6 font-bold text-accent-green">Net Profit (Before Tax)</td>
                    <td className="p-6 text-right font-bold text-accent-green">55,000</td>
                  </tr>

                  <tr className="bg-accent-brown/5">
                    <td className="p-8 text-center" colSpan={2}>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Your 20% Share (5-Year Agreement)</p>
                        <div className="flex justify-around items-center pt-4">
                          <div className="text-center">
                            <div className="text-3xl font-heading text-accent-brown">₹11,000</div>
                            <p className="text-[9px] font-bold uppercase opacity-30 mt-1">Per Month</p>
                          </div>
                          <div className="h-10 w-px bg-accent-brown/10" />
                          <div className="text-center">
                            <div className="text-3xl font-heading text-accent-red">₹1,32,000</div>
                            <p className="text-[9px] font-bold uppercase opacity-30 mt-1">Per Year</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Card>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-30 text-center">
              *Figures are illustrative and may vary by location and performance.
            </p>
          </div>
        </div>
      </section>

      {/* Control & Oversight */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-accent-red">Transparency First</h2>
          <h3 className="text-5xl font-heading tracking-tight uppercase">Investor Control & <span className="text-accent-red italic">Oversight</span></h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: <Eye />, title: "LIVE SALES DASHBOARD", desc: "Real-time access to daily sales data via the Janu Bhai OS." },
            { icon: <FileText />, title: "MONTHLY REPORTS", desc: "Detailed P&L statements shared every month for full clarity." },
            { icon: <Video />, title: "CCTV SURVEILLANCE", desc: "24/7 outlet monitoring accessible for complete transparency." },
            { icon: <Target />, title: "MANAGEMENT CHECKS", desc: "Regular field visits and operational audits by our HQ team." }
          ].map((item, i) => (
            <div key={i} className="space-y-6 p-8 bg-white rounded-[40px] border border-black/5 text-center">
              <div className="w-14 h-14 bg-bg-cream rounded-full flex items-center justify-center text-accent-brown mx-auto">
                {item.icon}
              </div>
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-widest text-[11px] leading-tight">{item.title}</h4>
                <p className="text-[12px] font-medium opacity-50 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto p-12 bg-accent-brown text-white rounded-[48px] text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent-red/10 animate-pulse" />
          <div className="relative z-10">
            <h4 className="text-3xl font-heading tracking-tight uppercase">Your Asset. Our Operations.</h4>
            <p className="text-lg opacity-80 leading-relaxed font-medium">
              We handle the headache of hiring, supply chain, and local regulations. You focus on owning and scaling your portfolio.
            </p>
          </div>
        </div>
      </section>

      {/* Why Invest Section */}
      <section className="py-24 px-6 bg-accent-brown text-bg-cream">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-4">
            <h2 className="text-accent-gold font-bold uppercase tracking-[0.4em] text-[10px]">The Janu Bhai Edge</h2>
            <h3 className="text-5xl md:text-7xl font-heading tracking-tight uppercase">Why Invest <span className="italic">Now?</span></h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 text-center">
            {[
              { icon: <MapPin />, title: "High Daily Footfall", desc: "Coffee is an everyday habit, not a luxury." },
              { icon: <IndianRupee />, title: "Low Entry Barrier", desc: "Affordable entry with long-term income potential." },
              { icon: <Zap />, title: "Decentralized Model", desc: "Many independent outlets, one strong brand." },
              { icon: <ShieldCheck />, title: "Central Support", desc: "Brand, training, supply & marketing by our team." },
              { icon: <TrendingUp />, title: "Scalable Growth", desc: "More outlets, more impact, better returns." }
            ].map((item, i) => (
              <div key={i} className="space-y-6">
                <div className="w-16 h-16 border border-white/10 rounded-2xl flex items-center justify-center text-accent-gold mx-auto group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold uppercase tracking-widest text-[10px]">{item.title}</h4>
                  <p className="text-[12px] opacity-50 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="apply" className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="space-y-4">
            <h2 className="text-6xl md:text-8xl font-heading tracking-tighter uppercase leading-[0.85]">Let's Brew<br/><span className="text-accent-red">Success.</span></h2>
            <p className="text-xl md:text-2xl font-medium opacity-60">Build wealth. Create impact. Partner with Janu Bhai Coffee.</p>
          </div>

          <form className="space-y-4 max-w-lg mx-auto pt-12">
            <input type="text" placeholder="FULL NAME" className="w-full bg-white border border-black/5 rounded-[32px] py-6 px-10 text-lg focus:outline-none focus:ring-4 focus:ring-accent-brown/5 shadow-sm transition-all uppercase font-bold tracking-widest text-xs" />
            <input type="email" placeholder="EMAIL ADDRESS" className="w-full bg-white border border-black/5 rounded-[32px] py-6 px-10 text-lg focus:outline-none focus:ring-4 focus:ring-accent-brown/5 shadow-sm transition-all uppercase font-bold tracking-widest text-xs" />
            <input type="tel" placeholder="WHATSAPP NUMBER" className="w-full bg-white border border-black/5 rounded-[32px] py-6 px-10 text-lg focus:outline-none focus:ring-4 focus:ring-accent-brown/5 shadow-sm transition-all uppercase font-bold tracking-widest text-xs" />
            <Button size="lg" fullWidth className="py-8 text-xl mt-4">Send Application</Button>
          </form>

          <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30 pt-12">
            © 2024 Janu Bhai Coffee Co. • A People-Powered Initiative
          </p>
        </div>
      </section>
    </div>
  );
}
