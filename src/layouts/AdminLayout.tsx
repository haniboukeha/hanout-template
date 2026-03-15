import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  ChevronRight,
  Bell,
  Search,
  Clock,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { cn } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { notifications, markAsRead, markAllAsRead, getUnreadCount } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const unreadCount = getUnreadCount();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Products', icon: Package, href: '/admin/products' },
    { name: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
    { name: 'Customers', icon: Users, href: '/admin/customers' },
    { name: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-[60]">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-500"
        >
          <Menu size={24} />
        </button>
        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          HANOUT
        </Link>
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-slate-500"
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-4 h-4 bg-primary-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-slate-900 text-white flex flex-col z-[80] lg:hidden"
            >
              <div className="p-8 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-primary-900/50">
                    H
                  </div>
                  <span className="text-xl font-bold tracking-tight">HANOUT</span>
                </Link>
                <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <nav className="flex-grow px-4 mt-4 space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center justify-between px-6 py-4 rounded-2xl transition-all font-bold text-sm",
                      location.pathname === item.href 
                        ? "bg-primary-600 text-white shadow-xl shadow-primary-900/30" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={20} />
                      {item.name}
                    </div>
                    {location.pathname === item.href && <ChevronRight size={16} />}
                  </Link>
                ))}
              </nav>

              <div className="p-6 border-t border-white/5 space-y-4">
                <Link to="/" className="flex items-center gap-4 px-6 py-4 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                  <ChevronRight size={18} className="rotate-180" /> Back to Store
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-6 py-4 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-2xl transition-all"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-slate-900 text-white flex-col fixed inset-y-0 z-50">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-primary-900/50">
              H
            </div>
            <span className="text-xl font-bold tracking-tight">HANOUT <span className="text-primary-500">Admin</span></span>
          </Link>
        </div>

        <nav className="flex-grow px-4 mt-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center justify-between px-6 py-4 rounded-2xl transition-all font-bold text-sm",
                location.pathname === item.href 
                  ? "bg-primary-600 text-white shadow-xl shadow-primary-900/30" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} />
                {item.name}
              </div>
              {location.pathname === item.href && <ChevronRight size={16} />}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <Link to="/" className="flex items-center gap-4 px-6 py-4 text-sm font-bold text-slate-400 hover:text-white transition-colors">
            <ChevronRight size={18} className="rotate-180" /> Back to Store
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-2xl transition-all"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow lg:pl-72 flex flex-col min-w-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-20 bg-white border-b border-slate-100 sticky top-0 z-40 px-8 items-center justify-between">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Quick search..."
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-slate-100 transition-all font-medium text-sm border focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-primary-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-screen max-w-sm sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 z-40 overflow-hidden"
                    >
                      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-900">Notifications</h3>
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs font-bold text-primary-600 hover:underline"
                        >
                          Mark all as read
                        </button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => {
                                markAsRead(n.id);
                                if (n.orderId) {
                                  navigate('/admin/orders');
                                  setShowNotifications(false);
                                }
                              }}
                              className={cn(
                                "p-6 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer relative",
                                !n.read && "bg-primary-50/30"
                              )}
                            >
                              {!n.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-600 rounded-full"></div>}
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                  <Clock size={10} /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                              {n.orderId && (
                                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-primary-600">
                                  View Order <ExternalLink size={10} />
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-10 text-center flex flex-col items-center gap-3">
                            <Bell size={32} className="text-slate-200" />
                            <p className="text-sm font-bold text-slate-400">All caught up!</p>
                          </div>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="p-4 text-center bg-slate-50/50">
                          <button className="text-xs font-bold text-slate-500 hover:text-slate-900">View History</button>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-px bg-slate-100"></div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] uppercase font-extrabold tracking-widest text-primary-600">Super Admin</p>
              </div>
              <div className="w-10 h-10 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 font-extrabold shadow-sm border border-primary-100 overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=8b5cf6&color=fff`} alt="Admin" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Global Notification AnimatePresence for Mobile */}
      <div className="lg:hidden">
        <AnimatePresence>
          {showNotifications && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowNotifications(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70]"
              />
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="fixed inset-x-0 bottom-0 max-h-[80vh] bg-white rounded-t-[3rem] z-[80] overflow-hidden flex flex-col"
              >
                <div className="p-8 border-b border-slate-50 flex justify-between items-center text-center">
                  <div className="w-12 h-1 bg-slate-200 rounded-full absolute top-3 left-1/2 -translate-x-1/2"></div>
                  <h3 className="font-bold text-slate-900 text-xl">Notifications</h3>
                  <button onClick={markAllAsRead} className="text-xs font-bold text-primary-600">Mark all</button>
                </div>
                <div className="overflow-y-auto flex-grow pb-10">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.orderId) {
                            navigate('/admin/orders');
                            setShowNotifications(false);
                          }
                        }}
                        className={cn(
                          "p-8 border-b border-slate-50 active:bg-slate-50 transition-colors relative",
                          !n.read && "bg-primary-50/30"
                        )}
                      >
                        {!n.read && <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary-600 rounded-full"></div>}
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-base font-bold text-slate-900">{n.title}</h4>
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0">
                            <Clock size={12} /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                      <Bell size={48} className="text-slate-200" />
                      <p className="text-base font-bold text-slate-400">All caught up!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminLayout;
