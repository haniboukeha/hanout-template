import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, ChevronDown, Tag, X } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import { useProductStore } from '../../store/useProductStore';
import { cn } from '../../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../../hooks/useDebounce';
import Loading, { ProductCardSkeleton } from '../../components/common/Loading';

const priceRanges = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under 5,000 DA', min: 0, max: 5000 },
  { label: '5,000 DA - 10,000 DA', min: 5000, max: 10000 },
  { label: '10,000 DA - 30,000 DA', min: 10000, max: 30000 },
  { label: 'Over 30,000 DA', min: 30000, max: Infinity },
];

interface FilterContentProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  priceRange: string;
  setPriceRange: (range: string) => void;
  setIsMobileFiltersOpen: (isOpen: boolean) => void;
  productCounts: Record<string, number>;
}

const FilterContentComponent: React.FC<FilterContentProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  setIsMobileFiltersOpen,
  productCounts,
}) => (
  <div className="space-y-10">
    <div>
      <div className="flex items-center gap-2 text-slate-900 font-bold mb-6 text-lg">
        <SlidersHorizontal size={20} className="text-primary-600" />
        <span>Filters</span>
      </div>

      <div className="space-y-8">
        {/* Category Filter */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
            <Tag size={14} /> Category
          </h3>
          <div className="flex flex-wrap lg:flex-col gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setIsMobileFiltersOpen(false);
                }}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-left border flex items-center justify-between',
                  selectedCategory === category
                    ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-200'
                    : 'text-slate-600 bg-white border-slate-100 hover:border-primary-200 hover:text-primary-600'
                )}
              >
                <span>{category}</span>
                <span className={cn('text-[11px] px-2 py-0.5 rounded-lg font-black', selectedCategory === category ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500')}>
                  {productCounts[category] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Price Range</h3>
          <div className="flex flex-wrap gap-2">
            {priceRanges.map((range) => (
              <button
                key={range.label}
                onClick={() => {
                  setPriceRange(range.label);
                  setIsMobileFiltersOpen(false);
                }}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-bold transition-all border',
                  priceRange === range.label
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200'
                    : 'text-slate-500 bg-white border-slate-100 hover:border-slate-300'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stock Filter Info */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Need help?</p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">Filter by category and price to find exactly what you need. All prices in DZD.</p>
        </div>
      </div>
    </div>
  </div>
);

// Memoized to avoid re-renders and satisfy eslint static component rule
const FilterContent = FilterContentComponent;

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [priceRange, setPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const { products, categories, isLoading, fetchProducts } = useProductStore();
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const allCategories = useMemo(() => ['All', ...categories], [categories]);

  const productCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    categories.forEach((cat) => {
      counts[cat] = products.filter((p) => p.category === cat).length;
    });
    return counts;
  }, [products, categories]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (priceRange !== 'All') {
      const range = priceRanges.find((r) => r.label === priceRange);
      if (range) {
        result = result.filter((p) => p.price >= range.min && p.price <= range.max);
      }
    }

    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'Newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [debouncedSearch, selectedCategory, priceRange, sortBy, products]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">Collection</h1>
          <p className="mt-2 text-slate-500 font-medium">
            {isLoading ? 'Loading products...' : `Discover ${products.length} premium essentials`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-sm font-medium"
              aria-label="Search products"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex-grow flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              aria-label="Open filters"
            >
              <SlidersHorizontal size={18} />
              Filters
            </button>

            <div className="relative flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer shadow-sm text-slate-600 font-bold text-sm w-full sm:w-auto"
                aria-label="Sort products"
              >
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Filters */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-28">
            <FilterContent
              categories={allCategories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              setIsMobileFiltersOpen={setIsMobileFiltersOpen}
              productCounts={productCounts}
            />
          </div>
        </aside>

        {/* Mobile Filter Sheet */}
        <AnimatePresence>
          {isMobileFiltersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileFiltersOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] lg:hidden"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-x-0 bottom-0 max-h-[90vh] bg-white rounded-t-[2rem] z-[80] overflow-hidden flex flex-col lg:hidden"
              >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                  <h3 className="font-black text-slate-900 text-lg">Filter Collection</h3>
                  <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2.5 bg-slate-50 rounded-xl text-slate-500 hover:bg-slate-100">
                    <X size={20} />
                  </button>
                </div>
                <div className="overflow-y-auto flex-grow p-6">
                  <FilterContent
                    categories={allCategories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    setIsMobileFiltersOpen={setIsMobileFiltersOpen}
                    productCounts={productCounts}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Catalog / <span className="text-slate-900">{filteredProducts.length} Results</span>
              {debouncedSearch && ` for "${debouncedSearch}"`}
            </span>
            {(selectedCategory !== 'All' || priceRange !== 'All' || debouncedSearch) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setPriceRange('All');
                }}
                className="text-xs font-bold text-primary-600 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center px-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
                <Search size={28} />
              </div>
              <h2 className="text-xl font-black text-slate-900">No matches found</h2>
              <p className="mt-2 text-slate-500 max-w-xs font-medium text-sm">
                We couldn't find any products matching your current filters. Try adjusting them.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setPriceRange('All');
                }}
                className="mt-8 px-8 py-3 bg-white border border-slate-200 rounded-xl font-bold text-primary-600 hover:bg-slate-50 transition-all shadow-sm"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {filteredProducts.length > 0 && !isLoading && (
        <div className="mt-12 flex justify-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
      )}

      {isLoading && <Loading text="Fetching products..." />}
    </div>
  );
};

export default Shop;
