import { useMemo } from 'react';
import { DollarSign, ShoppingBag, Users, ArrowUpRight, ArrowDownRight, TrendingUp, Package, Clock } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { useOrderStore } from '../../store/useOrderStore';
import { formatCurrency } from '../../utils';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { products } = useProductStore();
  const { orders } = useOrderStore();

  const stats = useMemo(() => {
    // Inventory value based on current stock levels
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const lowStockItems = products.filter(p => p.stock < 10).length;
    
    // Revenue based ONLY on Delivered orders
    const deliveredOrders = orders.filter(o => o.status === 'Delivered');
    const totalDeliveredValue = deliveredOrders.reduce((acc, o) => acc + o.total, 0);

    return {
      revenue: totalDeliveredValue, 
      ordersCount: orders.length,
      customersCount: Array.from(new Set(orders.map(o => o.email))).length,
      inventoryValue: totalInventoryValue,
      lowStock: lowStockItems
    };
  }, [products, orders]);

  const cards = [
    { 
      label: 'Gross Revenue', 
      value: formatCurrency(stats.revenue), 
      change: '+14.2%', 
      isUp: true, 
      icon: DollarSign, 
      color: 'bg-emerald-50 text-emerald-600' 
    },
    { 
      label: 'Total Orders', 
      value: stats.ordersCount.toString(), 
      change: '+5.7%', 
      isUp: true, 
      icon: ShoppingBag, 
      color: 'bg-primary-50 text-primary-600' 
    },
    { 
      label: 'Unique Customers', 
      value: stats.customersCount.toString(), 
      change: '+2.1%', 
      isUp: true, 
      icon: Users, 
      color: 'bg-amber-50 text-amber-600' 
    },
    { 
      label: 'Inventory Value', 
      value: formatCurrency(stats.inventoryValue), 
      change: '-1.4%', 
      isUp: false, 
      icon: Package, 
      color: 'bg-slate-50 text-slate-600' 
    },
  ];

  const recentOrders = orders.slice(0, 5).map(order => ({
    id: order.id,
    customer: order.customerName,
    status: order.status,
    amount: order.total,
    date: new Date(order.createdAt).toLocaleDateString()
  }));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back, Admin. Here's your store's performance today.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          <button className="px-4 py-2 text-xs font-bold bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-200">Last 30 Days</button>
          <button className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">Year to Date</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="card p-6 bg-white flex flex-col justify-between group hover:border-primary-200 transition-all border-transparent border shadow-xl shadow-slate-200/50">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl ${card.color} transition-transform group-hover:scale-110`}>
                <card.icon size={22} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${card.isUp ? 'text-emerald-500' : 'text-amber-500'}`}>
                {card.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {card.change}
              </div>
            </div>
            <div className="mt-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="xl:col-span-2 card bg-white overflow-hidden shadow-xl shadow-slate-200/50">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-primary-600" /> Recent Activity
            </h3>
            <Link to="/admin/orders" className="text-sm font-bold text-primary-600 hover:underline">View All Orders</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold border-b border-slate-50 bg-slate-50/30">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentOrders.map((order, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5 font-bold text-slate-900">{order.id}</td>
                    <td className="px-6 py-5 text-slate-600">{order.customer}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider ${
                        order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 
                        order.status === 'Processing' ? 'bg-amber-50 text-amber-600' : 
                        order.status === 'Shipped' ? 'bg-blue-50 text-blue-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-slate-900">{formatCurrency(order.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="card bg-slate-900 p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-400/20">
          <div className="absolute top-0 right-0 p-8">
            <TrendingUp size={64} className="text-white/10" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-8">Performance Insights</h3>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="text-sm font-medium text-slate-400">Inventory Health</span>
                  <span className="text-sm font-bold">{Math.max(0, 100 - (stats.lowStock * 15))}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.max(0, 100 - (stats.lowStock * 15))}%` }}></div>
                </div>
                <p className="mt-2 text-xs text-slate-500">{stats.lowStock} items are low on stock and need attention.</p>
              </div>
              
              <div className="pt-8 border-t border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary-400">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Upcoming Restocking</h4>
                    <p className="text-xs text-slate-500">Scheduled for Tomorrow</p>
                  </div>
                </div>
                <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all transform hover:scale-[1.02] active:scale-95">
                  Manage Suppliers
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
