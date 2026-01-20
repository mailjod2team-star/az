import React, { useState, useEffect } from 'react';
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
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    cost: '',
    stock: '',
    unit: 'chai',
    category: 'dau-goi',
    barcode: '',
    description: '',
    status: 'active'
  });

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
                stock: parseInt(formData.stock)
              }
            : p
        );
      } else {
        const newProduct = {
          id: generateId(),
          ...formData,
          price: parseFloat(formData.price),
          cost: parseFloat(formData.cost),
          stock: parseInt(formData.stock)
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
        status: product.status
      });
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
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm)
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý sản phẩm</h1>
        <p className="text-gray-600 text-sm">Quản lý kho sản phẩm bán tại salon</p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm hoặc mã vạch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="search-products"
            />
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        <motion.button
          onClick={() => openModal()}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          data-testid="add-product-button"
        >
          <i className="fa-solid fa-plus" />
          Thêm sản phẩm
        </motion.button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <i className="fa-solid fa-box-open text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              data-testid={`product-card-${product.id}`}
            >
              <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-b border-gray-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-base mb-1">{product.name}</h3>
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded">
                      {categories.find(c => c.value === product.category)?.label || product.category}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    product.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {product.status === 'active' ? 'Còn hàng' : 'Hết'}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <i className="fa-solid fa-money-bill text-emerald-600 w-4" />
                    <span className="text-gray-600">Giá bán:</span>
                    <span className="font-semibold text-emerald-700">{formatCurrency(product.price)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="fa-solid fa-box text-blue-600 w-4" />
                    <span className="text-gray-600">Tồn kho:</span>
                    <span className={`font-semibold ${
                      product.stock < 10 ? 'text-red-600' : 'text-gray-800'
                    }`}>{product.stock} {product.unit}</span>
                  </div>
                  {product.barcode && (
                    <div className="flex items-center gap-2 text-sm">
                      <i className="fa-solid fa-barcode text-purple-600 w-4" />
                      <span className="text-gray-500 text-xs">{product.barcode}</span>
                    </div>
                  )}
                </div>

                {product.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <motion.button
                    onClick={() => openModal(product)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid={`edit-product-${product.id}`}
                  >
                    <i className="fa-solid fa-edit mr-1" />
                    Sửa
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid={`delete-product-${product.id}`}
                  >
                    <i className="fa-solid fa-trash mr-1" />
                    Xóa
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
              className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              data-testid="product-modal"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
                <h2 className="text-lg font-bold text-gray-800">
                  {editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                  data-testid="close-modal"
                >
                  <i className="fa-solid fa-xmark text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên sản phẩm <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Nhập tên sản phẩm"
                        data-testid="product-name-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Danh mục <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="product-category-select"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giá bán (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="150000"
                        data-testid="product-price-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giá nhập (VNĐ)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="80000"
                        data-testid="product-cost-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tồn kho <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="50"
                        data-testid="product-stock-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Đơn vị tính
                      </label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="product-unit-select"
                      >
                        {units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mã vạch
                      </label>
                      <input
                        type="text"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="8934567890123"
                        data-testid="product-barcode-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Mô tả chi tiết về sản phẩm..."
                      data-testid="product-description-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="product-status-select"
                    >
                      <option value="active">Còn hàng</option>
                      <option value="inactive">Hết hàng</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
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