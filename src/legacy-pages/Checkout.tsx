import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useCart } from '../context/CartContext';
import { useCountUp } from '../hooks/useCountUp';
import { ArrowLeft, MapPin, Truck, ShoppingBag, Minus, Plus, Trash2, Ticket, Coffee, Zap, ChevronRight, CheckCircle } from 'lucide-react';

export const Checkout = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, totalPrice, clearCart } = useCart();
  const { profile } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('pickup');
  const [discountApplied, setDiscountApplied] = useState(false);

  const finalTotal = discountApplied ? totalPrice - 50 : totalPrice;
  const animatedTotal = useCountUp(finalTotal + (orderType === 'delivery' ? 40 : 0));

  const handlePlaceOrder = async () => {
    if (!profile) {
      navigate('/');
      return;
    }

    setProcessing(true);
    
    try {
      // Calculate final amount with delivery fee
      const deliveryFee = orderType === 'delivery' ? 40 : 0;
      const discount = discountApplied ? 50 : 0;
      const amountToPay = totalPrice + deliveryFee - discount;

      // Create order in Supabase
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: profile.id,
          outlet_id: profile.outlet_id || 'default-outlet-id',
          total_amount: amountToPay,
          payment_method: 'online',
          status: 'pending',
          delivery_address: orderType === 'delivery' ? 'Sector 4, Rohini, New Delhi' : null,
          order_type: orderType,
          discount_applied: discount,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart and redirect to tracking
      clearCart();
      navigate(`/app/track/${orderData.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4 p-6 text-center animate-fade-in">
        <div className="w-24 h-24 bg-accent-brown-muted rounded-full flex items-center justify-center text-accent-brown mb-4 animate-bounce-subtle">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-heading tracking-tighter">Cart khali hai!</h2>
        <p className="opacity-60 text-sm max-w-[200px]">Add some delicious Janu Bhai coffee to get started.</p>
        <button onClick={() => navigate(-1)} className="btn btn-primary mt-6 px-10 py-4 shadow-xl press-effect rounded-2xl">
          Order Now
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 pb-32">
      <div className="flex items-center gap-4 px-1">
        <button onClick={() => navigate(-1)} className="p-3 bg-accent-brown-muted rounded-2xl text-accent-brown press-effect">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-heading tracking-tighter">My Cart</h2>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{items.length} items ready</p>
        </div>
      </div>

      {/* Order Type Toggle - Cinematic feel */}
      <div className="flex bg-accent-brown-muted p-1.5 rounded-3xl animate-fade-in-up stagger-1">
        <button 
          onClick={() => setOrderType('pickup')}
          className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all press-effect ${
            orderType === 'pickup' ? 'bg-accent-brown text-white shadow-lg scale-100' : 'text-accent-brown/40'
          }`}
        >
          <ShoppingBag size={18} />
          <span>Self Pickup</span>
        </button>
        <button 
          onClick={() => setOrderType('delivery')}
          className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all press-effect ${
            orderType === 'delivery' ? 'bg-accent-brown text-white shadow-lg scale-100' : 'text-accent-brown/40'
          }`}
        >
          <Truck size={18} />
          <span>Home Delivery</span>
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-4 animate-fade-in-up stagger-2">
        <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest px-1">Selected Items</h3>
        <Card glass className="p-0 overflow-hidden divide-y divide-black/5">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 items-center px-4 py-5 group">
              <div className="w-16 h-16 bg-accent-brown-muted rounded-2xl flex items-center justify-center text-accent-brown/20 group-hover:scale-105 transition-transform">
                {item.category === 'Hot' || item.category === 'coffee' ? <Coffee size={24} /> : <Zap size={24} />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm leading-tight truncate">{item.name}</h4>
                <p className="text-lg text-number mt-1">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-3 bg-black/5 p-2 rounded-2xl">
                <button 
                  onClick={() => updateQuantity(item.id, -1)} 
                  className="p-1.5 text-accent-brown hover:bg-white rounded-xl transition-colors press-effect"
                >
                  {item.quantity === 1 ? <Trash2 size={14} className="text-accent-red" /> : <Minus size={14} />}
                </button>
                <span className="text-sm font-bold text-number min-w-[20px] text-center">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, 1)} 
                  className="p-1.5 text-accent-brown hover:bg-white rounded-xl transition-colors press-effect"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Address (conditional) */}
      {orderType === 'delivery' && (
        <div className="animate-fade-in space-y-4">
          <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest px-1">Drop Location</h3>
          <Card glass hoverLift pressEffect className="p-5 flex gap-4 items-center">
            <div className="p-3 bg-accent-brown-muted rounded-2xl text-accent-brown">
              <MapPin size={24} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">Sector 4, Rohini</p>
              <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Home • New Delhi</p>
            </div>
            <ChevronRight size={18} className="opacity-20" />
          </Card>
        </div>
      )}

      {/* Rewards - Street style interaction */}
      <div className="animate-fade-in-up stagger-3 space-y-4">
        <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest px-1">Loyalty Perk</h3>
        <Card glass className={`p-5 flex gap-4 items-center border-dashed border-accent-brown/30 transition-colors ${discountApplied ? 'bg-accent-green/5 border-accent-green/30' : ''}`}>
          <div className={`p-3 rounded-2xl transition-colors ${discountApplied ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-brown-muted text-accent-brown'}`}>
            <Ticket size={24} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">Redeem Points</p>
            <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">140 available</p>
          </div>
          <button 
            onClick={() => setDiscountApplied(!discountApplied)}
            className={`text-[10px] font-bold py-2 px-5 rounded-full transition-all press-effect ${
              discountApplied 
                ? 'bg-accent-green text-white shadow-md' 
                : 'bg-accent-brown text-white shadow-md'
            }`}
          >
            {discountApplied ? 'APPLIED ✓' : 'USE 100'}
          </button>
        </Card>
      </div>

      {/* Summary - High contrast */}
      <Card glass className="p-6 space-y-4 animate-fade-in-up stagger-4">
        <div className="flex justify-between items-center text-xs font-bold opacity-40 uppercase tracking-widest">
          <span>Subtotal</span>
          <span className="text-number text-sm">₹{totalPrice}</span>
        </div>
        {discountApplied && (
          <div className="flex justify-between items-center text-xs font-bold text-accent-green uppercase tracking-widest">
            <span>Points Reward</span>
            <span className="text-number text-sm">-₹50</span>
          </div>
        )}
        {orderType === 'delivery' && (
          <div className="flex justify-between items-center text-xs font-bold opacity-40 uppercase tracking-widest">
            <span>Delivery Fee</span>
            <span className="text-number text-sm">₹40</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-4 border-t border-black/5">
          <h3 className="text-lg font-heading tracking-tight">To Pay</h3>
          <span className="text-3xl text-number">₹{animatedTotal}</span>
        </div>
      </Card>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-bg-cream via-bg-cream to-transparent pb-nav">
        <button
          onClick={handlePlaceOrder}
          disabled={processing}
          className="w-full bg-accent-brown text-white p-5 rounded-3xl shadow-2xl flex justify-center items-center gap-3 press-effect border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-bold uppercase tracking-[0.2em]">Processing...</span>
            </>
          ) : (
            <>
              <span className="text-sm font-bold uppercase tracking-[0.2em]">Confirm & Place Order</span>
              <ArrowLeft size={20} className="rotate-180" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
