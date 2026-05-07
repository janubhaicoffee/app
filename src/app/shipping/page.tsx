"use client";

import { LegalPage } from '@/components/ui/LegalPage';
import { Truck, Clock, IndianRupee, MapPin } from 'lucide-react';

export default function ShippingPage() {
  return (
    <LegalPage
      title="Shipping & Delivery"
      lastUpdated="May 07, 2026"
      content={
        <div className="space-y-12">
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <MapPin size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">1. Shipping Coverage</h3>
            </div>
            <p>Janu Bhai Coffee currently delivers fresh roasted beans and merchandise across major cities in India. Delivery for prepared beverages is restricted to the local vicinity of our outlets.</p>
            <p>We are actively expanding our delivery network. Check our platform for the most up-to-date serviceable areas.</p>
          </section>

          <div className="h-px bg-accent-brown/5" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <Clock size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">2. Delivery Timeline</h3>
            </div>
            <p>Orders for roasted beans are typically processed within 24-48 hours. Estimated delivery time is 3-5 business days depending on the location.</p>
            <div className="bg-accent-brown/[0.03] rounded-2xl p-6 border border-accent-brown/5">
              <p className="text-[11px] font-bold uppercase tracking-widest opacity-40 mb-3">Delivery Estimates</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-bold">Metro Cities:</span> 2-3 days</div>
                <div><span className="font-bold">Tier 2 Cities:</span> 3-5 days</div>
                <div><span className="font-bold">Rural Areas:</span> 5-7 days</div>
                <div><span className="font-bold">Express (Delhi NCR):</span> Same day</div>
              </div>
            </div>
          </section>

          <div className="h-px bg-accent-brown/5" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <IndianRupee size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">3. Shipping Charges</h3>
            </div>
            <p>Shipping charges are calculated based on the weight of the order and the delivery destination. Standard shipping is free for orders above ₹999.</p>
          </section>

          <div className="h-px bg-accent-brown/5" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-brown/5 rounded-xl flex items-center justify-center text-accent-brown">
                <Truck size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">4. Tracking</h3>
            </div>
            <p>Once your order is shipped, you will receive a tracking link via email or SMS to monitor the status of your delivery in real-time.</p>
          </section>
        </div>
      }
    />
  );
}
