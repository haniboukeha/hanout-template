import { ShieldCheck, Truck, Heart, Award, Users, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-primary-100">
          Our Story
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
          Crafting Premium Experiences Since 2020
        </h1>
        <p className="mt-6 text-lg text-slate-600 leading-relaxed font-medium">
          HANOUT is more than a store — it's a curated journey through quality, minimalism, and timeless design. We bring together the finest products from around Algeria and beyond.
        </p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {[
          { icon: Award, title: 'Curated Quality', desc: 'Every product is handpicked for craftsmanship and durability. We partner only with brands that share our values.' },
          { icon: Users, title: 'Customer First', desc: 'Your satisfaction drives us. From 58 wilayas delivery to 30-day returns, we prioritize your experience.' },
          { icon: Globe, title: 'Algerian Roots', desc: 'Proudly Algerian, globally inspired. We support local artisans while bringing international excellence.' },
        ].map((v, i) => (
          <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-6">
              <v.icon size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900">{v.title}</h3>
            <p className="mt-3 text-slate-600 leading-relaxed text-sm">{v.desc}</p>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 text-white mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black leading-tight">Why thousands trust HANOUT</h2>
            <p className="mt-4 text-slate-400 leading-relaxed">We combine technology, logistics, and curation to deliver a seamless shopping experience across Algeria.</p>
            <div className="mt-8 space-y-4">
              {[
                { icon: Truck, title: '58 Wilayas Coverage', desc: 'From Algiers to Tamanrasset, desk or home delivery' },
                { icon: ShieldCheck, title: 'Secure & Protected', desc: 'SSL verified, secure payments, authentic products' },
                { icon: Heart, title: 'Wishlist & Favorites', desc: 'Save and revisit your desired items anytime' },
              ].map((f, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <f.icon size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{f.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop" alt="Our store" className="rounded-[2rem] h-[400px] w-full object-cover" />
            <div className="absolute -bottom-6 -left-6 bg-white text-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-100">
              <p className="text-3xl font-black">5,000+</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Happy Customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-900">Ready to discover?</h2>
        <p className="text-slate-500 mt-2">Explore our collection of premium essentials</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/shop" className="btn-primary px-10 py-4">
            Shop Now
          </Link>
          <Link to="/contact" className="btn-secondary px-10 py-4">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
