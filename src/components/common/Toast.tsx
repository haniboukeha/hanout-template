import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';
import { cn } from '../../utils';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'bg-emerald-600 text-white border-emerald-700',
  error: 'bg-red-600 text-white border-red-700',
  warning: 'bg-amber-500 text-white border-amber-600',
  info: 'bg-slate-900 text-white border-slate-800',
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none max-w-[90vw] sm:max-w-md w-full sm:w-auto">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl',
                colors[toast.type]
              )}
            >
              <Icon size={20} className="shrink-0 mt-0.5" />
              <div className="flex-grow min-w-0">
                {toast.title && (
                  <p className="font-bold text-sm leading-tight">{toast.title}</p>
                )}
                <p className="text-sm font-medium leading-relaxed opacity-90 break-words">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
