import { useState } from 'react';
import { Search, Eye, Download, Trash2, Package, MapPin, Phone, Mail, Clock, CheckCircle, Truck, XCircle, ChevronRight, Printer, Share2, Users, ShoppingBag } from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { formatCurrency, cn } from '../../utils';
import Modal from '../../components/common/Modal';
import type { Order, OrderStatus } from '../../types';

const OrdersManagement = () => {
  const { orders, updateOrderStatus, deleteOrder } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         o.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Processing': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const handeViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return <CheckCircle size={14} />;
      case 'Processing': return <Clock size={14} />;
      case 'Shipped': return <Truck size={14} />;
      case 'Cancelled': return <XCircle size={14} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor and manage customer purchases and fulfillment</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2 px-6 py-3 font-bold text-slate-700">
            <Download size={20} /> Export
          </button>
        </div>
      </div>

      <div className="card bg-white shadow-xl shadow-slate-200/50">
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4 text-sm">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium transition-all"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={cn(
                  "px-4 py-2 rounded-xl font-bold transition-all text-xs",
                  statusFilter === status 
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-200" 
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest text-slate-400 font-extrabold border-b border-slate-50">
                <th className="px-8 py-5">Order ID</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Total</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{order.id}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-bold text-slate-900">{order.customerName}</div>
                    <div className="text-[10px] text-slate-400">{order.email}</div>
                  </td>
                  <td className="px-8 py-5 text-slate-500 font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-5">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider outline-none cursor-pointer border shadow-sm transition-all",
                        getStatusColor(order.status)
                      )}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-8 py-5 text-right text-slate-900 font-extrabold">{formatCurrency(order.total)}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => handeViewOrder(order)}
                        className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => deleteOrder(order.id)}
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Package size={48} className="opacity-20" />
                      <p className="font-bold">No orders found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        title={`Order Intelligence - ${selectedOrder?.id}`}
        maxWidth="max-w-3xl"
      >
        {selectedOrder && (
          <div className="space-y-8 print:p-0">
            {/* Header / Status Banner */}
            <div className={cn(
              "p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between border-2 gap-4",
              getStatusColor(selectedOrder.status)
            )}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/50 backdrop-blur-md flex items-center justify-center shadow-sm">
                  {getStatusIcon(selectedOrder.status)}
                </div>
                <div>
                  <span className="font-black uppercase tracking-widest text-[10px] opacity-60 block">Current Status</span>
                  <span className="font-bold text-lg">{selectedOrder.status}</span>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <span className="font-black uppercase tracking-widest text-[10px] opacity-60 block">Transaction Date</span>
                <span className="font-bold">{new Date(selectedOrder.createdAt).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Customer Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                  <Users size={14} className="text-primary-500" /> Customer Information
                </h4>
                <div className="bg-slate-50 p-6 rounded-[2rem] space-y-4 border border-slate-100 italic transition-hover hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary-600 shadow-sm">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</p>
                      <p className="text-sm font-bold text-slate-900">{selectedOrder.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-sm">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Contact</p>
                      <p className="text-sm font-bold text-slate-900">{selectedOrder.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shipping Destination</p>
                      <p className="text-sm font-bold text-slate-900 leading-relaxed">{selectedOrder.shippingAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                  <ShoppingBag size={14} className="text-primary-500" /> Financial Summary
                </h4>
                <div className="bg-slate-900 p-8 rounded-[2rem] text-white space-y-4 shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ShoppingBag size={128} />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                  <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary-400">Total Captured</p>
                      <span className="text-3xl font-black block mt-1">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                    <div className="bg-primary-600/20 p-3 rounded-2xl border border-primary-500/30">
                      <CheckCircle className="text-primary-400" size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                <Package size={14} className="text-primary-500" /> Manifest ({selectedOrder.items.length} items)
              </h4>
              <div className="bg-white border-2 border-slate-50 rounded-[2rem] overflow-hidden shadow-sm">
                {selectedOrder.items.length > 0 ? (
                  <div className="divide-y-2 divide-slate-50">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="p-5 flex items-center gap-6 hover:bg-slate-50/50 transition-colors">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0 shadow-sm">
                          <img src={item.image} alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                        </div>
                        <div className="flex-grow">
                          <p className="font-extrabold text-slate-900 text-base">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">{item.category}</p>
                            {item.selectedSize && (
                              <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-[10px] font-black rounded-md uppercase">
                                Size: {item.selectedSize}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-lg">{formatCurrency(item.price)}</p>
                          <p className="text-xs font-bold text-slate-400 italic">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-4">
                    <Package size={48} className="opacity-10" />
                    <p className="text-sm font-bold uppercase tracking-widest">No order items detected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Actions Menu */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button 
                className="btn-secondary py-4 font-black text-[10px] uppercase tracking-widest text-slate-500"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Dismiss
              </button>
              <button 
                onClick={handlePrintInvoice}
                className="btn-secondary py-4 font-black text-[10px] uppercase tracking-widest text-slate-500 flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Invoice
              </button>
              <button className="btn-secondary py-4 font-black text-[10px] uppercase tracking-widest text-slate-500 flex items-center justify-center gap-2">
                <Share2 size={16} /> Dispatch
              </button>
              <button className="btn-primary py-4 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2">
                <ChevronRight size={16} /> Progress
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersManagement;
