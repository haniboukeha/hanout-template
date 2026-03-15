import { ShoppingCart, Star } from 'lucide-react';
import type { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { formatCurrency, cn } from '../../utils';
import { motion } from 'framer-motion';
import { useState } from 'react';
import ProductQuickView from './ProductQuickView';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If it has sizes, open quick view instead of direct add
    if (product.sizes && product.sizes.length > 0) {
      setIsQuickViewOpen(true);
    } else {
      addItem(product);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 flex flex-col h-full"
      >
        <div 
          onClick={() => setIsQuickViewOpen(true)}
          className="relative aspect-square overflow-hidden bg-slate-100 flex-shrink-0 cursor-pointer"
        >
          <img
            src={product.image}
            alt={product.name}
            className={cn(
              "h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110",
              product.stock <= 0 && "grayscale opacity-50"
            )}
          />
          
          {/* Desktop Add to Cart (Hover) */}
          <div className="absolute inset-x-0 bottom-0 p-4 hidden lg:block opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={cn(
                "w-full flex items-center justify-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl text-sm font-bold shadow-xl transition-all transform",
                product.stock <= 0 
                  ? "text-slate-400 cursor-not-allowed border border-slate-100" 
                  : "text-slate-900 hover:bg-primary-600 hover:text-white hover:translate-y-[-2px]"
              )}
            >
              <ShoppingCart size={18} />
              {product.stock <= 0 
                ? 'Out of Stock' 
                : (product.sizes && product.sizes.length > 0 ? 'Select Options' : 'Add to Cart')
              }
            </button>
          </div>

          {product.featured && product.stock > 0 && (
            <span className="absolute top-4 left-4 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-900/20">
              Featured
            </span>
          )}

          {product.stock <= 0 && (
            <span className="absolute top-4 left-4 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] bg-red-600 text-white rounded-xl shadow-lg shadow-red-900/40 z-10">
              Sold Out
            </span>
          )}
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start gap-4 mb-2">
            <div className="flex-grow">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">
                {product.category}
              </p>
              <h3 
                onClick={() => setIsQuickViewOpen(true)}
                className="text-base font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1 cursor-pointer"
              >
                {product.name}
              </h3>
            </div>
            <span className="text-base font-black text-slate-900 shrink-0">
              {formatCurrency(product.price)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={12} 
                  fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                  className={i < Math.floor(product.rating) ? "text-amber-400" : "text-slate-200"}
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
              ({product.reviewsCount})
            </span>
          </div>

          {/* Mobile Add to Cart (Always visible below) */}
          <div className="mt-auto lg:hidden pt-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all border",
                product.stock <= 0
                  ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                  : "bg-slate-50 active:bg-primary-600 active:text-white text-slate-700 border-slate-100"
              )}
            >
              <ShoppingCart size={18} />
              {product.stock <= 0 ? 'Out of Stock' : (product.sizes && product.sizes.length > 0 ? 'Select Options' : 'Add to Cart')}
            </button>
          </div>
        </div>
      </motion.div>

      <ProductQuickView 
        product={product} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </>
  );
};

export default ProductCard;
