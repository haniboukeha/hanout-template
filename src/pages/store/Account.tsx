import { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, Shield, Package, Heart, LogOut, Edit2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useToastStore } from '../../store/useToastStore';
import { validateName, validateEmail, validatePhone } from '../../lib/validators';
import { formatCurrency } from '../../utils';
import { Link } from 'react-router-dom';

const Account = () => {
  const { user, updateProfile, logout } = useAuthStore();
  const { getOrdersByEmail } = useOrderStore();
  const { count: wishlistCount } = useWishlistStore();
  const { addToast } = useToastStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500">Please sign in to view your account.</p>
        <Link to="/login" className="btn-primary mt-4 inline-flex">
          Sign In
        </Link>
      </div>
    );
  }

  const userOrders = getOrdersByEmail(user.email);
  const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    const nameErr = validateName(formData.name);
    if (nameErr) newErrors.name = nameErr;
    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;
    if (formData.phone) {
      const phoneErr = validatePhone(formData.phone);
      if (phoneErr) newErrors.phone = phoneErr;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateProfile({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
    });
    setIsEditing(false);
    setErrors({});
    addToast({ message: 'Profile updated successfully', type: 'success' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">My Account</h1>
        <p className="text-slate-500 mt-2">Manage your profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 text-center">
            <div className="w-24 h-24 bg-slate-900 rounded-[1.5rem] mx-auto flex items-center justify-center text-white text-2xl font-black shadow-xl overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name[0].toUpperCase()
              )}
            </div>
            <h2 className="mt-6 text-xl font-black text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500 mt-1">{user.email}</p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold uppercase">
              <Shield size={12} /> {user.role}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-center border-t border-slate-50 pt-6">
              <div>
                <p className="text-xl font-black text-slate-900">{userOrders.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Orders</p>
              </div>
              <div>
                <p className="text-xl font-black text-slate-900">{wishlistCount()}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Wishlist</p>
              </div>
              <div>
                <p className="text-xl font-black text-slate-900">{formatCurrency(totalSpent).slice(0,6)}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Spent</p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Link to="/orders" className="w-full btn-secondary py-3 flex items-center justify-center gap-2">
                <Package size={18} /> Order History
              </Link>
              <Link to="/wishlist" className="w-full btn-secondary py-3 flex items-center justify-center gap-2">
                <Heart size={18} /> Wishlist
              </Link>
              <button
                onClick={logout}
                className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-100"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-6 text-white">
            <h3 className="font-bold">Member since</h3>
            <p className="text-sm text-slate-400 mt-1">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}
            </p>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-slate-400">Account ID</p>
              <p className="font-mono text-xs mt-1 bg-white/10 px-3 py-2 rounded-xl">{user.id}</p>
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900">Personal Information</h3>
              <button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isEditing ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isEditing ? (
                  <>
                    <Save size={16} /> Save Changes
                  </>
                ) : (
                  <>
                    <Edit2 size={16} /> Edit Profile
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl font-bold border transition-all ${
                      isEditing
                        ? 'bg-white border-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none'
                        : 'bg-slate-50 border-transparent text-slate-600'
                    } ${errors.name ? 'border-red-300 bg-red-50' : ''}`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl font-bold border transition-all ${
                      isEditing
                        ? 'bg-white border-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none'
                        : 'bg-slate-50 border-transparent text-slate-600'
                    } ${errors.email ? 'border-red-300 bg-red-50' : ''}`}
                    placeholder="john@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl font-bold border transition-all ${
                      isEditing
                        ? 'bg-white border-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none'
                        : 'bg-slate-50 border-transparent text-slate-600'
                    } ${errors.phone ? 'border-red-300 bg-red-50' : ''}`}
                    placeholder="+213 5XX XXX XXX"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-slate-300" size={18} />
                  <textarea
                    disabled={!isEditing}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl font-bold border transition-all resize-none ${
                      isEditing
                        ? 'bg-white border-slate-200 focus:ring-2 focus:ring-primary-500 focus:outline-none'
                        : 'bg-slate-50 border-transparent text-slate-600'
                    }`}
                    placeholder="Your delivery address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders Preview */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">Recent Orders</h3>
              <Link to="/orders" className="text-sm font-bold text-primary-600 hover:underline">
                View all
              </Link>
            </div>

            {userOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300 mb-4">
                  <Package size={28} />
                </div>
                <p className="text-slate-500 font-medium">No orders yet</p>
                <Link to="/shop" className="btn-primary mt-4 inline-flex px-8 py-3">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {userOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">{order.id}</p>
                      <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">{formatCurrency(order.total)}</p>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${
                        order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
