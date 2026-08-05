import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import ProductCard from '../../components/product/ProductCard';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils';

const Wishlist = () => {
  const { items, removeFromWishlist, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();

  const handleAddAllToCart = () => {
    items.forEach((product) => addItem(product));
    addToast({ message: `Added ${items.length} items to cart`, type: 'success' });
  };

  const handleAddToCart = (productId: string) => {
    const product = items.find((p) => p.id === productId);
    if (product) {
      const result = addItem(product);
      if (result.success) {
        addToast({ message: `${product.name} added to cart`, type: 'success' });
      } else {
        addToast({ message: result.message || 'Failed to add to cart', type: 'error' });
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300 mb-8">
          <Heart size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900">Your wishlist is empty</h1>
        <p className="mt-3 text-slate-500 max-w-md mx-auto">Save items you love to your wishlist and they'll appear here</p>
        <Link to="/shop" className="btn-primary mt-8 inline-flex items-center gap-2 px-10 py-4">
          Explore Products <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 flex items-center gap-3">
            <Heart size={32} className="text-red-500 fill-red-500" />
            Wishlist ({items.length})
          </h1>
          <p className="text-slate-500 mt-2">Your favorite picks, ready for checkout</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => clearWishlist()} className="btn-secondary px-6 py-3 flex items-center gap-2 text-sm font-bold">
            <Trash2 size={16} /> Clear all
          </button>
          <button onClick={handleAddAllToCart} className="btn-primary px-8 py-3 flex items-center gap-2 text-sm font-bold">
            <ShoppingCart size={16} /> Add all to cart
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => (
          <div key={product.id} className="group relative">
            <ProductCard product={product} />
            <div className="absolute top-3 right-3 flex gap-2 z-10">
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="w-9 h-9 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                aria-label={`Remove ${product.name} from wishlist`}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <button
              onClick={() => handleAddToCart(product.id)}
              className="mt-3 w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
            >
              <ShoppingCart size={16} /> Add to Cart • {formatCurrency(product.price)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
