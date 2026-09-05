import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Star, CheckCircle2, Truck, ShieldCheck, Package } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useToastStore } from '../../store/useToastStore';
import { formatCurrency, cn } from '../../utils';
import ProductCard from '../../components/product/ProductCard';
import Loading from '../../components/common/Loading';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, getProductById } = useProductStore();
  const { addItem } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addToast } = useToastStore();

  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const product = id ? getProductById(id) : undefined;

  // Reset per-product selection when navigating to a different product (render-time adjustment)
  const [prevProductId, setPrevProductId] = useState<string | undefined>(product?.id);
  if (product?.id !== prevProductId) {
    setPrevProductId(product?.id);
    setSelectedSize(product?.sizes?.[0]);
    setActiveImage(0);
    setQuantity(1);
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    // Try to find loading state - if product not found and we have products, show 404
    if (products.length > 0) {
      return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <h1 className="text-2xl font-black text-slate-900">Product not found</h1>
          <p className="text-slate-500 mt-2">The product you're looking for doesn't exist</p>
          <Link to="/shop" className="btn-primary mt-6 inline-flex px-8">
            Browse Shop
          </Link>
        </div>
      );
    }
    return <Loading text="Loading product..." />;
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const inWishlist = isInWishlist(product.id);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      addToast({ message: 'Please select a size', type: 'warning' });
      return;
    }
    for (let i = 0; i < quantity; i++) {
      const res = addItem(product, selectedSize);
      if (!res.success) {
        addToast({ message: res.message || 'Failed to add to cart', type: 'error' });
        return;
      }
    }
    addToast({ message: `${product.name} added to cart`, type: 'success', title: 'Added!' });
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      addToast({ message: 'Removed from wishlist', type: 'info' });
    } else {
      addToWishlist(product);
      addToast({ message: 'Added to wishlist', type: 'success' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 mb-8 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 relative group">
            <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            {product.featured && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg">
                Featured
              </span>
            )}
            {product.stock <= 0 && (
              <span className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">
                Sold Out
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    'w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all',
                    activeImage === idx ? 'border-slate-900 scale-95' : 'border-transparent hover:border-slate-200'
                  )}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 inline-block px-3 py-1 rounded-full border border-primary-100">
                {product.category}
              </p>
              <h1 className="mt-4 text-3xl sm:text-4xl font-black text-slate-900 leading-tight">{product.name}</h1>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={18} fill="currentColor" />
                  <span className="text-slate-900 font-bold">{product.rating}</span>
                </div>
                <span className="text-slate-400 text-sm">({product.reviewsCount} reviews)</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>
            <button
              onClick={handleWishlistToggle}
              className={cn(
                'w-12 h-12 rounded-2xl border flex items-center justify-center transition-all',
                inWishlist ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200'
              )}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={20} className={inWishlist ? 'fill-red-500' : ''} />
            </button>
          </div>

          <div className="mt-8">
            <span className="text-4xl font-black text-slate-900">{formatCurrency(product.price)}</span>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Description</h3>
            <p className="mt-3 text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Size</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'min-w-[3.5rem] h-12 px-5 rounded-xl border-2 font-bold text-sm transition-all',
                      selectedSize === size ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-black hover:bg-slate-50">-</button>
              <span className="w-12 text-center font-black">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-black hover:bg-slate-50">+</button>
            </div>
            <span className="text-xs text-slate-500 font-bold uppercase">{quantity * product.price} DA total</span>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={cn('flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-xl', product.stock <= 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 active:scale-[0.98]')}
            >
              <ShoppingCart size={20} />
              {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'Over 20,000 DA' },
              { icon: ShieldCheck, title: 'Secure Payment', desc: '100% protected' },
              { icon: Package, title: 'Easy Returns', desc: '30 days return' },
            ].map((f, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                  <f.icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-900">{f.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span>Guaranteed authentic products, verified quality</span>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-black text-slate-900 mb-8">You may also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
