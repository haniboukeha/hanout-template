import { Bell, CheckCheck, Trash2, Clock, Package, ShoppingBag, AlertCircle, Info } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { cn } from '../../utils';
import { Link } from 'react-router-dom';

const iconMap = {
  info: Info,
  success: CheckCheck,
  warning: AlertCircle,
  error: AlertCircle,
};

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, clearRead, clearNotifications, getUnreadCount } = useNotificationStore();
  const unread = getUnreadCount();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Bell size={28} />
            Notifications
            {unread > 0 && (
              <span className="px-3 py-1 bg-red-500 text-white text-xs rounded-full">{unread} new</span>
            )}
          </h1>
          <p className="text-slate-500 mt-2">{notifications.length} total • {unread} unread</p>
        </div>
        <div className="flex gap-2">
          <button onClick={markAllAsRead} className="btn-secondary px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            <CheckCheck size={16} /> Mark all read
          </button>
          <button onClick={clearRead} className="btn-secondary px-5 py-2.5 text-sm font-bold flex items-center gap-2">
            <Trash2 size={16} /> Clear read
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-dashed border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-300 mb-6">
            <Bell size={36} />
          </div>
          <h3 className="font-black text-slate-900">No notifications</h3>
          <p className="text-slate-500 mt-2 text-sm">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = iconMap[n.type] || Info;
            return (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={cn(
                  'bg-white rounded-2xl border p-5 flex gap-4 hover:shadow-md transition-all cursor-pointer group',
                  !n.read ? 'border-primary-200 bg-primary-50/30 shadow-sm' : 'border-slate-100'
                )}
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border', !n.read ? 'bg-primary-600 text-white border-primary-600' : 'bg-slate-50 text-slate-400 border-slate-100')}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-bold text-slate-900">{n.title}</h4>
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock size={10} /> {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  {n.orderId && (
                    <Link to={`/orders`} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:gap-1.5 transition-all">
                      <Package size={12} /> View Order {n.orderId}
                    </Link>
                  )}
                </div>
                {!n.read && <div className="w-2 h-2 bg-primary-600 rounded-full shrink-0 mt-2" />}
              </div>
            );
          })}

          <div className="pt-6 flex justify-center">
            <button onClick={clearNotifications} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">
              <Trash2 size={14} /> Clear all notifications
            </button>
          </div>
        </div>
      )}

      <div className="mt-12 bg-slate-900 rounded-[1.5rem] p-6 text-white flex items-center gap-4">
        <ShoppingBag size={24} className="text-primary-400" />
        <div>
          <p className="font-bold">Pro tip</p>
          <p className="text-sm text-slate-400 mt-1">Enable push notifications to get instant updates on your orders</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
