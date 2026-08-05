import { useState, useMemo } from 'react';
import { Search, UserPlus, Mail, MoreHorizontal, TrendingUp, Users } from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { formatCurrency } from '../../utils';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { orders } = useOrderStore();

  // Derive customers from orders
  const derivedCustomers = useMemo(() => {
    const map = new Map<string, { name: string; email: string; orders: number; spent: number; lastOrder: string }>();
    orders.forEach((o) => {
      const key = o.email.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.orders += 1;
        existing.spent += o.total;
        if (new Date(o.createdAt) > new Date(existing.lastOrder)) {
          existing.lastOrder = o.createdAt;
        }
      } else {
        map.set(key, {
          name: o.customerName,
          email: o.email,
          orders: 1,
          spent: o.total,
          lastOrder: o.createdAt,
        });
      }
    });

    // Add mock extras
    const mock = [
      { name: 'Alice Johnson', email: 'alice@example.com', orders: 12, spent: 1450, lastOrder: new Date().toISOString() },
      { name: 'Bob Smith', email: 'bob@example.com', orders: 5, spent: 489.5, lastOrder: new Date().toISOString() },
      { name: 'Charlie Brown', email: 'charlie@example.com', orders: 24, spent: 5420.2, lastOrder: new Date().toISOString() },
    ];

    mock.forEach((m) => {
      if (!map.has(m.email.toLowerCase())) {
        map.set(m.email.toLowerCase(), { ...m, lastOrder: m.lastOrder });
      }
    });

    return Array.from(map.values()).map((c, idx) => ({
      id: idx + 1,
      ...c,
      joined: new Date(c.lastOrder).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status: c.spent > 3000 ? 'VIP' : c.orders > 5 ? 'Active' : 'New',
    }));
  }, [orders]);

  const filtered = derivedCustomers.filter(
    (c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCustomers = derivedCustomers.length;
  const totalSpent = derivedCustomers.reduce((s, c) => s + c.spent, 0);
  const avgOrders = totalCustomers ? (derivedCustomers.reduce((s, c) => s + c.orders, 0) / totalCustomers).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Customers</h1>
          <p className="text-slate-500 text-sm mt-1">{totalCustomers} customers • {formatCurrency(totalSpent)} total revenue</p>
        </div>
        <button className="btn-primary flex items-center gap-2 px-6 py-3 self-start">
          <UserPlus size={18} /> Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Customers', value: totalCustomers, icon: Users, color: 'bg-slate-900 text-white' },
          { label: 'Total Revenue', value: formatCurrency(totalSpent).slice(0, 10), icon: TrendingUp, color: 'bg-emerald-600 text-white' },
          { label: 'Avg Orders / Customer', value: avgOrders, icon: Mail, color: 'bg-primary-600 text-white' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{s.value}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Spent</th>
                <th className="px-6 py-4">Last Order</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-black text-xs">{c.name[0]}</div>
                      <div>
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600">{c.orders}</td>
                  <td className="px-6 py-4 font-black text-slate-900">{formatCurrency(c.spent)}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{new Date(c.lastOrder).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${c.status === 'VIP' ? 'bg-purple-50 text-purple-700' : c.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'}`}>{c.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Mail size={14} /></button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"><MoreHorizontal size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;
