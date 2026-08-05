import { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Menu,
  X,
  User as UserIcon,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Heart,
  Package,
  UserCircle,
  Bell,
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { cn } from '../../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useClickOutside } from '../../hooks/useClickOutside';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { items } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { count: wishlistCount } = useWishlistStore();
  const location = useLocation();
  const navigate = useNavigate();
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const wishCount = wishlistCount();
  const profileRef = useRef<HTMLDivElement>(null);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  useClickOutside(profileRef, () => setShowProfileMenu(false), showProfileMenu);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setShowProfileMenu(false);
    navigate('/');
  };

  const handleProfileToggle = () => {
    setShowProfileMenu((prev) => !prev);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-8">
            <Link
              to="/"
              className="text-2xl font-black bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent tracking-tighter"
              aria-label="HANOUT Home"
            >
              HANOUT
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'px-4 py-2 rounded-xl text-[13px] font-bold uppercase tracking-wide transition-all',
                    location.pathname === item.href
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  {item.name}
                </Link>
              ))}
              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={cn(
                    'px-4 py-2 rounded-xl text-[13px] font-bold uppercase tracking-wide transition-all flex items-center gap-1.5 ml-2',
                    location.pathname.startsWith('/admin')
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'text-slate-500 hover:text-primary-600 hover:bg-primary-50'
                  )}
                >
                  <LayoutDashboard size={14} /> Admin
                </Link>
              )}
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2">
            <Link
              to="/wishlist"
              className="relative p-2.5 bg-slate-50 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all"
              aria-label={`Wishlist, ${wishCount} items`}
            >
              <Heart size={20} className={wishCount > 0 ? 'fill-red-500 text-red-500' : ''} />
              {wishCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-lg">
                  {wishCount}
                </span>
              )}
            </Link>

            <div className="relative" ref={profileRef}>
              {!isAuthenticated || !user ? (
                <Link
                  to="/login"
                  className="p-2.5 bg-slate-50 rounded-xl text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-slate-100"
                >
                  <UserIcon size={18} />
                  <span className="hidden lg:inline">Sign In</span>
                </Link>
              ) : (
                <div className="relative">
                  <button
                    onClick={handleProfileToggle}
                    className="flex items-center gap-2 p-1 pl-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-primary-300 hover:bg-white transition-all shadow-sm"
                    aria-expanded={showProfileMenu}
                    aria-haspopup="true"
                  >
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 hidden sm:block max-w-[80px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[11px] font-black shrink-0 overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name[0].toUpperCase()
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden"
                        role="menu"
                      >
                        <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Account
                          </p>
                          <p className="text-sm font-bold text-slate-900 truncate mt-1">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-50 text-primary-700 text-[10px] font-bold uppercase">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            {user.role}
                          </div>
                        </div>

                        <div className="py-2">
                          <Link
                            to="/account"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            role="menuitem"
                          >
                            <UserCircle size={18} /> My Account
                          </Link>
                          <Link
                            to="/orders"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            role="menuitem"
                          >
                            <Package size={18} /> Orders
                          </Link>
                          <Link
                            to="/wishlist"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            role="menuitem"
                          >
                            <Heart size={18} /> Wishlist {wishCount > 0 && `(${wishCount})`}
                          </Link>
                          <Link
                            to="/notifications"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            role="menuitem"
                          >
                            <Bell size={18} /> Notifications
                          </Link>
                          {user.role === 'admin' && (
                            <Link
                              to="/admin"
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center justify-between px-5 py-3 text-sm font-bold text-primary-600 hover:bg-primary-50 transition-colors"
                              role="menuitem"
                            >
                              <span className="flex items-center gap-3">
                                <LayoutDashboard size={18} /> Admin Panel
                              </span>
                              <ChevronRight size={14} />
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-slate-50 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors text-left"
                            role="menuitem"
                          >
                            <LogOut size={18} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <Link
              to="/cart"
              className="relative p-2.5 bg-slate-900 rounded-xl text-white hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/20 ml-1"
              aria-label={`Cart, ${cartItemCount} items`}
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-[11px] font-black text-white shadow-lg ring-2 ring-white">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl shadow-sm active:scale-95 transition-all"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] md:hidden"
            />
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute inset-x-0 top-full bg-white border-b border-slate-100 z-[46] md:hidden shadow-2xl rounded-b-[2rem] overflow-hidden"
            >
              <div className="px-6 py-8 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-6 py-4 rounded-2xl text-base font-black uppercase tracking-widest transition-all',
                      location.pathname === item.href
                        ? 'bg-slate-900 text-white shadow-xl'
                        : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {item.name}
                    <ChevronRight size={18} />
                  </Link>
                ))}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    to="/account"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm text-slate-600"
                  >
                    <UserCircle size={18} /> Account
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm text-slate-600"
                  >
                    <Package size={18} /> Orders
                  </Link>
                </div>

                {isAuthenticated && user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-6 py-4 rounded-2xl text-base font-black uppercase tracking-widest text-primary-600 bg-primary-50 border border-primary-100"
                  >
                    <span className="flex items-center gap-3">
                      <LayoutDashboard size={20} /> Admin Panel
                    </span>
                    <ChevronRight size={18} />
                  </Link>
                )}

                <div className="pt-6 mt-4 border-t border-slate-100">
                  {!isAuthenticated || !user ? (
                    <div className="space-y-3">
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center w-full py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-[0.15em] text-xs shadow-xl"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black uppercase tracking-[0.15em] text-xs"
                      >
                        Create Account
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center w-full py-4 rounded-2xl bg-red-50 text-red-600 font-black uppercase tracking-[0.15em] text-xs border border-red-100"
                    >
                      <LogOut size={18} className="mr-2" /> Sign Out
                    </button>
                  )}
                </div>

                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 pt-4">
                  {user ? `Signed in as ${user.email}` : 'Premium shopping experience'}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
