import { useState, useMemo } from 'react';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ArrowLeft, CheckCircle2, User, MapPin, Mail, AlertCircle } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useProductStore } from '../../store/useProductStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useToastStore } from '../../store/useToastStore';
import { formatCurrency, cn } from '../../utils';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ALGERIA_WILAYAS } from '../../data/algeria-provinces';
import { ALGERIA_COMMUNES } from '../../data/algeria-communes';
import { getDeliveryPrice } from '../../utils/delivery';
import type { DeliveryMethod } from '../../utils/delivery';
import { validateCheckout } from '../../lib/validators';

const Cart = () => {
  const [step, setStep] = useState(1);
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    wilaya: '',
    city: '',
    phone: user?.phone || '',
    deliveryMethod: 'Desk' as DeliveryMethod,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();
  const { reduceStock } = useProductStore();
  const { addNotification } = useNotificationStore();
  const { addToast } = useToastStore();

  const subtotal = getTotal();
  const wilayaId = useMemo(() => formData.wilaya.split(' - ')[0], [formData.wilaya]);
  const baseShipping = getDeliveryPrice(wilayaId, formData.deliveryMethod);
  const shipping = subtotal > 20000 ? 0 : baseShipping;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'wilaya') {
      setFormData({ ...formData, [name]: value, city: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const handleNextStep = () => {
    if (items.length === 0) {
      addToast({ message: 'Your cart is empty', type: 'warning' });
      return;
    }
    setStep(2);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateCheckout({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      wilaya: formData.wilaya,
      city: formData.city,
      address: formData.address,
    });

    if (!validation.valid) {
      setFormErrors(validation.errors);
      addToast({ message: 'Please fix form errors', type: 'error' });
      return;
    }

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: orderId,
      customerName: formData.fullName,
      email: formData.email,
      shippingAddress: `${formData.address}, ${formData.city}, ${formData.wilaya} (${formData.deliveryMethod})`,
      phone: formData.phone,
      items: [...items],
      total,
      status: 'Processing' as const,
      createdAt: new Date().toISOString(),
    };

    addOrder(newOrder);
    items.forEach((item) => reduceStock(item.id, item.quantity));

    addNotification({
      id: `NOT-${Date.now()}`,
      title: 'New Order Received',
      message: `${formData.fullName} placed order ${orderId} for ${formatCurrency(total)}`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
      orderId,
    });

    addToast({ message: `Order ${orderId} placed successfully!`, type: 'success', title: 'Order Confirmed' });
    setStep(3);
    clearCart();
  };

  if (step === 3) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-8"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 px-4">Order Placed!</h1>
        <p className="mt-4 text-slate-500 max-w-md mx-auto px-6">
          Thank you <span className="font-bold text-slate-900">{formData.fullName}</span>. Confirmation sent to{' '}
          <span className="font-bold text-slate-900">{formData.email}</span>.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600">
          <PackageIcon />
          Order ID: <span className="font-black text-slate-900">{`ORD-XXXX`}</span> • {formatCurrency(total)}
        </div>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 px-6">
          <Link to="/orders" className="btn-primary px-8 py-4">
            View Orders
          </Link>
          <Link to="/shop" className="btn-secondary px-8 py-4 font-bold">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300 mb-8 border border-slate-100">
          <ShoppingBag size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900">Your cart is empty</h1>
        <p className="mt-3 text-slate-500 max-w-md mx-auto">Looks like you haven't added anything yet</p>
        <Link to="/shop" className="btn-primary mt-8 inline-flex px-10 py-4">
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Shopping Cart</h1>
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm', step >= 1 ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400')}>1</div>
          <div className="w-10 h-1 bg-slate-100 rounded-full" />
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm', step >= 2 ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400')}>2</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 ? (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={`${item.id}-${item.selectedSize}`}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm group"
                  >
                    <div className="w-24 h-24 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 text-center sm:text-left min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{item.name}</h3>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.category}</span>
                        {item.selectedSize && <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">Size: {item.selectedSize}</span>}
                      </div>
                      <p className="text-primary-600 font-black mt-1">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl p-1">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)} className="p-2 hover:bg-white rounded-lg transition-colors" aria-label="Decrease quantity">
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)} className="p-2 hover:bg-white rounded-lg transition-colors" aria-label="Increase quantity">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id, item.selectedSize)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" aria-label={`Remove ${item.name}`}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 sm:p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary-600 hover:gap-2.5 transition-all mb-6">
                <ArrowLeft size={16} /> Back to Cart
              </button>
              <h2 className="text-2xl font-black text-slate-900 mb-6">Delivery Details</h2>
              <form onSubmit={handleCheckout} id="checkout-form" className="space-y-5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input name="fullName" required value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white ${formErrors.fullName ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} />
                    </div>
                    {formErrors.fullName && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{formErrors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input name="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder="john@example.com" className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white ${formErrors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} />
                    </div>
                    {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Phone</label>
                    <input name="phone" required value={formData.phone} onChange={handleInputChange} placeholder="+213 5XX XXX XXX" className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white ${formErrors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} />
                    {formErrors.phone && <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Wilaya</label>
                    <select name="wilaya" required value={formData.wilaya} onChange={handleInputChange} className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white ${formErrors.wilaya ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
                      <option value="">Select Wilaya</option>
                      {ALGERIA_WILAYAS.map((w) => (
                        <option key={w.id} value={`${w.id} - ${w.name}`}>{w.id} - {w.name}</option>
                      ))}
                    </select>
                    {formErrors.wilaya && <p className="mt-1 text-xs text-red-500">{formErrors.wilaya}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">City / Commune</label>
                    <select name="city" required disabled={!formData.wilaya} value={formData.city} onChange={handleInputChange} className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${!formData.wilaya ? 'opacity-50' : ''} ${formErrors.city ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
                      <option value="">{formData.wilaya ? 'Select Commune' : 'Choose Wilaya first'}</option>
                      {formData.wilaya && ALGERIA_COMMUNES[wilayaId]?.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {formErrors.city && <p className="mt-1 text-xs text-red-500">{formErrors.city}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Street Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input name="address" required value={formData.address} onChange={handleInputChange} placeholder="123 Luxury St, Block A" className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white ${formErrors.address ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} />
                    </div>
                    {formErrors.address && <p className="mt-1 text-xs text-red-500">{formErrors.address}</p>}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">Delivery Method</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'Desk', title: 'Desk (Bureau)', desc: 'Pickup at agency' },
                      { id: 'Home', title: 'Home Delivery', desc: 'Direct to doorstep' },
                    ].map((m) => (
                      <button key={m.id} type="button" onClick={() => setFormData({ ...formData, deliveryMethod: m.id as DeliveryMethod })} className={cn('p-4 rounded-xl border-2 text-left transition-all', formData.deliveryMethod === m.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 hover:border-slate-200 bg-white')}>
                        <div className="flex justify-between items-center">
                          <span className="font-black text-sm">{m.title}</span>
                          {formData.wilaya && <span className={cn('text-xs font-bold', formData.deliveryMethod === m.id ? 'text-white' : 'text-primary-600')}>{getDeliveryPrice(wilayaId, m.id as DeliveryMethod)} DA</span>}
                        </div>
                        <p className={cn('text-[11px] mt-1', formData.deliveryMethod === m.id ? 'text-slate-300' : 'text-slate-500')}>{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white sticky top-28 shadow-2xl shadow-slate-900/30 overflow-hidden relative">
            <h2 className="text-sm font-black uppercase tracking-widest border-b border-white/10 pb-4 mb-6">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm"><span className="text-slate-400">Subtotal</span><span className="font-bold">{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Shipping</span><span className="font-bold text-emerald-400">{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span></div>
              {shipping === 0 && subtotal > 0 && <p className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">🎉 Free shipping over 20,000 DA applied</p>}
              <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                <span className="text-xs font-black uppercase tracking-widest text-primary-400">Total</span>
                <span className="text-2xl font-black">{formatCurrency(total)}</span>
              </div>
            </div>

            {step === 1 ? (
              <button onClick={handleNextStep} className="w-full py-4 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors shadow-lg active:scale-[0.98]">
                Checkout <ArrowRight size={18} />
              </button>
            ) : (
              <button form="checkout-form" type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/30 active:scale-[0.98]">
                Complete Order <CheckCircle2 size={18} />
              </button>
            )}

            <p className="mt-6 text-[10px] text-center text-slate-500 uppercase tracking-widest font-bold">Secure by HANOUT SSL</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function PackageIcon() {
  return <ShoppingBag size={14} />;
}

export default Cart;
