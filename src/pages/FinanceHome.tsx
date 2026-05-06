import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useCountUp } from '../hooks/useCountUp';
import { TrendingUp, TrendingDown, Plus, Package, Eye, ArrowUpRight } from 'lucide-react';

export const FinanceHome = () => {
  const navigate = useNavigate();

  // Live data — in production, fetched from Supabase
  const snapshot = {
    totalSales: 12540,
    totalExpenses: 2850,
    netProfit: 9690,
    salesChange: 14,
    expenseChange: -5,
  };

  const animatedSales = useCountUp(snapshot.totalSales);
  const animatedExpenses = useCountUp(snapshot.totalExpenses);
  const animatedProfit = useCountUp(snapshot.netProfit);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-end px-1">
        <div>
          <h2 className="text-3xl font-heading mb-1">Finance</h2>
          <p className="text-sm opacity-60">Aaj ka performance check karlo</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Outlet status</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-xs font-bold text-accent-green">LIVE</span>
          </div>
        </div>
      </div>

      {/* Daily Snapshot — Cinematic horizontal scroll or grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Main Profit Card */}
        <Card className="stat-card-brown shadow-2xl p-6 overflow-hidden min-h-[160px] flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold opacity-60 uppercase tracking-widest mb-1">Net Profit (Today)</p>
                <h2 className="text-4xl text-number text-white">₹{animatedProfit.toLocaleString()}</h2>
              </div>
              <div className="bg-white/20 p-2 rounded-full">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight size={12} /> Aaj ka sale strong hai
              </span>
            </div>
          </div>
          {/* Subtle background texture */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        </Card>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card glass pressEffect className="p-4 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Sales</p>
              <h3 className="text-xl text-number">₹{animatedSales.toLocaleString()}</h3>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-accent-green mt-2">
              <TrendingUp size={10} /> +{snapshot.salesChange}%
            </div>
          </Card>
          <Card glass pressEffect className="p-4 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Expenses</p>
              <h3 className="text-xl text-number">₹{animatedExpenses.toLocaleString()}</h3>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-accent-red mt-2">
              <TrendingDown size={10} /> {snapshot.expenseChange}%
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions — Native button feel */}
      <div className="grid grid-cols-3 gap-3">
        <button
          className="btn glass p-6 flex flex-col items-center gap-2 press-effect hover-lift shadow-sm"
          onClick={() => navigate('/app/add-expense')}
        >
          <div className="p-3 bg-accent-brown-muted rounded-2xl text-accent-brown">
            <Plus size={20} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Expense</span>
        </button>

        <button
          className="btn glass p-6 flex flex-col items-center gap-2 press-effect hover-lift shadow-sm"
          onClick={() => navigate('/app/inventory')}
        >
          <div className="p-3 bg-accent-green/10 rounded-2xl text-accent-green">
            <Package size={20} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Inventory</span>
        </button>

        <button
          className="btn glass p-6 flex flex-col items-center gap-2 press-effect hover-lift shadow-sm"
          onClick={() => navigate('/app/profit')}
        >
          <div className="p-3 bg-accent-red-muted rounded-2xl text-accent-red">
            <Eye size={20} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Details</span>
        </button>
      </div>

      {/* Inventory Warnings — Street style alerts */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest px-1">Inventory Health</h3>
        <Card glass className="p-4 border-l-4 border-l-accent-red bg-accent-red-muted/20">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-accent-red/10 rounded-xl text-accent-red">
              <Package size={18} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold">Stock low hai, check karlo</h4>
              <p className="text-xs opacity-60 mt-0.5">Coffee beans (500g left) will finish by evening.</p>
            </div>
            <button 
              className="text-[10px] font-bold text-accent-red uppercase tracking-wider py-2 px-3 bg-accent-red/10 rounded-lg"
              onClick={() => navigate('/app/inventory')}
            >
              Update
            </button>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest">Recent Cash Flow</h3>
          <button 
            className="text-[10px] font-bold text-accent-brown underline"
            onClick={() => navigate('/app/expenses')}
          >
            HISTORY
          </button>
        </div>
        <Card glass className="p-0 overflow-hidden divide-y divide-black/5">
          {[
            { icon: '📦', label: 'Raw Material', amount: 1200, time: '2 hrs ago', type: 'expense' },
            { icon: '⚡', label: 'Electricity Bill', amount: 850, time: '5 hrs ago', type: 'expense' },
            { icon: '☕', label: 'Cash Sale', amount: 450, time: '6 hrs ago', type: 'sale' },
          ].map((e, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4 hover:bg-black/5 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent-brown-muted flex items-center justify-center text-lg">
                {e.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold truncate block">{e.label}</span>
                <span className="text-[10px] opacity-40 uppercase tracking-wider">{e.time}</span>
              </div>
              <div className="text-right">
                <span className={`text-sm font-bold ${e.type === 'expense' ? 'text-accent-red' : 'text-accent-green'}`}>
                  {e.type === 'expense' ? '-' : '+'}₹{e.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};
