'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  DollarSign,
  Plus,
  Filter,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Repeat,
  UploadCloud,
  FileImage,
  Zap
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ReTooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = [
  '#e53e3e',
  '#dd6b20',
  '#d69e2e',
  '#38a169',
  '#3182ce',
  '#805ad5',
  '#319795',
  '#b83280',
];
const EXPENSE_CATEGORIES = [
  'Rent',
  'Electricity',
  'Salaries',
  'Raw Materials',
  'Packaging',
  'Marketing',
  'Maintenance',
  'Other',
];

export default function ExpensesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [outletId, setOutletId] = useState(null);
  
  // Smart Upload state
  const [showSmartUpload, setShowSmartUpload] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const defaultFormState = {
    category: '',
    amount: '',
    description: '',
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    recurring: false,
  };
  const [form, setForm] = useState(defaultFormState);
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      let oid = sessionStorage.getItem('selected_outlet_id');
      if (!oid) {
        const { data: staff } = await supabase
          .from('outlet_staff')
          .select('outlet_id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        oid = staff?.outlet_id;
        if (oid) sessionStorage.setItem('selected_outlet_id', oid);
      }
      setOutletId(oid);

      const params = new URLSearchParams();
      if (oid) params.set('outletId', oid);
      if (categoryFilter) params.set('category', categoryFilter);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/outlet/expenses?${params}`);
      if (res.ok) {
        const { data } = await res.json();
        setExpenses(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchExpenses();
  }, [fetchExpenses]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/outlet/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outlet_id: outletId,
          category: form.category,
          amount: parseFloat(form.amount),
          description: form.description,
          vendor: form.vendor,
          date: form.date,
          payment_method: form.payment_method,
          recurring: form.recurring,
        }),
      });
      if (!res.ok) {
        const b = await res.json();
        throw new Error(b.error);
      }
      setSuccess('Expense added successfully');
      setForm(defaultFormState);
      setShowForm(false);
      setShowSmartUpload(false);
      fetchExpenses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      const res = await fetch('/api/outlet/expenses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'paid' }),
      });
      if (res.ok) {
        fetchExpenses();
        setSuccess('Marked as paid');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {}
  };

  // Smart Upload logic
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImage(e.dataTransfer.files[0]);
    }
  };

  const handleChangeFile = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  };

  const processImage = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setUploadingImage(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Image = event.target.result;
      
      try {
        const res = await fetch('/api/outlet/expenses/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image }),
        });
        
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to extract data');
        
        const extracted = result.data;
        
        // Ensure category matches one of the allowed categories, otherwise empty string for manual linking
        const matchedCategory = EXPENSE_CATEGORIES.find(
          c => c.toLowerCase() === (extracted.category || '').toLowerCase()
        ) || '';

        setForm(prev => ({
          ...prev,
          amount: extracted.amount || '',
          category: matchedCategory,
          description: extracted.description || '',
          vendor: extracted.vendor || '',
          date: extracted.date || prev.date,
          payment_method: extracted.payment_method || prev.payment_method,
        }));
        
        setSuccess('Data extracted! Please review and save.');
        setShowSmartUpload(false);
        setShowForm(true);
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(null), 4000);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const totalExpenses = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const paidExpenses = expenses
    .filter((e) => e.status === 'paid')
    .reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const pendingExpenses = expenses
    .filter((e) => e.status === 'pending')
    .reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  const byCategory = {};
  expenses.forEach((e) => {
    const cat = e.category || 'Other';
    if (!byCategory[cat]) byCategory[cat] = 0;
    byCategory[cat] += parseFloat(e.amount || 0);
  });
  const pieData = Object.entries(byCategory).map(([name, value], i) => ({
    name,
    value,
    color: COLORS[i % COLORS.length],
  }));

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
        <p className="mt-4 text-gray-400 font-medium tracking-wide">Loading expenses...</p>
      </div>
    );

  return (
    <div className="p-2 sm:p-6 pb-20 space-y-6 max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Expenses Intelligence
          </h1>
          <p className="text-gray-400 mt-1">Smart tracking & real-time analytics for your outlet</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowSmartUpload(true);
              setShowForm(false);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/30 border border-indigo-400/20"
          >
            <Zap size={18} className="text-yellow-300 fill-yellow-300" /> 
            Smart Upload
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowForm(!showForm);
              setShowSmartUpload(false);
              if(!showForm) setForm(defaultFormState);
            }}
            className="flex items-center gap-2 bg-zinc-800 text-zinc-100 px-5 py-2.5 rounded-xl font-medium border border-zinc-700 hover:bg-zinc-700 transition-colors"
          >
            {showForm ? <XCircle size={18} /> : <Plus size={18} />}
            {showForm ? 'Cancel' : 'Manual Entry'}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3 backdrop-blur-md"
          >
            <CheckCircle size={20} />
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl flex items-center gap-3 backdrop-blur-md"
          >
            <XCircle size={20} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<DollarSign size={24} />} title="Total Expenses" value={formatCurrency(totalExpenses)} color="from-rose-500 to-pink-500" />
        <StatCard icon={<CheckCircle size={24} />} title="Paid" value={formatCurrency(paidExpenses)} color="from-emerald-500 to-teal-500" />
        <StatCard icon={<Clock size={24} />} title="Pending" value={formatCurrency(pendingExpenses)} color="from-orange-500 to-amber-500" />
        <StatCard icon={<Filter size={24} />} title="Total Entries" value={expenses.length} color="from-blue-500 to-indigo-500" />
      </div>

      {/* Smart Upload Zone */}
      <AnimatePresence>
        {showSmartUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="text-yellow-400" /> Smart Receipt Scanner
              </h3>
              
              <div 
                className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300 ${dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-700 hover:border-indigo-400 hover:bg-zinc-800/50'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleChangeFile}
                  className="hidden"
                />
                
                {uploadingImage ? (
                  <div className="flex flex-col items-center gap-4">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    >
                      <RefreshCw size={40} className="text-indigo-400" />
                    </motion.div>
                    <p className="text-lg text-indigo-300 font-medium">Extracting AI Insights...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-indigo-400">
                      <UploadCloud size={32} />
                    </div>
                    <h4 className="text-lg font-medium text-zinc-200 mb-2">Drag & Drop your bill or screenshot</h4>
                    <p className="text-zinc-500 mb-6 max-w-sm text-sm">
                      We&apos;ll auto-detect the category, amount, vendor, and payment method instantly.
                    </p>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-black px-6 py-2.5 rounded-xl font-medium hover:bg-zinc-200 transition-colors"
                    >
                      Browse Files
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <form onSubmit={handleAddExpense} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Expense Details</h3>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
                  Realtime Sync
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-400">Category <span className="text-rose-500">*</span></label>
                  <select
                    className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    required
                  >
                    <option value="">Select or link category</option>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-400">Amount <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl pl-8 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      value={form.amount}
                      onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-400">Vendor / Business Name</label>
                  <input
                    className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    value={form.vendor}
                    onChange={(e) => setForm((p) => ({ ...p, vendor: e.target.value }))}
                    placeholder="e.g. Ramesh Hardware"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-400">Item Description</label>
                  <input
                    className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="e.g. 5x Light bulbs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-400">Bill Date</label>
                  <input
                    type="date"
                    className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none [color-scheme:dark]"
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-400">Payment Method</label>
                  <select
                    className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    value={form.payment_method}
                    onChange={(e) => setForm((p) => ({ ...p, payment_method: e.target.value }))}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI / Scanner</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      type="checkbox"
                      className="peer appearance-none w-5 h-5 border border-zinc-600 rounded bg-zinc-900 checked:bg-indigo-500 checked:border-indigo-500 transition-all"
                      checked={form.recurring}
                      onChange={(e) => setForm((p) => ({ ...p, recurring: e.target.checked }))}
                    />
                    <CheckCircle className="absolute text-white opacity-0 peer-checked:opacity-100 w-3.5 h-3.5 pointer-events-none" />
                  </div>
                  <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Mark as recurring monthly expense</span>
                </label>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                >
                  {submitting ? (
                    <><RefreshCw size={18} className="animate-spin" /> Saving...</>
                  ) : (
                    <><CheckCircle size={18} /> Save Expense</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Card */}
        <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white mb-6">Expense Distribution</h2>
          <div className="space-y-3">
            {pieData.map(({ name, value, color }) => (
              <div
                key={name}
                className="flex justify-between items-center p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <span className="text-sm text-zinc-300">{name}</span>
                </div>
                <span className="font-semibold text-sm text-white">{formatCurrency(value)}</span>
              </div>
            ))}
            {pieData.length === 0 && (
              <div className="text-center py-8 text-zinc-500">
                <PieChart className="mx-auto mb-2 opacity-20" size={40} />
                <p>No expense data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recurring Card */}
        <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Repeat size={18} className="text-indigo-400" /> Recurring Expenses
          </h2>
          
          <div className="flex-1 space-y-3">
            {['Rent', 'Electricity'].map((cat) => {
              const catExpenses = expenses.filter((e) => e.category === cat && e.recurring);
              const total = catExpenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
              const nextDue = catExpenses.length > 0 ? new Date(catExpenses[0].date) : new Date();
              
              // Add a month to the next due date for presentation purposes
              nextDue.setMonth(nextDue.getMonth() + 1);

              return (
                <div key={cat} className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-zinc-950 to-zinc-900 border border-zinc-800">
                  <div>
                    <h4 className="font-medium text-zinc-200">{cat}</h4>
                    <p className="text-xs text-zinc-500 mt-1">
                      Next due: {nextDue.toLocaleDateString()} &middot; {catExpenses.length} entries
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white block">{formatCurrency(total)}</span>
                    <span className="text-xs text-indigo-400">Monthly</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              className="bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-lg px-3 py-1.5 focus:border-indigo-500 outline-none flex-1"
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select 
              className="bg-zinc-950 border border-zinc-800 text-sm text-zinc-300 rounded-lg px-3 py-1.5 focus:border-indigo-500 outline-none flex-1"
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-950/50 text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Vendor</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-zinc-500">
                      <FileImage size={32} className="mb-2 opacity-50" />
                      <p>No expenses found</p>
                      <button 
                        onClick={() => setShowSmartUpload(true)}
                        className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm"
                      >
                        Upload your first bill &rarr;
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="px-6 py-4 text-zinc-300">
                      {new Date(exp.date || exp.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-200 font-medium">{exp.vendor || '-'}</td>
                    <td className="px-6 py-4 text-zinc-400 truncate max-w-[200px]">{exp.description || '-'}</td>
                    <td className="px-6 py-4 text-zinc-100 font-bold">{formatCurrency(exp.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                        exp.status === 'paid' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${exp.status === 'paid' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {exp.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {exp.status !== 'paid' ? (
                        <button
                          onClick={() => handleMarkPaid(exp.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-500/20"
                        >
                          <CheckCircle size={14} /> Mark Paid
                        </button>
                      ) : (
                        <span className="text-zinc-600 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  function formatCurrency(n) {
    return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  }
}

function StatCard({ icon, title, value, color }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 flex items-center gap-4 backdrop-blur-xl transition-all hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-900/50"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} text-white shadow-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-zinc-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
    </motion.div>
  );
}
