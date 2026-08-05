import { ShoppingCart, Star, Heart } from 'lucide-react';
import type { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useToastStore } from '../../store/useToastStore';
import { formatCurrency, cn } from '../../utils';
import { motion } from 'framer-motion';
import { useState } from 'react';
import ProductQuickView from './ProductQuickView';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addToast } = useToastStore();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.sizes && product.sizes.length > 0) {
      setIsQuickViewOpen(true);
      return;
    }
    const res = addItem(product);
    if (res.success) {
      addToast({ message: `${product.name} added to cart`, type: 'success' });
    } else {
      addToast({ message: res.message || 'Failed', type: 'error' });
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
      addToast({ message: 'Removed from wishlist', type: 'info' });
    } else {
      addToWishlist(product);
      addToast({ message: 'Added to wishlist', type: 'success' });
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 flex flex-col h-full"
      >
        <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-slate-50 flex-shrink-0 block">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={cn('h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105', product.stock <= 0 && 'grayscale opacity-60')}
          />

          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.featured && product.stock > 0 && (
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white rounded-full shadow-lg">
                Featured
              </span>
            )}
            {product.stock <= 0 && (
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-red-600 text-white rounded-full shadow-lg">
                Sold Out
              </span>
            )}
            {product.stock > 0 && product.stock < 5 && (
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white rounded-full shadow">Only {product.stock} left</span>
            )}
          </div>

          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            <button
              onClick={handleWishlist}
              className={cn('w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center transition-all shadow-sm', inWishlist ? 'bg-red-500 border-red-500 text-white' : 'bg-white/90 border-white/50 text-slate-500 hover:text-red-500 hover:bg-white')}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={16} className={inWishlist ? 'fill-white' : ''} />
            </button>
          </div>

          <div className="absolute inset-x-3 bottom-3 hidden lg:block opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={cn(
                'w-full flex items-center justify-center gap-2 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl text-sm font-bold shadow-xl border transition-all',
                product.stock <= 0 ? 'text-slate-400 border-slate-100 cursor-not-allowed' : 'text-slate-900 border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900'
              )}
            >
              <ShoppingCart size={16} />
              {product.stock <= 0 ? 'Out of Stock' : product.sizes && product.sizes.length > 0 ? 'Select Options' : 'Add to Cart'}
            </button>
          </div>
        </Link>

        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start gap-3 mb-1">
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">{product.category}</p>
              <Link to={`/product/${product.id}`} className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1 block mt-1 hover:underline">
                {product.name}
              </Link>
            </div>
            <span className="text-sm font-black text-slate-900 shrink-0">{formatCurrency(product.price)}</span>
          </div>

          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11} fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'} className={i < Math.floor(product.rating) ? 'text-amber-400' : 'text-slate-200'} />
              ))}
            </div>
            <span className="text-[10px] text-slate-400 font-bold">({product.reviewsCount})</span>
            {product.stock > 0 && <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">In Stock</span>}
          </div>

          <div className="mt-auto lg:hidden">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={cn('w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border', product.stock <= 0 ? 'bg-slate-50 text-slate-300 border-slate-100' : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 active:scale-[0.98]')}
            >
              <ShoppingCart size={14} />
              {product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </motion.div>

      <ProductQuickView product={product} isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} />
    </>
  );
};

export default ProductCard;
