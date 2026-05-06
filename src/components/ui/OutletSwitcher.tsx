import { useState } from 'react';
import { ChevronDown, Store, Check } from 'lucide-react';
import { Card } from './Card';
import type { Outlet } from '../../lib/types';

const DEMO_OUTLETS: Outlet[] = [
  { id: 'all', name: 'All Outlets', location: 'Network-wide', phone: '', hours: '', status: 'active', createdAt: '' },
  { id: 'cp', name: 'Connaught Place', location: 'New Delhi', phone: '9876543210', hours: '8am - 11pm', status: 'active', createdAt: '' },
  { id: 'hkv', name: 'Hauz Khas Village', location: 'New Delhi', phone: '9876543211', hours: '10am - 1am', status: 'active', createdAt: '' },
  { id: 'kor', name: 'Koramangala', location: 'Bengaluru', phone: '9876543212', hours: '7am - 12am', status: 'suspended', createdAt: '' },
];

export const OutletSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(DEMO_OUTLETS[0]);

  return (
    <div className="relative">
      <button 
        className="switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Store size={18} />
        <span>{selected.name}</span>
        <ChevronDown size={16} className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[101]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[calc(100%+8px)] left-0 w-[240px] z-[102] animate-fade-in-up">
            <Card glass className="overflow-hidden">
              <div className="p-2 flex flex-col gap-1">
                {DEMO_OUTLETS.map((outlet) => (
                  <button
                    key={outlet.id}
                    className={`flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                      selected.id === outlet.id 
                      ? 'bg-cream text-coffee-dark' 
                      : 'hover:bg-gray-50 text-secondary'
                    }`}
                    onClick={() => {
                      setSelected(outlet);
                      setIsOpen(false);
                    }}
                  >
                    <div>
                      <p className="text-sm font-bold">{outlet.name}</p>
                      <p className="text-xs opacity-60">{outlet.location}</p>
                    </div>
                    {selected.id === outlet.id && <Check size={16} className="text-coffee-brown" />}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
