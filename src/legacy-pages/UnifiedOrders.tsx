import { useState } from 'react';
import { SourceBadge } from '../components/ui/SourceBadge';
import type { UnifiedOrder } from '../lib/types';
import { Truck } from 'lucide-react';

type FilterType = 'all' | 'online' | 'offline';

const DEMO_ORDERS: UnifiedOrder[] = [
  {
    id: 'ORD-1048',
    source: 'zomato',
    outletId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    items: [
      { name: 'Strong Filter Kaapi', qty: 2, price: 45 },
      { name: 'Bun Maska', qty: 1, price: 40 },
    ],
    totalAmount: 130,
    status: 'new',
    paymentMethod: 'online',
    customerName: 'Rahul S.',
    createdAt: '2 min ago',
  },
  {
    id: 'ORD-1047',
    source: 'swiggy',
    outletId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    items: [
      { name: 'Cold Coffee (Thick)', qty: 3, price: 80 },
    ],
    totalAmount: 240,
    status: 'accepted',
    paymentMethod: 'online',
    customerName: 'Priya K.',
    createdAt: '8 min ago',
  },
  {
    id: 'ORD-1046',
    source: 'uengage',
    outletId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    items: [
      { name: 'Classic Adrak Chai', qty: 4, price: 30 },
      { name: 'Vada Pav', qty: 4, price: 35 },
    ],
    totalAmount: 260,
    status: 'preparing',
    paymentMethod: 'online',
    customerName: 'Amit B.',
    createdAt: '15 min ago',
    delivery: {
      status: 'pending',
    },
  },
  {
    id: 'ORD-1045',
    source: 'pos',
    outletId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    items: [
      { name: 'Strong Filter Kaapi', qty: 1, price: 45 },
    ],
    totalAmount: 45,
    status: 'completed',
    paymentMethod: 'cash',
    createdAt: '22 min ago',
  },
  {
    id: 'ORD-1044',
    source: 'zomato',
    outletId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    items: [
      { name: 'Bun Maska', qty: 2, price: 40 },
      { name: 'Classic Adrak Chai', qty: 2, price: 30 },
    ],
    totalAmount: 140,
    status: 'ready',
    paymentMethod: 'online',
    customerName: 'Neha P.',
    createdAt: '30 min ago',
    delivery: {
      status: 'assigned',
      riderName: 'Vijay',
    },
  },
  {
    id: 'ORD-1043',
    source: 'pos',
    outletId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    items: [
      { name: 'Cold Coffee (Thick)', qty: 2, price: 80 },
      { name: 'Vada Pav', qty: 1, price: 35 },
    ],
    totalAmount: 195,
    status: 'completed',
    paymentMethod: 'cash',
    createdAt: '45 min ago',
  },
];

const DELIVERY_STEPS = ['pending', 'assigned', 'picked_up', 'delivered'];

export const UnifiedOrders = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [orders, setOrders] = useState(DEMO_ORDERS);

  const filtered = orders.filter(order => {
    if (filter === 'online') return order.source !== 'pos';
    if (filter === 'offline') return order.source === 'pos';
    return true;
  });

  const handleAccept = (id: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status: 'accepted' as const } : o))
    );
  };

  const handleAssignDelivery = (id: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === id
          ? {
              ...o,
              delivery: { status: 'assigned' as const, riderName: 'Auto-assigned' },
            }
          : o
      )
    );
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl mb-1">Orders</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        All sources • {orders.length} today
      </p>

      {/* Filter Tabs */}
      <div className="filter-tabs mb-6">
        {(['all', 'online', 'offline'] as FilterType[]).map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? `All (${orders.length})` : f === 'online' ? 'Online' : 'Counter (POS)'}
          </button>
        ))}
      </div>

      {/* Order List */}
      <div>
        {filtered.map(order => (
          <div key={order.id} className="order-card">
            {/* Header: Source + ID */}
            <div className="order-card-header">
              <div className="flex items-center gap-2">
                <SourceBadge source={order.source} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  #{order.id.split('-')[1]}
                </span>
              </div>
              <span className={`order-status ${order.status}`}>{order.status}</span>
            </div>

            {/* Customer */}
            {order.customerName && (
              <p className="text-xs font-medium mb-1">{order.customerName}</p>
            )}

            {/* Items */}
            <div className="order-items-list">
              {order.items.map((item, i) => (
                <div key={i}>
                  {item.qty}× {item.name}
                </div>
              ))}
            </div>

            {/* Delivery Status (if applicable) */}
            {order.delivery && (
              <div style={{ marginBottom: 12 }}>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>
                  <Truck size={14} />
                  <span>
                    {order.delivery.riderName
                      ? `Rider: ${order.delivery.riderName}`
                      : 'No rider assigned'}
                  </span>
                </div>
                <div className="delivery-tracker">
                  {DELIVERY_STEPS.map((step, idx) => {
                    const currentIdx = DELIVERY_STEPS.indexOf(order.delivery!.status);
                    return (
                      <div
                        key={step}
                        className={`delivery-step ${
                          idx < currentIdx ? 'active' : idx === currentIdx ? 'current' : ''
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer: Amount + Actions */}
            <div className="order-card-footer">
              <span className="font-bold">₹{order.totalAmount}</span>
              <div className="flex gap-2">
                {order.status === 'new' && (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleAccept(order.id)}
                  >
                    Accept
                  </button>
                )}
                {order.source !== 'pos' && order.delivery?.status === 'pending' && (
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleAssignDelivery(order.id)}
                  >
                    Assign Delivery
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs" style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
              {order.createdAt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
