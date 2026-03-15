import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const RootLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-slate-50 border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                HANOUT
              </span>
              <p className="mt-4 text-slate-500 max-w-xs">
                Premium e-commerce experience curated for modern shoppers. 
                Quality meets elegance in every detail.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Shop</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-slate-500 hover:text-primary-600 transition-colors">New Arrivals</a></li>
                <li><a href="#" className="text-slate-500 hover:text-primary-600 transition-colors">Best Sellers</a></li>
                <li><a href="#" className="text-slate-500 hover:text-primary-600 transition-colors">Sale</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-slate-500 hover:text-primary-600 transition-colors">About</a></li>
                <li><a href="#" className="text-slate-500 hover:text-primary-600 transition-colors">Contact</a></li>
                <li><a href="#" className="text-slate-500 hover:text-primary-600 transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-200 text-center">
            <p className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} HANOUT. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;
