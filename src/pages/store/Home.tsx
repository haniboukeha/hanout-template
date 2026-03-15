import { ArrowRight, Truck, ShieldCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard';
import { useProductStore } from '../../store/useProductStore';
import { motion } from 'framer-motion';

const Home = () => {
  const { products } = useProductStore();
  const featuredProducts = products.filter((p) => p.featured).slice(0, 3);

  return (
    <div className="space-y-12 sm:space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[500px] sm:h-[650px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-20 transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-center sm:text-left mx-auto sm:mx-0"
          >
            <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              New Collection 2026
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1]">
              Elevate Your <br />
              <span className="text-primary-600">Daily Essentials.</span>
            </h1>
            <p className="mt-6 sm:mt-8 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-lg mx-auto sm:mx-0 font-medium">
              Discover a curated collection of premium goods designed for the modern lifestyle.
              Quality craftsmanship meets minimalist design.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
              <Link to="/shop" className="btn-primary flex items-center justify-center gap-2 px-10 py-4 shadow-primary-900/10">
                Shop Collection <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On all orders over 10,000 DA' },
            { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure checkout' },
            { icon: Clock, title: 'Fast Delivery', desc: 'Shipped within 24 hours' },
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-8 sm:p-10 bg-white rounded-3xl border border-slate-100 shadow-sm transition-transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-6">
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 mb-12 sm:mb-16">
          <div className="text-center sm:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">Staff Picks</h2>
            <p className="mt-3 text-slate-500 text-lg">Handpicked items our customers love.</p>
          </div>
          <Link to="/shop" className="text-primary-600 font-bold flex items-center gap-1 group transition-all text-lg">
            See all products <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-[2.5rem] sm:rounded-[3rem] py-16 sm:py-20 px-6 sm:px-10 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-600/10 skew-x-12 transform translate-x-20"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-[1.2]">Join the Community</h2>
            <p className="mt-6 text-slate-400 text-base sm:text-lg font-medium">
              Subscribe to our newsletter and get 10% off your first order plus early access to new drops.
            </p>
            <form className="mt-10 sm:mt-12 flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full px-8 py-5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-primary-500/30 transition-all font-medium"
                />
              </div>
              <button className="bg-primary-600 text-white px-10 py-5 rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-900/40">
                Subscribe Now
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
