import { useState, useRef, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, ExternalLink, Image as ImageIcon, Upload, X, AlertCircle } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { formatCurrency, cn } from '../../utils';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import type { Product } from '../../types';
import { validateProduct } from '../../lib/validators';
import { useToastStore } from '../../store/useToastStore';

const ProductsManagement = () => {
  const { products, addProduct, updateProduct, deleteProduct, isLoading } = useProductStore();
  const { addToast } = useToastStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    images: [] as string[],
    stock: 0,
    featured: false,
    sizes: '',
  });

  const filteredProducts = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [products, searchTerm]);

  const lowStockCount = useMemo(() => products.filter((p) => p.stock < 10).length, [products]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'Apparel',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
      images: [],
      stock: 10,
      featured: false,
      sizes: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      images: product.images || [],
      stock: product.stock,
      featured: !!product.featured,
      sizes: product.sizes?.join(', ') || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast({ message: 'Image must be less than 5MB', type: 'error' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateProduct({
      name: formData.name,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      stock: formData.stock,
      image: formData.image,
    });

    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    const finalProduct = {
      ...formData,
      sizes: formData.sizes
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== ''),
      images: formData.images.filter((img) => img !== ''),
    };

    try {
      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...finalProduct });
        addToast({ message: 'Product updated', type: 'success' });
      } else {
        await addProduct({
          ...finalProduct,
          rating: 5,
          reviewsCount: 0,
          createdAt: new Date().toISOString(),
        } as Omit<Product, 'id'>);
        addToast({ message: 'Product created', type: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      addToast({ message: err instanceof Error ? err.message : 'Operation failed', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage inventory • {products.length} total • {lowStockCount} low stock
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn-primary flex items-center gap-2 px-6 py-3 self-start">
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <span className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl">
              {filteredProducts.length} results
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-100 shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate max-w-[200px]">{product.name}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{product.category} • {product.featured ? 'Featured' : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${Math.min(product.stock * 4, 100)}%` }} />
                      </div>
                      <span className={cn('text-xs font-bold', product.stock > 10 ? 'text-slate-500' : product.stock > 0 ? 'text-amber-600' : 'text-red-500')}>{product.stock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleOpenEditModal(product)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" aria-label={`Edit ${product.name}`}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setDeleteConfirm(product.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" aria-label={`Delete ${product.name}`}>
                        <Trash2 size={16} />
                      </button>
                      <a href={`/product/${product.id}`} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold">No products match</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {Object.keys(formErrors).length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2 text-xs text-red-700">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>Please fix validation errors below</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Product Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-sm ${formErrors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} placeholder="Minimalist Desk Lamp" />
              {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Description</label>
              <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none text-sm ${formErrors.description ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} placeholder="Product details..." />
              {formErrors.description && <p className="mt-1 text-xs text-red-500">{formErrors.description}</p>}
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Price (DA)</label>
              <input type="number" required min="0" step="1" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-sm ${formErrors.price ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} />
              {formErrors.price && <p className="mt-1 text-xs text-red-500">{formErrors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Stock</label>
              <input type="number" required min="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-sm" />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-bold ${formErrors.category ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
                <option>Apparel</option>
                <option>Electronics</option>
                <option>Accessories</option>
                <option>Furniture</option>
                <option>Lifestyle</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Sizes (comma separated)</label>
              <input type="text" value={formData.sizes} onChange={(e) => setFormData({ ...formData, sizes: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="S, M, L, XL" />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <input type="checkbox" id="featured" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
              <label htmlFor="featured" className="text-sm font-bold text-slate-700">Featured on homepage</label>
            </div>

            <div className="sm:col-span-2 space-y-4">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Product Image</label>
              <div onClick={() => fileInputRef.current?.click()} className={cn('relative group cursor-pointer border-2 border-dashed rounded-2xl p-4 min-h-[180px] flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors overflow-hidden', formData.image ? 'border-primary-200 bg-white' : 'border-slate-200')}>
                {formData.image ? (
                  <>
                    <img src={formData.image} alt="Preview" className="max-h-[200px] rounded-xl object-contain" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="bg-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"><Upload size={14} /> Change</span>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, image: '' }); }} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white rounded-xl border flex items-center justify-center mx-auto text-primary-600">
                      <Upload size={20} />
                    </div>
                    <p className="font-bold text-slate-900 mt-3 text-sm">Upload Image</p>
                    <p className="text-[11px] text-slate-500">Click or drag file (max 5MB)</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>

              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 ${formErrors.image ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} placeholder="Or paste image URL" />
              </div>
              {formErrors.image && <p className="text-xs text-red-500">{formErrors.image}</p>}

              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Gallery (optional)</p>
                {formData.images.map((url, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input type="text" value={url} onChange={(e) => { const arr = [...formData.images]; arr[idx] = e.target.value; setFormData({ ...formData, images: arr }); }} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" placeholder="Gallery URL" />
                    <button type="button" onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })} className="p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => setFormData({ ...formData, images: [...formData.images, ''] })} className="w-full py-2 border border-dashed border-slate-200 rounded-lg text-[11px] font-black uppercase tracking-widest text-slate-500 hover:border-primary-300 hover:text-primary-600">
                  + Add Gallery Image
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50">
              {isLoading ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            deleteProduct(deleteConfirm);
            addToast({ message: 'Product deleted', type: 'success' });
          }
        }}
        title="Delete Product"
        message="Are you sure you want to delete this product? This cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default ProductsManagement;
