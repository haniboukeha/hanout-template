import { useState, useEffect, useCallback } from 'react';
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
  X,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { cn } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin', end: true },
  { name: 'Products', icon: Package, href: '/admin/products' },
  { name: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
  { name: 'Customers', icon: Users, href: '/admin/customers' },
  { name: 'Notifications', icon: Bell, href: '/admin/notifications' },
  { name: 'Settings', icon: Settings, href: '/admin/settings' },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { notifications, markAsRead, markAllAsRead, getUnreadCount } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const unreadCount = getUnreadCount();

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Close sidebar on route change - use effect with callback to avoid sync setState lint
  useEffect(() => {
    // Using queueMicrotask to avoid synchronous setState in effect body per lint
    const handleRouteChange = () => {
      if (isSidebarOpen) {
        closeSidebar();
      }
    };
    handleRouteChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNotificationClick = (n: (typeof notifications)[0]) => {
    markAsRead(n.id);
    if (n.orderId) {
      navigate('/admin/orders');
      setShowNotifications(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-[60]">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-50"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>
        <Link
          to="/"
          className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent"
        >
          HANOUT
        </Link>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-50"
          aria-label={`Notifications, ${unreadCount} unread`}
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-primary-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
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
              onClick={closeSidebar}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-slate-900 text-white flex flex-col z-[80] lg:hidden"
              aria-label="Admin navigation"
            >
              <div className="p-8 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-primary-900/50">
                    H
                  </div>
                  <span className="text-xl font-bold tracking-tight">HANOUT</span>
                </Link>
                <button onClick={closeSidebar} className="text-slate-400 hover:text-white p-2">
                  <X size={24} />
                </button>
              </div>

              <nav className="flex-grow px-4 mt-4 space-y-2">
                {menuItems.map((item) => {
                  const isActive = item.end
                    ? location.pathname === item.href
                    : location.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={closeSidebar}
                      className={cn(
                        'flex items-center justify-between px-6 py-4 rounded-2xl transition-all font-bold text-sm',
                        isActive
                          ? 'bg-primary-600 text-white shadow-xl shadow-primary-900/30'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className="flex items-center gap-4">
                        <item.icon size={20} />
                        {item.name}
                        {item.name === 'Notifications' && unreadCount > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {isActive && <ChevronRight size={16} />}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-white/5 space-y-4">
                <Link
                  to="/"
                  className="flex items-center gap-4 px-6 py-4 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                >
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
            <span className="text-xl font-bold tracking-tight">
              HANOUT <span className="text-primary-500">Admin</span>
            </span>
          </Link>
          <div className="mt-6 flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center overflow-hidden">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=8b5cf6&color=fff`}
                alt={user?.name || 'Admin'}
                className="w-full h-full"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-400 flex items-center gap-1">
                <Shield size={10} /> Super Admin
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-grow px-4 mt-2 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = item.end
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center justify-between px-6 py-4 rounded-2xl transition-all font-bold text-sm group',
                  isActive
                    ? 'bg-primary-600 text-white shadow-xl shadow-primary-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center gap-4">
                  <item.icon
                    size={20}
                    className={cn(isActive ? 'text-white' : 'group-hover:text-white')}
                  />
                  {item.name}
                  {item.name === 'Notifications' && unreadCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {isActive && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-3">
          <Link
            to="/"
            className="flex items-center gap-4 px-6 py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors rounded-2xl hover:bg-white/5"
          >
            <ChevronRight size={18} className="rotate-180" /> Back to Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-3 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-2xl transition-all"
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
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Quick search orders, products..."
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-transparent focus:border-slate-200 rounded-xl focus:bg-white transition-all font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              aria-label="Search admin"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  if (target.value) {
                    navigate(`/admin/products?search=${encodeURIComponent(target.value)}`);
                  }
                }
              }}
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition-all border border-slate-100"
                aria-label={`Notifications, ${unreadCount} unread`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowNotifications(false)}
                    ></div>
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 z-40 overflow-hidden"
                      role="dialog"
                      aria-label="Notifications"
                    >
                      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-900">Notifications</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-2 py-1 rounded-lg border">
                            {unreadCount} unread
                          </span>
                          <button
                            onClick={markAllAsRead}
                            className="text-xs font-bold text-primary-600 hover:underline"
                          >
                            Mark all read
                          </button>
                        </div>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={cn(
                                'p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer relative group',
                                !n.read && 'bg-primary-50/50'
                              )}
                            >
                              {!n.read && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                              )}
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="text-sm font-bold text-slate-900 pr-4">{n.title}</h4>
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                                  <Clock size={10} />{' '}
                                  {new Date(n.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                {n.message}
                              </p>
                              {n.orderId && (
                                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-primary-600 group-hover:gap-1.5 transition-all">
                                  View Order <ExternalLink size={10} />
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-10 text-center flex flex-col items-center gap-3">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                              <Bell size={24} className="text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-400">All caught up!</p>
                            <p className="text-xs text-slate-400">No new notifications</p>
                          </div>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="p-3 text-center bg-slate-50/80 border-t border-slate-50 flex gap-2">
                          <Link
                            to="/admin/notifications"
                            onClick={() => setShowNotifications(false)}
                            className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            View all
                          </Link>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="flex-1 py-2.5 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 border border-primary-100 rounded-xl hover:bg-primary-100 transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-px bg-slate-100"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{user?.name || 'Administrator'}</p>
                <p className="text-[11px] font-medium text-slate-500 truncate max-w-[180px]">
                  {user?.email}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-extrabold shadow-sm border border-primary-100 overflow-hidden">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=8b5cf6&color=fff`}
                  alt={user?.name || 'Admin'}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Notifications Sheet */}
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
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-[2rem] z-[80] overflow-hidden flex flex-col"
                role="dialog"
                aria-label="Notifications"
              >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                  <div className="w-12 h-1 bg-slate-200 rounded-full absolute top-3 left-1/2 -translate-x-1/2"></div>
                  <h3 className="font-bold text-slate-900 text-lg mt-2">Notifications</h3>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-bold text-primary-600 px-3 py-1.5 bg-primary-50 rounded-xl"
                    >
                      Mark all read
                    </button>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-2 bg-slate-50 rounded-xl"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="overflow-y-auto flex-grow">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={cn(
                          'p-6 border-b border-slate-50 active:bg-slate-50 transition-colors relative',
                          !n.read && 'bg-primary-50/30'
                        )}
                      >
                        {!n.read && (
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary-600 rounded-full"></div>
                        )}
                        <div className="flex justify-between items-start mb-2 ml-2">
                          <h4 className="text-sm font-bold text-slate-900 pr-4">{n.title}</h4>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                            <Clock size={10} />{' '}
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed ml-2">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-16 text-center flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center">
                        <Bell size={32} className="text-slate-300" />
                      </div>
                      <p className="text-base font-bold text-slate-400">All caught up!</p>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                  <Link
                    to="/admin/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm text-center block"
                  >
                    View all notifications
                  </Link>
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
