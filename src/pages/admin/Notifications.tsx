import { useState, useEffect } from 'react';
import { Bell, Send, CheckCheck, Trash2, AlertCircle, Info, Package, Users } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useToastStore } from '../../store/useToastStore';
import { cn } from '../../utils';
import type { Notification } from '../../types';

const AdminNotifications = () => {
  const { notifications, createNotification, markAsRead, markAllAsRead, clearNotifications, getUnreadCount, fetchNotifications } = useNotificationStore();
  const { addToast } = useToastStore();
  const [form, setForm] = useState({ title: '', message: '', type: 'info' as Notification['type'] });
  const [sending, setSending] = useState(false);

  const unread = getUnreadCount();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      addToast({ message: 'Title and message are required', type: 'error' });
      return;
    }
    setSending(true);
    const ok = await createNotification({ title: form.title, message: form.message, type: form.type });
    setSending(false);
    if (ok) {
      addToast({ message: 'Notification sent', type: 'success' });
      setForm({ title: '', message: '', type: 'info' });
    } else {
      addToast({ message: 'Failed to send notification', type: 'error' });
    }
  };

  const stats = [
    { label: 'Total', value: notifications.length, icon: Bell, color: 'bg-slate-900 text-white' },
    { label: 'Unread', value: unread, icon: AlertCircle, color: 'bg-amber-500 text-white' },
    { label: 'Read', value: notifications.length - unread, icon: CheckCheck, color: 'bg-emerald-600 text-white' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and broadcast notifications</p>
        </div>
        <button onClick={markAllAsRead} className="btn-secondary px-6 py-2.5 font-bold text-sm flex items-center gap-2">
          <CheckCheck size={16} /> Mark all read
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Send Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[1.5rem] border border-slate-100 p-6 shadow-sm sticky top-24">
            <h3 className="font-black text-slate-900 flex items-center gap-2 mb-6">
              <Send size={18} className="text-primary-600" /> Create Notification
            </h3>

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. New order received"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as Notification['type'] })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  placeholder="Notification message..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
                />
              </div>

              <button type="submit" disabled={sending} className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60">
                <Send size={16} /> {sending ? 'Sending...' : 'Send Notification'}
              </button>
            </form>

            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                <Users size={14} /> Broadcast
              </p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Notifications are broadcast to all customers and admins, and can be linked to orders</p>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-900">Recent Notifications</h3>
              <button onClick={clearNotifications} className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1">
                <Trash2 size={12} /> Clear all
              </button>
            </div>
            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell size={32} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-sm font-bold text-slate-400">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={cn('p-5 flex gap-4 hover:bg-slate-50 cursor-pointer transition-colors', !n.read && 'bg-primary-50/40')}
                  >
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border', n.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : n.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-600' : n.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-slate-50 border-slate-100 text-slate-600')}>
                      {n.type === 'success' ? <Package size={18} /> : n.type === 'warning' ? <AlertCircle size={18} /> : <Info size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-4">
                        <p className="font-bold text-slate-900 text-sm truncate">{n.title}</p>
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">{new Date(n.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                      {n.orderId && <span className="mt-2 inline-block px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg">{n.orderId}</span>}
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-primary-600 rounded-full shrink-0 mt-2" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
