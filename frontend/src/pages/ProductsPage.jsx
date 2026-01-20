import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'salon_products';

const INITIAL_PRODUCTS = [
  {
    id: 'PR001',
    name: 'Dầu gội đầu',
    price: 150000,
    cost: 80000,
    stock: 50,
    unit: 'chai',
    category: 'dau-goi',
    barcode: '8934567890123',
    description: 'Dầu gội dưỡng tóc',
    status: 'active'
  },
  {
    id: 'PR002',
    name: 'Dầu xả',
    price: 120000,
    cost: 60000,
    stock: 40,
    unit: 'chai',
    category: 'dau-xa',
    barcode: '8934567890124',
    description: 'Dầu xả phục hồi',
    status: 'active'
  },
  {
    id: 'PR003',
    name: 'Sáp vuốt tóc',
    price: 200000,
    cost: 100000,
    stock: 30,
    unit: 'hộp',
    category: 'styling',
    barcode: '8934567890125',
    description: 'Sáp tạo kiểu chuyên nghiệp',
    status: 'active'
  }
];

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    cost: '',
    stock: '',
    unit: 'chai',
    category: 'dau-goi',
    barcode: '',
    description: '',
    status: 'active',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState('');

  const categories = [
    { value: 'dau-goi', label: 'Dầu gội' },
    { value: 'dau-xa', label: 'Dầu xả' },
    { value: 'styling', label: 'Tạo kiểu' },
    { value: 'nhuom', label: 'Thuốc nhuộm' },
    { value: 'uon', label: 'Thuốc uốn' },
    { value: 'cham-soc', label: 'Chăm sóc' },
    { value: 'khac', label: 'Khác' }
  ];

  const units = ['chai', 'hộp', 'tuýp', 'lọ', 'gói', 'cái'];

  const loadProducts = () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProducts(JSON.parse(stored));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
        setProducts(INITIAL_PRODUCTS);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const saveProducts = (updatedProducts) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error saving products:', error);
      alert('Có lỗi khi lưu dữ liệu!');
    }
  };

  const generateId = () => {
    const existingIds = products.map(p => p.id);
    const numbers = existingIds
      .map(id => parseInt(id.replace('PR', '')))
      .filter(num => !isNaN(num));
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `PR${String(nextNum).padStart(3, '0')}`;
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      let updatedProducts;
      
      if (editingProduct) {
        updatedProducts = products.map(p => 
          p.id === editingProduct.id 
            ? { 
                ...p, 
                ...formData, 
                price: parseFloat(formData.price), 
                cost: parseFloat(formData.cost),
                stock: parseInt(formData.stock),
                image: formData.image
              }
            : p
        );
      } else {
        const newProduct = {
          id: generateId(),
          ...formData,
          price: parseFloat(formData.price),
          cost: parseFloat(formData.cost),
          stock: parseInt(formData.stock),
          image: formData.image
        };
        updatedProducts = [...products, newProduct];
      }
      
      saveProducts(updatedProducts);
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Có lỗi xảy ra khi lưu sản phẩm!');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Kích thước ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 2MB.');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData({ ...formData, image: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: '' });
    setImagePreview('');
  };

  const handleDelete = (productId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }

    try {
      const updatedProducts = products.filter(p => p.id !== productId);
      saveProducts(updatedProducts);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Có lỗi xảy ra khi xóa sản phẩm!');
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        unit: product.unit,
        category: product.category,
        barcode: product.barcode || '',
        description: product.description || '',
        status: product.status,
        image: product.image || ''
      });
      setImagePreview(product.image || '');
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        cost: '',
        stock: '',
        unit: 'chai',
        category: 'dau-goi',
        barcode: '',
        description: '',
        status: 'active',
        image: ''
      });
      setImagePreview('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setImagePreview('');
  };

  const toggleStatus = (productId) => {
    try {
      const updatedProducts = products.map(p =>
        p.id === productId ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p
      );
      saveProducts(updatedProducts);
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const lowStock = products.filter(p => p.stock < 10).length;
    
    return {
      total: products.length,
      active: products.filter(p => p.status === 'active').length,
      inactive: products.filter(p => p.status === 'inactive').length,
      totalValue,
      lowStock,
      totalStock: products.reduce((sum, p) => sum + p.stock, 0)
    };
  }, [products]);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.includes(searchTerm);
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Compact */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Quản lý sản phẩm</h1>
            <p className="text-xs text-gray-600">Quản lý kho sản phẩm bán tại salon</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-3 text-xs">
            <div className="text-center">
              <p className="font-bold text-emerald-600">{stats.total}</p>
              <p className="text-gray-500">Tổng</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-blue-600">{stats.totalStock}</p>
              <p className="text-gray-500">Tồn kho</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-red-600">{stats.lowStock}</p>
              <p className="text-gray-500">Sắp hết</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions & Filters - Compact */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex gap-2 flex-wrap items-center">
          {/* View Mode */}
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              data-testid="grid-view"
            >
              <i className="fa-solid fa-grid mr-1" />
              Lưới
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              data-testid="list-view"
            >
              <i className="fa-solid fa-list mr-1" />
              Danh sách
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="category-filter"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="status-filter"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Còn hàng</option>
            <option value="inactive">Hết hàng</option>
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm sản phẩm, mã vạch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="search-products"
            />
            <i className="fa-solid fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          </div>
          
          {/* Add Button */}
          <motion.button
            onClick={() => openModal()}
            className="ml-auto px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium text-xs flex items-center gap-1.5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="add-product-button"
          >
            <i className="fa-solid fa-plus" />
            Thêm sản phẩm
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <i className="fa-solid fa-box-open text-5xl text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">Không tìm thấy sản phẩm nào</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                className="bg-white rounded border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                data-testid={`product-card-${product.id}`}
              >
                {/* Card Header */}
                <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-50 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-xs truncate">{product.name}</h3>
                      <p className="text-[10px] text-gray-600 truncate">
                        {categories.find(c => c.value === product.category)?.label}
                      </p>
                    </div>
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded shrink-0 ${
                      product.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {product.status === 'active' ? 'Còn hàng' : 'Hết'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-2">
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <i className="fa-solid fa-money-bill text-emerald-600 w-3 text-[10px]" />
                      <span className="text-gray-800 font-semibold truncate">{formatCurrency(product.price)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <i className="fa-solid fa-box text-blue-600 w-3 text-[10px]" />
                      <span className={`text-[10px] font-medium ${
                        product.stock < 10 ? 'text-red-600' : 'text-gray-600'
                      }`}>{product.stock} {product.unit}</span>
                    </div>
                    {product.barcode && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <i className="fa-solid fa-barcode text-purple-600 w-3 text-[10px]" />
                        <span className="text-gray-500 text-[10px] truncate">{product.barcode}</span>
                      </div>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-[10px] text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                  )}

                  <div className="flex gap-1 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => toggleStatus(product.id)}
                      className={`flex-1 px-2 py-1 rounded transition-colors text-[10px] font-medium ${
                        product.status === 'active'
                          ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                      data-testid={`toggle-status-${product.id}`}
                    >
                      <i className={`fa-solid ${product.status === 'active' ? 'fa-pause' : 'fa-play'} mr-0.5`} />
                      {product.status === 'active' ? 'Tắt' : 'Bật'}
                    </button>
                    <button
                      onClick={() => openModal(product)}
                      className="flex-1 px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-[10px] font-medium"
                      data-testid={`edit-product-${product.id}`}
                    >
                      <i className="fa-solid fa-edit mr-0.5" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-[10px]"
                      data-testid={`delete-product-${product.id}`}
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Tên sản phẩm</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Danh mục</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Giá bán</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Tồn kho</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Trạng thái</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <motion.tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    data-testid={`product-row-${product.id}`}
                  >
                    <td className="px-3 py-2">
                      <div className="text-xs font-semibold text-gray-800">{product.name}</div>
                      {product.description && (
                        <div className="text-[10px] text-gray-500 truncate max-w-xs">{product.description}</div>
                      )}
                      {product.barcode && (
                        <div className="text-[10px] text-gray-400">#{product.barcode}</div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded font-medium">
                        {categories.find(c => c.value === product.category)?.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs font-semibold text-emerald-700">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-xs font-medium ${product.stock < 10 ? 'text-red-600' : 'text-gray-600'}`}>
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                        product.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {product.status === 'active' ? 'Còn hàng' : 'Hết'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => toggleStatus(product.id)}
                          className={`p-1.5 rounded transition-colors ${
                            product.status === 'active'
                              ? 'text-yellow-600 hover:bg-yellow-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={product.status === 'active' ? 'Tắt' : 'Bật'}
                        >
                          <i className={`fa-solid ${product.status === 'active' ? 'fa-pause' : 'fa-play'} text-xs`} />
                        </button>
                        <button
                          onClick={() => openModal(product)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Sửa"
                        >
                          <i className="fa-solid fa-edit text-xs" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Xóa"
                        >
                          <i className="fa-solid fa-trash text-xs" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal - Compact */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              data-testid="product-modal"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-orange-50 sticky top-0 z-10">
                <h2 className="text-base font-bold text-gray-800">
                  {editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                  data-testid="close-modal"
                >
                  <i className="fa-solid fa-xmark text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-3">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tên sản phẩm <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Nhập tên sản phẩm"
                        data-testid="product-name-input"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Danh mục <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="product-category-select"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Giá bán (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="150000"
                        data-testid="product-price-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Giá nhập (VNĐ)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="80000"
                        data-testid="product-cost-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tồn kho <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="50"
                        data-testid="product-stock-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Đơn vị tính
                      </label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="product-unit-select"
                      >
                        {units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Mã vạch
                      </label>
                      <input
                        type="text"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="8934567890123"
                        data-testid="product-barcode-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="2"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                      placeholder="Mô tả chi tiết về sản phẩm..."
                      data-testid="product-description-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="product-status-select"
                    >
                      <option value="active">Còn hàng</option>
                      <option value="inactive">Hết hàng</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full px-3 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium"
                    data-testid="submit-product"
                  >
                    {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};