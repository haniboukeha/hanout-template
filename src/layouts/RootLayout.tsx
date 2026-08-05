import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useEffect } from 'react';

const RootLayout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main id="main-content" className="flex-grow" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="text-2xl font-black bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent tracking-tighter">
                HANOUT
              </Link>
              <p className="mt-4 text-slate-500 max-w-sm leading-relaxed text-sm">
                Premium e-commerce experience curated for modern shoppers. Quality meets elegance in every detail. Shipping across 58 wilayas.
              </p>
              <div className="mt-6 flex gap-3">
                {[
                  { label: 'Algeria', value: '58 Wilayas' },
                  { label: 'Customers', value: '5,000+' },
                  { label: 'Rating', value: '4.9/5' },
                ].map((s, i) => (
                  <div key={i} className="bg-white border border-slate-100 rounded-xl px-4 py-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                    <p className="font-black text-slate-900 text-sm mt-1">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Shop</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link to="/shop" className="text-slate-500 hover:text-primary-600 transition-colors font-medium">All Products</Link></li>
                <li><Link to="/shop?category=Apparel" className="text-slate-500 hover:text-primary-600 transition-colors font-medium">Apparel</Link></li>
                <li><Link to="/shop?category=Electronics" className="text-slate-500 hover:text-primary-600 transition-colors font-medium">Electronics</Link></li>
                <li><Link to="/wishlist" className="text-slate-500 hover:text-primary-600 transition-colors font-medium">Wishlist</Link></li>
                <li><Link to="/orders" className="text-slate-500 hover:text-primary-600 transition-colors font-medium">Order History</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Company</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link to="/about" className="text-slate-500 hover:text-primary-600 transition-colors font-medium">About Us</Link></li>
                <li><Link to="/contact" className="text-slate-500 hover:text-primary-600 transition-colors font-medium">Contact</Link></li>
                <li><Link to="/account" className="text-slate-500 hover:text-primary-600 transition-colors font-medium">My Account</Link></li>
                <li><a href="#" className="text-slate-500 hover:text-primary-600 transition-colors font-medium">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-500 hover:text-primary-600 transition-colors font-medium">Terms & Returns</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} HANOUT. All rights reserved. Made with ♥ in Algiers.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg">SSL Secure</span>
              <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg">58 Wilayas</span>
              <span className="px-2 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg">Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;
