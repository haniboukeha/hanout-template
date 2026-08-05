import { Link } from 'react-router-dom';
import { SearchX, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300 mb-8 border border-slate-100">
          <SearchX size={40} />
        </div>
        <h1 className="text-6xl font-black text-slate-900">404</h1>
        <h2 className="mt-4 text-2xl font-black text-slate-900">Page not found</h2>
        <p className="mt-3 text-slate-500 leading-relaxed">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary px-8 py-4 inline-flex items-center justify-center gap-2">
            <Home size={18} /> Back to Home
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary px-8 py-4 inline-flex items-center justify-center gap-2">
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>

        <div className="mt-16 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 text-left">
          <h3 className="font-black text-slate-900">Popular pages</h3>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <Link to="/shop" className="text-slate-600 hover:text-primary-600 font-medium">Shop</Link>
            <Link to="/cart" className="text-slate-600 hover:text-primary-600 font-medium">Cart</Link>
            <Link to="/about" className="text-slate-600 hover:text-primary-600 font-medium">About</Link>
            <Link to="/contact" className="text-slate-600 hover:text-primary-600 font-medium">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
