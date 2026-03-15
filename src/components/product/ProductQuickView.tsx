import { useState } from 'react';
import { ShoppingCart, Star, CheckCircle2, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import type { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { formatCurrency, cn } from '../../utils';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../common/Modal';

interface ProductQuickViewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductQuickView: React.FC<ProductQuickViewProps> = ({ product, isOpen, onClose }) => {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes?.[0]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [added, setAdded] = useState(false);

  const images = product.images || [product.image];

  const handleAddToCart = () => {
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Details" maxWidth="max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 pb-4">
        {/* Left: Image Gallery */}
        <div className="space-y-6">
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 group">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                src={images[activeImageIndex]}
                alt={product.name}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-md rounded-2xl text-slate-900 border border-white/20 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-md rounded-2xl text-slate-900 border border-white/20 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={cn(
                    "relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all",
                    activeImageIndex === idx ? "border-primary-600 scale-95" : "border-transparent hover:border-slate-200"
                  )}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="flex flex-col h-full">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-xl">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-amber-400 ml-auto">
                <Star size={14} fill="currentColor" />
                <span className="text-sm font-bold text-slate-900">{product.rating}</span>
                <span className="text-xs text-slate-400 font-medium tracking-tight">({product.reviewsCount} reviews)</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-4">{product.name}</h2>
            <div className="text-3xl font-black text-primary-600 mb-8">{formatCurrency(product.price)}</div>

            <div className="space-y-8">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Description</h4>
                <p className="text-slate-600 leading-relaxed font-medium">{product.description}</p>
              </div>

              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">
                    Choose Size <span className="text-slate-400">(Taille / Pointure)</span>
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "min-w-[3rem] h-12 px-4 flex items-center justify-center rounded-2xl font-bold text-sm transition-all border-2",
                          selectedSize === size
                            ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105"
                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-900"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || added}
              className={cn(
                "w-full flex items-center justify-center gap-3 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95",
                product.stock <= 0
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                  : added 
                    ? "bg-emerald-600 text-white shadow-emerald-900/40" 
                    : "bg-primary-600 hover:bg-primary-700 text-white shadow-primary-900/40"
              )}
            >
              {product.stock <= 0 ? (
                <>
                  <XCircle size={20} />
                  Sold Out
                </>
              ) : added ? (
                <>
                  <CheckCircle2 size={20} />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  Add to Cart
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest px-4">
              Secure checkout verified by <span className="text-primary-400">HANOUT SSL</span>
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductQuickView;
