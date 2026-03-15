import { useState } from 'react';
import { Search, UserPlus, Mail, MoreHorizontal } from 'lucide-react';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const customers = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', orders: 12, spent: 1450.00, joined: 'Oct 2023', status: 'Active' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', orders: 5, spent: 489.50, joined: 'Nov 2023', status: 'Active' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', orders: 24, spent: 5420.20, joined: 'Sep 2023', status: 'VIP' },
    { id: 4, name: 'David Wilson', email: 'david@example.com', orders: 1, spent: 45.99, joined: 'Feb 2024', status: 'Active' },
    { id: 5, name: 'Eve Davis', email: 'eve@example.com', orders: 0, spent: 0.00, joined: 'Mar 2024', status: 'Inactive' },
  ];

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Customers</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your customer database and relationship</p>
        </div>
        <button className="btn-primary flex items-center gap-2 px-6 py-3 shadow-primary-900/20">
          <UserPlus size={20} /> Add Customer
        </button>
      </div>

      <div className="card bg-white shadow-xl shadow-slate-200/50">
        <div className="p-6 border-b border-slate-100">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest text-slate-400 font-extrabold border-b border-slate-50">
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Orders</th>
                <th className="px-8 py-5">Total Spent</th>
                <th className="px-8 py-5">Joined</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold uppercase">
                        {customer.name[0]}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{customer.name}</span>
                        <span className="text-xs text-slate-400 font-medium">{customer.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-600">{customer.orders}</td>
                  <td className="px-8 py-5 font-bold text-slate-900">${customer.spent.toLocaleString()}</td>
                  <td className="px-8 py-5 text-slate-500 font-medium">{customer.joined}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      customer.status === 'VIP' ? 'bg-purple-50 text-purple-600' :
                      customer.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                        <Mail size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                        <MoreHorizontal size={16} />
                      </button>
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
