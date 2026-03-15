import { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ArrowLeft, CheckCircle2, User, MapPin, Mail } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useProductStore } from '../../store/useProductStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { formatCurrency, cn } from '../../utils';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ALGERIA_WILAYAS } from '../../data/algeria-provinces';
import { ALGERIA_COMMUNES } from '../../data/algeria-communes';
import { getDeliveryPrice } from '../../utils/delivery';
import type { DeliveryMethod } from '../../utils/delivery';

const Cart = () => {
  const [step, setStep] = useState(1); // 1: Items, 2: Info, 3: Success
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    wilaya: '',
    city: '',
    phone: '',
    deliveryMethod: 'Desk' as DeliveryMethod,
  });

  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { addOrder } = useOrderStore();
  const { reduceStock } = useProductStore();
  const { addNotification } = useNotificationStore();

  // Prefill form if user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name,
        email: prev.email || user.email,
      }));
    }
  }, [isAuthenticated, user]);

  const subtotal = getTotal();
  
  // Dynamic Shipping Calculation
  const wilayaId = formData.wilaya.split(' - ')[0];
  const baseShipping = getDeliveryPrice(wilayaId, formData.deliveryMethod);
  const shipping = subtotal > 20000 ? 0 : baseShipping; // Free over 20,000 DA
  
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'wilaya') {
      setFormData({ ...formData, [name]: value, city: '' }); // Reset city when wilaya changes
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    // Create new order
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: orderId,
      customerName: formData.fullName,
      email: formData.email,
      shippingAddress: `${formData.address}, ${formData.city}, ${formData.wilaya} (${formData.deliveryMethod})`,
      phone: formData.phone,
      items: [...items],
      total: total,
      status: 'Processing' as const,
      createdAt: new Date().toISOString(),
    };

    addOrder(newOrder);

    // Decrease Inventory Stock
    items.forEach(item => {
      reduceStock(item.id, item.quantity);
    });

    // Trigger Notification for Admin
    addNotification({
      id: `NOT-${Date.now()}`,
      title: 'New Order Received',
      message: `${formData.fullName} placed a new order ${orderId} for ${formatCurrency(total)}`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
      orderId: orderId,
    });

    setStep(3);
    clearCart();
  };

  if (step === 3) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-8"
        >
          <CheckCircle2 size={40} />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight px-4">Order Placed!</h1>
        <p className="mt-4 text-slate-500 max-w-md mx-auto text-base sm:text-lg px-6">
          Thank you <span className="font-bold text-slate-900">{formData.fullName}</span>.
          We've sent a confirmation to <span className="font-bold text-slate-900">{formData.email}</span>.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 px-6">
          <Link to="/shop" className="btn-primary px-8 py-4">
            Continue Shopping
          </Link>
          <Link to="/" className="btn-secondary px-8 py-4 font-bold text-slate-700">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && step !== 3) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto mb-8 shadow-inner">
          <ShoppingBag size={40} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-4 text-slate-500 max-w-md mx-auto px-6 font-medium">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link to="/shop" className="btn-primary mt-10 inline-flex px-10">
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-12 gap-6 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Shopping Cart</h1>
        <div className="flex items-center gap-4">
          <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all", step >= 1 ? "bg-primary-600 text-white shadow-lg shadow-primary-200" : "bg-slate-100 text-slate-400")}>1</div>
          <div className="w-8 sm:w-12 h-1 bg-slate-100 rounded-full"></div>
          <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all", step >= 2 ? "bg-primary-600 text-white shadow-lg shadow-primary-200" : "bg-slate-100 text-slate-400")}>2</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 sm:gap-12">
        {/* Left Column */}
        <div className="lg:col-span-2">
          {step === 1 ? (
            <div className="space-y-4 sm:space-y-6">
              <AnimatePresence mode='popLayout'>
                {items.map((item) => (
                  <motion.div
                    key={`${item.id}-${item.selectedSize}`}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow relative group"
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    </div>

                    <div className="flex-grow text-center sm:text-left min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">{item.category}</p>
                        {item.selectedSize && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase">
                            Size: {item.selectedSize}
                          </span>
                        )}
                      </div>
                      <p className="text-primary-600 font-black mt-2 text-xl">{formatCurrency(item.price)}</p>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 mt-4 sm:mt-0">
                      <div className="flex items-center border-2 border-slate-50 rounded-2xl overflow-hidden bg-slate-50/50 shadow-sm p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                          className="p-2.5 hover:bg-white rounded-xl text-slate-500 transition-all active:scale-95"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-black text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                          className="p-2.5 hover:bg-white rounded-xl text-slate-500 transition-all active:scale-95"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id, item.selectedSize)}
                        className="p-3 text-slate-400 hover:text-red-500 hover:border-red-100 border border-transparent rounded-2xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm"
            >
              <div className="flex items-center gap-2 mb-8 text-primary-600 font-bold">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 hover:translate-x-[-4px] transition-transform">
                  <ArrowLeft size={18} /> <span className="text-sm font-black uppercase tracking-widest">Back to Items</span>
                </button>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">Delivery Details</h2>
              <form onSubmit={handleCheckout} id="checkout-form" className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2 md:col-span-1">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all focus:bg-white font-bold"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all focus:bg-white font-bold"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all focus:bg-white font-bold"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Wilaya</label>
                    <div className="relative">
                      <select
                        name="wilaya"
                        required
                        value={formData.wilaya}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all focus:bg-white font-bold appearance-none cursor-pointer"
                      >
                        <option value="">Select Wilaya</option>
                        {ALGERIA_WILAYAS.map((wilaya) => (
                          <option key={wilaya.id} value={`${wilaya.id} - ${wilaya.name}`}>
                            {wilaya.id} - {wilaya.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ArrowRight size={16} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">City / Commune</label>
                    <div className="relative">
                      <select
                        name="city"
                        required
                        disabled={!formData.wilaya}
                        value={formData.city}
                        onChange={handleInputChange}
                        className={cn(
                          "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold appearance-none cursor-pointer",
                          !formData.wilaya && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <option value="">{formData.wilaya ? 'Select Commune' : 'Choose Wilaya first'}</option>
                        {formData.wilaya && ALGERIA_COMMUNES[formData.wilaya.split(' - ')[0]]?.map((commune) => (
                          <option key={commune} value={commune}>
                            {commune}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ArrowRight size={16} className="rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Street Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all focus:bg-white font-bold"
                      placeholder="123 Luxury St."
                    />
                  </div>
                </div>

                {/* Delivery Method Selector */}
                <div className="pt-4 border-t border-slate-50">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Delivery Method</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, deliveryMethod: 'Desk' })}
                      className={cn(
                        "p-5 rounded-2xl border-2 transition-all flex flex-col gap-2 text-left",
                        formData.deliveryMethod === 'Desk' 
                          ? "border-primary-600 bg-primary-50/50" 
                          : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-black text-slate-900">Desk (Bureau)</span>
                        {formData.wilaya && (
                          <span className="text-xs font-bold text-primary-600">
                            {getDeliveryPrice(formData.wilaya.split(' - ')[0], 'Desk')} DA
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">Pick up your package at the nearest delivery agency.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, deliveryMethod: 'Home' })}
                      className={cn(
                        "p-5 rounded-2xl border-2 transition-all flex flex-col gap-2 text-left",
                        formData.deliveryMethod === 'Home' 
                          ? "border-primary-600 bg-primary-50/50" 
                          : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-black text-slate-900">Home Delivery</span>
                        {formData.wilaya && (
                          <span className="text-xs font-bold text-primary-600">
                            {getDeliveryPrice(formData.wilaya.split(' - ')[0], 'Home')} DA
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">Receive your package directly at your doorstep.</p>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </div>

        {/* Right Column (Summary) */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 rounded-[3rem] p-8 sm:p-10 text-white sticky top-24 shadow-2xl shadow-slate-900/40 overflow-hidden relative group">
            <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShoppingBag size={200} />
            </div>

            <h2 className="text-xl font-black mb-8 border-b border-white/10 pb-6 uppercase tracking-widest">Order Summary</h2>

            <div className="space-y-5 mb-10 relative z-10">
              <div className="flex justify-between text-slate-400 font-bold text-sm tracking-widest uppercase">
                <span>Subtotal</span>
                <span className="text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400 font-bold text-sm tracking-widest uppercase">
                <span>Shipping</span>
                <span className="text-emerald-400">{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
              </div>
              <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary-400 mb-1">Final Total</p>
                  <span className="text-3xl font-black">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              {step === 1 ? (
                <button
                  onClick={handleNextStep}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center gap-3 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary-900/40 active:scale-95"
                >
                  Continue to Shipping <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  form="checkout-form"
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-3 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/40 active:scale-95"
                >
                  Complete Order <CheckCircle2 size={18} />
                </button>
              )}
            </div>

            <p className="mt-8 text-center text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-widest px-4">
              Secure checkout verified by <span className="text-primary-400">HANOUT SSL</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
