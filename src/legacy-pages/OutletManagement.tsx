import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Plus, MapPin, Phone, Clock, MoreVertical, ToggleLeft as Toggle } from 'lucide-react';
import type { Outlet } from '../lib/types';
import { STATUS_COLORS } from '../lib/types';

const DEMO_OUTLETS: Outlet[] = [
  { id: '1', name: 'Connaught Place', location: 'Block B, Inner Circle', phone: '9876543210', hours: '8am - 11pm', status: 'active', createdAt: '2024-01-01' },
  { id: '2', name: 'Hauz Khas Village', location: 'Lake View Road', phone: '9876543211', hours: '10am - 1am', status: 'active', createdAt: '2024-02-15' },
  { id: '3', name: 'Koramangala', location: '80 Feet Road, 4th Block', phone: '9876543212', hours: '7am - 12am', status: 'suspended', createdAt: '2024-03-10' },
  { id: '4', name: 'Indiranagar', location: '100 Feet Road', phone: '9876543213', hours: '9am - 11pm', status: 'inactive', createdAt: '2024-04-05' },
];

export const OutletManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl mb-1">Outlet Network</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage all coffee chain nodes</p>
        </div>
        <button 
          className="btn btn-primary rounded-full p-3"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="grid gap-4">
        {DEMO_OUTLETS.map((outlet, i) => (
          <Card key={outlet.id} glass className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="outlet-status-card">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="status-pill" style={{ background: STATUS_COLORS[outlet.status] }} />
                  <h3 className="text-lg font-bold">{outlet.name}</h3>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <MapPin size={14} />
                  <span>{outlet.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <Phone size={14} />
                  <span>{outlet.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <Clock size={14} />
                  <span>{outlet.hours}</span>
                </div>
              </div>

              <div className="status-toggle-row">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase opacity-50">Status</span>
                  <span className="text-sm font-semibold capitalize" style={{ color: STATUS_COLORS[outlet.status] }}>
                    {outlet.status}
                  </span>
                </div>
                <button className={`p-1 rounded-full transition-all ${outlet.status === 'active' ? 'text-green-600' : 'text-gray-300'}`}>
                  <Toggle size={32} fill={outlet.status === 'active' ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Outlet Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl z-[201] overflow-hidden animate-slide-up">
            <div className="management-form">
              <h3 className="text-xl font-bold mb-2">Create New Outlet</h3>
              
              <div className="form-group">
                <label className="form-label">Outlet Name</label>
                <input type="text" className="input" placeholder="e.g. Cyber Hub" />
              </div>

              <div className="form-group">
                <label className="form-label">Location Address</label>
                <input type="text" className="input" placeholder="Full street address..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="tel" className="input" placeholder="+91..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Opening Hours</label>
                  <input type="text" className="input" placeholder="e.g. 8am - 10pm" />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button className="btn btn-secondary flex-1" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-primary flex-1" onClick={() => setShowAddModal(false)}>Create Node</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
