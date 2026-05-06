import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Plus, Search, Mail, Phone, MoreHorizontal } from 'lucide-react';
import type { UserProfile, UserRole } from '../lib/types';
import { ROLE_LABELS, STATUS_COLORS } from '../lib/types';

const DEMO_USERS: UserProfile[] = [
  { id: '1', name: 'Aravind Swamy', email: 'aravind@janubhai.com', role: 'manager', status: 'active', outletId: 'cp', createdAt: '2024-01-01' },
  { id: '2', name: 'Priya Sharma', email: 'priya@janubhai.com', role: 'employee', status: 'active', outletId: 'cp', createdAt: '2024-01-15' },
  { id: '3', name: 'Rahul Verma', phone: '9812345678', role: 'employee', status: 'disabled', outletId: 'cp', createdAt: '2024-02-01' },
  { id: '4', name: 'Sanjay Dutt', email: 'sanjay@janubhai.com', role: 'manager', status: 'active', outletId: 'hkv', createdAt: '2024-02-10' },
];

export const UserManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl mb-1">User Controls</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Assign and manage staff access</p>
        </div>
        <button 
          className="btn btn-primary rounded-full p-3"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={24} />
        </button>
      </div>

      <Card glass className="p-0 overflow-hidden">
        <div className="p-4 border-bottom flex items-center gap-3">
          <Search size={18} className="text-secondary" />
          <input type="text" placeholder="Search staff by name or email..." className="bg-transparent border-none outline-none text-sm w-full" />
        </div>

        <div className="flex flex-col">
          {DEMO_USERS.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-avatar">
                {user.name.charAt(0)}
              </div>
              <div className="user-info">
                <div className="flex items-center gap-2">
                  <span className="user-name">{user.name}</span>
                  <span className={`role-badge ${user.role}`}>
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
                <div className="user-meta flex items-center gap-2">
                  {user.email ? <><Mail size={12} /> {user.email}</> : <><Phone size={12} /> {user.phone}</>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className={`status-pill`} style={{ background: STATUS_COLORS[user.status], width: 6, height: 6 }} />
                <button className="p-2 text-secondary hover:bg-gray-100 rounded-lg">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl z-[201] overflow-hidden animate-slide-up">
            <div className="management-form">
              <h3 className="text-xl font-bold mb-2">Add Staff Member</h3>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="input" placeholder="Staff name" />
              </div>

              <div className="form-group">
                <label className="form-label">Phone or Email</label>
                <input type="text" className="input" placeholder="Credential for login" />
              </div>

              <div className="form-group">
                <label className="form-label">Select Role</label>
                <div className="role-selector">
                  {(['employee', 'manager'] as UserRole[]).map((role) => (
                    <div 
                      key={role}
                      className={`role-option ${selectedRole === role ? 'active' : ''}`}
                      onClick={() => setSelectedRole(role)}
                    >
                      <span className="role-option-title capitalize">{role}</span>
                      <span className="role-option-desc">
                        {role === 'employee' ? 'Orders & POS only' : 'Finance & Inventory'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assign Outlet</label>
                <select className="input">
                  <option>Connaught Place</option>
                  <option>Hauz Khas Village</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button className="btn btn-secondary flex-1" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-primary flex-1" onClick={() => setShowAddModal(false)}>Save User</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
