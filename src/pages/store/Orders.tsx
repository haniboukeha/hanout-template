import { useState } from 'react';
import { Search, Package, Clock, Truck, CheckCircle2, XCircle, Eye, MapPin, CreditCard } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrderStore } from '../../store/useOrderStore';
import { formatCurrency, cn } from '../../utils';
import Modal from '../../components/common/Modal';
import type { Order, OrderStatus } from '../../types';
import { Link } from 'react-router-dom';

const Orders = () => {
  const { user } = useAuthStore();
  const { orders, getOrdersByEmail } = useOrderStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  const userOrders = user ? getOrdersByEmail(user.email) : orders;

  const filtered = userOrders.filter((o) => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.shippingAddress.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Delivered' };
      case 'Processing': return { icon: Clock, color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Processing' };
      case 'Shipped': return { icon: Truck, color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Shipped' };
      case 'Cancelled': return { icon: XCircle, color: 'bg-red-50 text-red-700 border-red-200', label: 'Cancelled' };
      default: return { icon: Package, color: 'bg-slate-50 text-slate-700 border-slate-200', label: status };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Order History</h1>
          <p className="text-slate-500 mt-2">Track and manage your purchases</p>
        </div>
        <Link to="/shop" className="btn-primary px-8 py-3 self-start">
          Continue Shopping
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: userOrders.length, icon: Package, color: 'bg-slate-900 text-white' },
          { label: 'Processing', value: userOrders.filter(o => o.status === 'Processing').length, icon: Clock, color: 'bg-amber-500 text-white' },
          { label: 'Shipped', value: userOrders.filter(o => o.status === 'Shipped').length, icon: Truck, color: 'bg-blue-600 text-white' },
          { label: 'Delivered', value: userOrders.filter(o => o.status === 'Delivered').length, icon: CheckCircle2, color: 'bg-emerald-600 text-white' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 mb-6 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by order ID or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all',
                statusFilter === status ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-dashed border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-300 mb-6">
            <Package size={36} />
          </div>
          <h3 className="text-lg font-black text-slate-900">No orders found</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm">
            {search || statusFilter !== 'All' ? 'Try adjusting your filters' : "You haven't placed any orders yet"}
          </p>
          <Link to="/shop" className="btn-primary mt-6 inline-flex px-8">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const info = getStatusInfo(order.status);
            return (
              <div key={order.id} className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${info.color}`}>
                      <info.icon size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-black text-slate-900">{order.id}</h3>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${info.color}`}>{info.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Clock size={12} /> {new Date(order.createdAt).toLocaleString()} • {order.items.length} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:ml-auto">
                    <div className="text-right mr-2">
                      <p className="font-black text-slate-900 text-lg">{formatCurrency(order.total)}</p>
                      <p className="text-[11px] text-slate-400 font-bold uppercase">Total</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowModal(true);
                      }}
                      className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
                      aria-label={`View ${order.id} details`}
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-6 flex items-center gap-2">
                  {(['Processing', 'Shipped', 'Delivered'] as OrderStatus[]).map((step, idx) => {
                    const orderSteps = ['Processing', 'Shipped', 'Delivered'];
                    const currentIdx = orderSteps.indexOf(order.status);
                    const stepIdx = orderSteps.indexOf(step);
                    const isCompleted = currentIdx >= stepIdx && order.status !== 'Cancelled';
                    const isCurrent = order.status === step;
                    return (
                      <div key={step} className="flex items-center gap-2 flex-1">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all', isCompleted ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-400', isCurrent && order.status !== 'Delivered' && 'ring-2 ring-primary-500 ring-offset-2')}>
                          {idx + 1}
                        </div>
                        {idx < 2 && <div className={cn('flex-1 h-1 rounded-full transition-all', currentIdx > stepIdx ? 'bg-slate-900' : 'bg-slate-100')} />}
                      </div>
                    );
                  })}
                  {order.status === 'Cancelled' && (
                    <div className="flex items-center gap-2 text-red-500 font-bold text-xs">
                      <XCircle size={16} /> Cancelled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Order ${selectedOrder?.id || ''}`} maxWidth="max-w-2xl">
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Shipping Address</p>
                <p className="text-sm font-bold text-slate-900 flex items-start gap-2">
                  <MapPin size={16} className="shrink-0 mt-0.5 text-slate-400" />
                  {selectedOrder.shippingAddress}
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Payment</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard size={16} className="text-slate-400" />
                  {formatCurrency(selectedOrder.total)} • Cash on Delivery
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-black text-slate-900 mb-3">Items ({selectedOrder.items.length})</h4>
              <div className="space-y-3">
                {selectedOrder.items.length ? (
                  selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-3 bg-white border border-slate-100 rounded-2xl">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-slate-100" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.category} {item.selectedSize && `• Size ${item.selectedSize}`}</p>
                        <p className="text-sm font-black text-slate-900 mt-1">{formatCurrency(item.price)} × {item.quantity}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No item details available for this order</p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <p className="font-bold text-slate-500">Total Amount</p>
              <p className="text-2xl font-black text-slate-900">{formatCurrency(selectedOrder.total)}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
