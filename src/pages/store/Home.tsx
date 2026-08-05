import { useEffect, useState } from 'react';
import { ArrowRight, Truck, ShieldCheck, Clock, Star, Package, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard';
import { useProductStore } from '../../store/useProductStore';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';

const Home = () => {
  const { products, fetchProducts, getFeaturedProducts } = useProductStore();
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const featuredProducts = getFeaturedProducts().slice(0, 6);
  const newArrivals = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  const categories = Array.from(new Set(products.map(p => p.category)));

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    addToast({ title: 'Subscribed!', message: `Thanks for joining, ${email}`, type: 'success' });
    setEmail('');
  };

  return (
    <div className="space-y-12 sm:space-y-20 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[600px] sm:min-h-[700px] flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop"
            alt="Premium collection"
            className="w-full h-full object-cover opacity-[0.07] mix-blend-multiply"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200 rounded-full blur-[100px] opacity-20" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200 rounded-full blur-[120px] opacity-20" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 text-primary-700 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                New Collection 2026 • 58 Wilayas Delivery
              </span>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-[0.9] tracking-tight">
                Elevate Your<br />
                <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  Daily Essentials.
                </span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed font-medium max-w-lg">
                Discover curated premium goods designed for modern lifestyle. Quality craftsmanship meets minimalist design, delivered across Algeria.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 text-xs">
                {categories.slice(0, 4).map(cat => (
                  <Link key={cat} to={`/shop?category=${encodeURIComponent(cat)}`} className="px-4 py-2 bg-white border border-slate-200 rounded-full font-bold text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-colors">
                    {cat}
                  </Link>
                ))}
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link to="/shop" className="btn-primary flex items-center justify-center gap-2 px-10 py-4 text-base shadow-xl shadow-primary-900/20">
                  Shop Collection <ArrowRight size={20} />
                </Link>
                <Link to="/about" className="btn-secondary flex items-center justify-center gap-2 px-10 py-4 text-base font-bold">
                  Our Story
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 pt-6 border-t border-slate-100">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/40?img=${i+10}`} alt="Customer" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-xs font-bold text-slate-600 mt-1">Trusted by 5,000+ customers</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-purple-600 rounded-[2.5rem] blur-2xl opacity-20 transform rotate-3" />
                <div className="relative bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-3 rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop" alt="Featured" className="rounded-[2rem] h-[500px] w-full object-cover" />
                  <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-xl rounded-2xl p-5 border border-white shadow-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Featured Drop</p>
                        <p className="font-black text-slate-900 mt-1">Premium Essentials Bundle</p>
                        <p className="text-sm text-slate-500">Starting from {formatCurrency(8500)}</p>
                      </div>
                      <button onClick={() => { const p = products[0]; if (p) { addItem(p); addToast({ message: 'Added to cart', type: 'success' }); } }} className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-slate-800">
                        <Package size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 bg-white rounded-2xl border border-slate-100 shadow-xl p-4 flex items-center gap-3 animate-bounce">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Free Shipping</p>
                    <p className="text-[11px] text-slate-500">Over 20,000 DA</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Truck, title: '58 Wilayas', desc: 'Desk & home delivery nationwide', color: 'bg-blue-50 text-blue-600 border-blue-100' },
            { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure checkout SSL', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            { icon: Clock, title: 'Fast Delivery', desc: 'Shipped within 24h', color: 'bg-purple-50 text-purple-600 border-purple-100' },
            { icon: Heart, title: 'Wishlist', desc: 'Save your favorites', color: 'bg-red-50 text-red-500 border-red-100' },
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${feature.color}`}>
                <feature.icon size={22} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">{feature.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-tight">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Shop by Category</h2>
            <Link to="/shop" className="text-sm font-bold text-slate-500 hover:text-slate-900 hidden sm:block">View all →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(cat => {
              const count = products.filter(p => p.category === cat).length;
              const sample = products.find(p => p.category === cat);
              return (
                <Link key={cat} to={`/shop?category=${encodeURIComponent(cat)}`} className="group relative rounded-[1.5rem] overflow-hidden aspect-[4/5] bg-slate-50 border border-slate-100 hover:shadow-xl transition-all">
                  <img src={sample?.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400&auto=format&fit=crop'} alt={cat} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-0 p-5 text-white">
                    <p className="font-black text-lg">{cat}</p>
                    <p className="text-xs text-white/70">{count} products</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">Staff Picks</h2>
            <p className="mt-2 text-slate-500">Handpicked items our customers love</p>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-900 bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl hover:bg-slate-900 hover:text-white transition-colors">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-slate-900 mb-6">New Arrivals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-[2rem] p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">Join the Community</h2>
              <p className="mt-4 text-slate-400 leading-relaxed">Subscribe and get 10% off your first order plus early access to drops. No spam, unsubscribe anytime.</p>
              <div className="mt-6 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><ShieldCheck size={14} /> No spam</span>
                <span className="flex items-center gap-1"><Clock size={14} /> Weekly updates</span>
                <span className="flex items-center gap-1"><Heart size={14} /> 5k+ members</span>
              </div>
            </div>
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white/15 transition-all font-medium"
              />
              <button type="submit" className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-slate-100 transition-colors shadow-xl whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
