import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { cn } from '../../utils';

const AdminSidebar = () => {
  const links = [
    { name: 'Analytics', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <Link to="/" className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">H</div>
          HANOUT Admin
        </Link>
      </div>

      <nav className="flex-grow p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.href}
            end={link.href === '/admin'}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
              isActive 
                ? "bg-primary-600 text-white shadow-lg shadow-primary-900/50" 
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <link.icon size={20} />
            {link.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all text-sm">
          <ArrowLeft size={18} />
          Back to Store
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all text-sm text-left">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
