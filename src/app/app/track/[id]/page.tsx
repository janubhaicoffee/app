"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Phone, MessageSquare, MapPin, CheckCircle2, Coffee, Bike, ChevronRight, Package } from 'lucide-react';

interface OrderWithDetails {
  id: string;
  order_number: string;
  status: 'pending' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_address?: string;
  created_at: string;
  estimated_delivery_time?: string;
  rider_name?: string;
  rider_phone?: string;
  outlet_name: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

const STATUS_STEPS = [
  { id: 'pending', label: 'Order Received', sub: 'We got your order, boss!', icon: Package },
  { id: 'preparing', label: 'Brewing Magic', sub: 'Janu Bhai is crafting your kaapi.', icon: Coffee },
  { id: 'out_for_delivery', label: 'On the Way', sub: 'Rider is heading to you.', icon: Bike },
  { id: 'delivered', label: 'Pahunch Gaya!', sub: 'Enjoy your coffee.', icon: CheckCircle2 },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRider, setShowRider] = useState(false);

  const orderId = params.id as string;

  useEffect(() => {
    if (!profile) {
      router.push('/');
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            status,
            total_amount,
            delivery_address,
            created_at,
            estimated_delivery_time,
            rider_name,
            rider_phone,
            outlets (name),
            order_items (
              menu_items (name),
              quantity,
              unit_price
            )
          `)
          .eq('id', orderId)
          .eq('user_id', profile.id)
          .single();

        if (error) throw error;

        if (data) {
          const formattedOrder: OrderWithDetails = {
            id: data.id,
            order_number: data.order_number,
            status: data.status,
            total_amount: data.total_amount,
            delivery_address: data.delivery_address || undefined,
            created_at: data.created_at,
            estimated_delivery_time: data.estimated_delivery_time || undefined,
            rider_name: data.rider_name || undefined,
            rider_phone: data.rider_phone || undefined,
            outlet_name: data.outlets?.name || 'Unknown Outlet',
            items: data.order_items.map((item: any) => ({
              name: item.menu_items?.name || 'Item',
              quantity: item.quantity,
              price: item.unit_price,
            })),
          };
          setOrder(formattedOrder);
          
          // Show rider card after animation delay if order is out for delivery
          if (data.status === 'out_for_delivery') {
            setTimeout(() => setShowRider(true), 1200);
          }
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, profile, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-cream">
        <div className="animate-pulse space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-accent-brown border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-cream p-6">
        <Card glass className="p-8 text-center space-y-6 max-w-md">
          <Package size={48} className="mx-auto opacity-20" />
          <h2 className="text-2xl font-heading">Order Not Found</h2>
          <p className="text-sm opacity-60">This order doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => router.push('/app/home')} className="w-full">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  const currentStatusIndex = STATUS_STEPS.findIndex(s => s.id === order.status);
  const StatusIcon = STATUS_STEPS[currentStatusIndex]?.icon || Package;

  return (
    <div className="animate-in fade-in duration-700 space-y-8 pb-20">
      <div className="flex items-center gap-4 px-1">
        <button onClick={() => router.back()} className="p-3 bg-accent-brown-muted rounded-2xl text-accent-brown press-effect">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-heading tracking-tighter">Live Track</h2>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">ID: #{order.order_number} • {order.outlet_name}</p>
        </div>
      </div>

      {/* Main Status Card */}
      <Card glass className="p-8 flex flex-col items-center text-center gap-6 border-accent-brown border-2 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 text-accent-brown/5 group-hover:scale-125 transition-transform duration-1000">
          <Coffee size={120} />
        </div>
        
        <div className="w-24 h-24 bg-accent-brown-muted rounded-full flex items-center justify-center text-accent-brown relative">
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div className="absolute inset-0 rounded-full border-4 border-accent-brown border-t-transparent animate-spin" />
          )}
          <StatusIcon size={40} className="animate-bounce-subtle" />
        </div>
        
        <div className="relative z-10">
          <h3 className="text-3xl font-heading tracking-tight">
            {order.status === 'pending' && 'Order Received!'}
            {order.status === 'preparing' && 'Brewing Your Order!'}
            {order.status === 'out_for_delivery' && 'On the way!'}
            {order.status === 'delivered' && 'Delivered Successfully!'}
            {order.status === 'cancelled' && 'Order Cancelled'}
          </h3>
          {order.estimated_delivery_time && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <p className="text-[10px] font-bold text-accent-brown uppercase tracking-[0.2em] mt-2 bg-accent-brown/10 px-4 py-1.5 rounded-full inline-block">
              ETA: {new Date(order.estimated_delivery_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </Card>

      {/* Rider Card */}
      {showRider && order.rider_name && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest px-1 mb-4">Your Captain</h3>
          <Card glass hoverLift className="p-5 flex items-center gap-5 border-black/5">
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl bg-accent-brown flex items-center justify-center font-heading text-2xl text-white shadow-xl">
                {order.rider_name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent-green border-2 border-white rounded-full flex items-center justify-center">
                <CheckCircle2 size={12} className="text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-heading text-xl">{order.rider_name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-[10px] font-bold text-accent-green uppercase tracking-widest bg-accent-green/10 px-2 py-0.5 rounded-md">
                  VERIFIED RIDER
                </div>
              </div>
            </div>
            
            {order.rider_phone && (
              <div className="flex gap-3">
                <a href={`tel:${order.rider_phone}`} className="p-4 bg-accent-brown-muted rounded-2xl text-accent-brown press-effect shadow-sm">
                  <Phone size={20} />
                </a>
                <a href={`https://wa.me/91${order.rider_phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-4 bg-accent-brown-muted rounded-2xl text-accent-brown press-effect shadow-sm">
                  <MessageSquare size={20} />
                </a>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tracking Timeline */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 space-y-4">
        <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest px-1">Order Status</h3>
        <Card glass className="p-8">
          <div className="space-y-10 relative">
            <div className="absolute left-[13px] top-4 bottom-4 w-[2px] bg-black/5">
              <div 
                className="absolute top-0 left-0 w-full bg-accent-brown transition-all duration-1000 ease-out" 
                style={{ height: `${Math.max(0, (currentStatusIndex / (STATUS_STEPS.length - 1)) * 100)}%` }}
              />
            </div>
            
            {STATUS_STEPS.map((step, i) => {
              const StepIcon = step.icon;
              const isCompleted = i <= currentStatusIndex;
              const isCurrent = i === currentStatusIndex;
              
              return (
                <div key={step.id} className="flex gap-6 relative z-10">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-sm ${
                    isCompleted ? 'bg-accent-brown border-accent-brown/20 text-white' : 
                    isCurrent ? 'bg-white border-accent-brown text-accent-brown scale-125' : 
                    'bg-white border-black/5 text-black/10'
                  }`}>
                    {isCompleted && i < STATUS_STEPS.length - 1 ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <StepIcon size={14} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-lg font-heading leading-none ${
                        isCurrent ? 'text-accent-brown' : isCompleted ? '' : 'opacity-20'
                      }`}>
                        {step.label}
                      </h4>
                      {i <= currentStatusIndex && (
                        <span className="text-xs text-number opacity-40">
                          {i === 0 ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${
                      isCurrent ? 'text-accent-brown/60' : 'opacity-40'
                    }`}>
                      {step.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 space-y-4">
        <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest px-1">Order Summary</h3>
        <Card glass className="p-6 space-y-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-sm font-medium">{item.name} × {item.quantity}</span>
              <span className="text-number">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="pt-4 border-t border-black/5 flex justify-between items-center">
            <span className="font-bold">Total Paid</span>
            <span className="text-2xl text-number">₹{order.total_amount}</span>
          </div>
        </Card>
      </div>

      {/* Outlet Details */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 px-1 flex items-center justify-between group">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black/5 rounded-xl group-hover:bg-accent-brown/10 transition-colors">
            <MapPin size={16} className="text-accent-brown/40" />
          </div>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Picked from {order.outlet_name}</p>
        </div>
        <ChevronRight size={16} className="opacity-20" />
      </div>
    </div>
  );
}
