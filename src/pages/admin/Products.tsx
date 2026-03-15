import { useState, useRef } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, ExternalLink, Image as ImageIcon, Upload, X } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { formatCurrency, cn } from '../../utils';
import Modal from '../../components/common/Modal';
import type { Product } from '../../types';

const ProductsManagement = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    images: [] as string[],
    stock: 0,
    featured: false,
    sizes: '', // Temporary string for input
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProduct = {
      ...formData,
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s !== ''),
      images: formData.images.filter(img => img !== ''),
    };

    if (editingProduct) {
      updateProduct({ ...editingProduct, ...finalProduct });
    } else {
      addProduct({ ...finalProduct, rating: 5, reviewsCount: 0, createdAt: new Date().toISOString() } as any);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Products</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your storefront inventory and catalogs</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn-primary flex items-center gap-2 px-6 py-3 shadow-primary-900/20">
          <Plus size={20} /> Add Product
        </button>
      </div>

      <div className="card bg-white shadow-xl shadow-slate-200/50">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium transition-all"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="btn-secondary py-3 px-6 text-sm flex items-center gap-2 font-bold text-slate-700">
              <Filter size={18} /> Advanced
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest text-slate-400 font-extrabold border-b border-slate-50">
                <th className="px-8 py-5">Product Info</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Price</th>
                <th className="px-8 py-5">Inventory</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm">
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{product.name}</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-slate-400 truncate max-w-[200px] block">{product.description}</span>
                          {product.sizes && product.sizes.length > 0 && (
                            <div className="flex gap-1">
                              {product.sizes.map(s => (
                                <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded uppercase">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-900">{formatCurrency(product.price)}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-grow w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            product.stock > 10 ? "bg-emerald-500" : product.stock > 0 ? "bg-amber-500" : "bg-red-500"
                          )} 
                          style={{ width: `${Math.min(product.stock * 5, 100)}%` }}
                        ></div>
                      </div>
                      <span className={cn(
                        "text-xs font-bold",
                        product.stock > 10 ? "text-slate-500" : product.stock > 0 ? "text-amber-600" : "text-red-500"
                      )}>
                        {product.stock}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => handleOpenEditModal(product)}
                        className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteProduct(product.id)}
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Product Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ex: Minimalist Desk Lamp"
              />
            </div>
            
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none"
                placeholder="Product details..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Price (DA)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Stock</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option>Apparel</option>
                <option>Electronics</option>
                <option>Accessories</option>
                <option>Furniture</option>
                <option>Lifestyle</option>
              </select>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Sizes <span className="text-slate-400 font-medium">(Taille / Pointure - comma separated)</span>
              </label>
              <input
                type="text"
                value={formData.sizes}
                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ex: S, M, L, XL or 40, 41, 42"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Featured</label>
              <div className="flex items-center h-12">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                />
                <span className="ml-3 text-sm text-slate-600 font-medium">Show on Home Page</span>
              </div>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-4">Product Image</label>
              
              <div className="flex flex-col gap-4">
                {/* Image Preview / Dropzone */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative group cursor-pointer border-2 border-dashed rounded-[2rem] p-4 transition-all flex flex-col items-center justify-center min-h-[200px] overflow-hidden bg-slate-50",
                    formData.image ? "border-primary-200 bg-white" : "border-slate-200 hover:border-primary-400 hover:bg-slate-100"
                  )}
                >
                  {formData.image ? (
                    <>
                      <img src={formData.image} alt="Preview" className="w-full h-full max-h-[300px] object-contain rounded-2xl" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                        <div className="bg-white p-3 rounded-2xl text-slate-900 font-bold text-sm flex items-center gap-2">
                          <Upload size={16} /> Replace Image
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, image: '' });
                        }}
                        className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-white rounded-3xl border border-slate-100 flex items-center justify-center mx-auto text-primary-600 shadow-sm">
                        <Upload size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Upload Product Image</p>
                        <p className="text-xs text-slate-500 mt-1">Drag and drop or click to select a file</p>
                      </div>
                    </div>
                  )}
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-300">
                    <span className="bg-white px-3">or provide a URL</span>
                  </div>
                </div>

                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                {/* Additional Images */}
                <div className="mt-4 space-y-4">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Additional Gallery Photos</label>
                  {formData.images.map((imgUrl, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="relative flex-grow">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          value={imgUrl}
                          onChange={(e) => {
                            const newImages = [...formData.images];
                            newImages[idx] = e.target.value;
                            setFormData({ ...formData, images: newImages });
                          }}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                          placeholder="Gallery image URL..."
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const newImages = formData.images.filter((_, i) => i !== idx);
                          setFormData({ ...formData, images: newImages });
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, images: [...formData.images, ''] })}
                    className="w-full py-2 border border-dashed border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-primary-400 hover:text-primary-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Add Gallery Image
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-grow btn-secondary py-3 font-bold"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-grow btn-primary py-3 px-8 shadow-primary-900/20"
            >
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsManagement;
