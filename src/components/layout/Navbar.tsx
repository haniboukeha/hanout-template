import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User as UserIcon, LayoutDashboard, LogOut, ChevronRight } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../utils';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { items } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Cart', href: '/cart' },
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setShowProfileMenu(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-black bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent tracking-tighter">
              HANOUT
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary-600",
                  location.pathname === item.href ? "text-primary-600" : "text-slate-500"
                )}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary-600 flex items-center gap-1.5",
                  location.pathname.startsWith('/admin') ? "text-primary-600" : "text-slate-500"
                )}
              >
                <LayoutDashboard size={14} /> Admin
              </Link>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              {!isAuthenticated || !user ? (
                <Link to="/login" className="p-2 text-slate-500 hover:text-primary-600 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                  <UserIcon size={20} />
                  <span className="hidden lg:inline">Sign In</span>
                </Link>
              ) : (
                <div className="relative">
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 p-1 pl-3 bg-slate-50 border border-slate-200 rounded-2xl hover:border-primary-300 transition-all shadow-sm"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 hidden sm:block">{user.name.split(' ')[0]}</span>
                    <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white text-[10px] font-black">
                      {user.name[0].toUpperCase()}
                    </div>
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 overflow-hidden"
                        >
                          <div className="px-5 py-3 border-b border-slate-50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</p>
                            <p className="text-sm font-bold text-slate-900 truncate mt-1">{user.email}</p>
                          </div>
                          {user.role === 'admin' && (
                            <Link to="/admin" onClick={() => setShowProfileMenu(false)} className="flex items-center justify-between px-5 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors">
                              <span className="flex items-center gap-3"><LayoutDashboard size={18} /> Admin Panel</span>
                              <ChevronRight size={14} />
                            </Link>
                          )}
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors text-left border-t border-slate-50">
                            <LogOut size={18} /> Sign Out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <Link to="/cart" className="relative p-2.5 bg-slate-50 rounded-2xl text-slate-500 hover:text-primary-600 transition-all active:scale-95 shadow-sm border border-slate-100">
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-black text-white shadow-lg shadow-primary-200">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2.5 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200 active:scale-95 transition-all"
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
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute inset-x-0 top-full bg-white border-b border-slate-100 z-[46] md:hidden shadow-2xl rounded-b-[2.5rem] overflow-hidden"
            >
              <div className="px-6 py-10 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-6 py-4 rounded-2xl text-base font-black uppercase tracking-widest transition-all",
                      location.pathname === item.href 
                        ? "bg-primary-50 text-primary-600" 
                        : "text-slate-600 active:bg-slate-50"
                    )}
                  >
                    {item.name}
                    <ChevronRight size={18} />
                  </Link>
                ))}
                {isAuthenticated && user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-6 py-4 rounded-2xl text-base font-black uppercase tracking-widest text-slate-600 active:bg-slate-50"
                  >
                    <span className="flex items-center gap-3"><LayoutDashboard size={20} /> Admin Panel</span>
                    <ChevronRight size={18} />
                  </Link>
                )}
                
                <div className="pt-6 mt-6 border-t border-slate-50">
                  {!isAuthenticated || !user ? (
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center w-full py-5 rounded-2xl bg-primary-600 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary-900/20"
                    >
                      Sign In to Account
                    </Link>
                  ) : (
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center w-full py-5 rounded-2xl bg-red-50 text-red-600 font-black uppercase tracking-[0.2em] text-xs transition-all"
                    >
                      <LogOut size={18} className="mr-2" /> Sign Out
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
