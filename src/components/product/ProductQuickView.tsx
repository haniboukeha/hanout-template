import { useState, useEffect } from 'react';
import { ShoppingCart, Star, CheckCircle2, ChevronLeft, ChevronRight, XCircle, Heart } from 'lucide-react';
import type { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useToastStore } from '../../store/useToastStore';
import { formatCurrency, cn } from '../../utils';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../common/Modal';
import { Link } from 'react-router-dom';

interface ProductQuickViewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductQuickView: React.FC<ProductQuickViewProps> = ({ product, isOpen, onClose }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addToast } = useToastStore();
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes?.[0]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [added, setAdded] = useState(false);

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const inWishlist = isInWishlist(product.id);

  useEffect(() => {
    if (isOpen) {
      setSelectedSize(product.sizes?.[0]);
      setActiveImageIndex(0);
      setAdded(false);
    }
  }, [isOpen, product]);

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      addToast({ message: 'Please select a size', type: 'warning' });
      return;
    }
    const res = addItem(product, selectedSize);
    if (!res.success) {
      addToast({ message: res.message || 'Failed to add', type: 'error' });
      return;
    }
    setAdded(true);
    addToast({ message: `${product.name} added to cart`, type: 'success' });
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      addToast({ message: 'Removed from wishlist', type: 'info' });
    } else {
      addToWishlist(product);
      addToast({ message: 'Added to wishlist', type: 'success' });
    }
  };

  const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Details" maxWidth="max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 pb-2">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-slate-50 border border-slate-100 group">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                src={images[activeImageIndex]}
                alt={product.name}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-slate-700 border border-slate-100 shadow-lg opacity-0 group-hover:opacity-100 hover:bg-white transition-all" aria-label="Previous image">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-slate-700 border border-slate-100 shadow-lg opacity-0 group-hover:opacity-100 hover:bg-white transition-all" aria-label="Next image">
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, idx) => (
                    <div key={idx} className={cn('h-1.5 rounded-full transition-all', idx === activeImageIndex ? 'w-6 bg-white shadow' : 'w-1.5 bg-white/50')} />
                  ))}
                </div>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={cn('w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all', activeImageIndex === idx ? 'border-slate-900 scale-95' : 'border-transparent hover:border-slate-200')}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{product.category}</span>
            <div className="flex items-center gap-1 text-amber-400 ml-auto">
              <Star size={14} fill="currentColor" />
              <span className="text-sm font-bold text-slate-900">{product.rating}</span>
              <span className="text-xs text-slate-400">({product.reviewsCount})</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{product.name}</h2>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-900">{formatCurrency(product.price)}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${product.stock > 5 ? 'bg-emerald-50 text-emerald-700' : product.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <p className="mt-6 text-sm text-slate-600 leading-relaxed">{product.description}</p>

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-8">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-3">Choose Size</h4>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn('min-w-[3rem] h-11 px-4 rounded-xl border-2 font-bold text-sm transition-all', selectedSize === size ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900')}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto pt-8 space-y-3">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || added}
                className={cn('flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]', product.stock <= 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : added ? 'bg-emerald-600 text-white shadow-emerald-900/20' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20')}
              >
                {product.stock <= 0 ? (
                  <>
                    <XCircle size={16} /> Sold Out
                  </>
                ) : added ? (
                  <>
                    <CheckCircle2 size={16} /> Added
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} /> Add to Cart
                  </>
                )}
              </button>
              <button onClick={handleWishlist} className={cn('w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all', inWishlist ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200')}>
                <Heart size={18} className={inWishlist ? 'fill-red-500' : ''} />
              </button>
            </div>

            <div className="flex gap-3">
              <Link to={`/product/${product.id}`} onClick={onClose} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-center hover:bg-slate-50 transition-colors">
                Full Details
              </Link>
              <span className="flex-1 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">SSL Secure • 30d Returns</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductQuickView;
