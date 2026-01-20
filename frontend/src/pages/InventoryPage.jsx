import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'salon_inventory';
const PRODUCTS_KEY = 'salon_products';

const TRANSACTION_TYPES = [
  { value: 'in', label: 'Nhập kho', icon: 'fa-arrow-down', color: 'green' },
  { value: 'out', label: 'Xuất kho', icon: 'fa-arrow-up', color: 'red' }
];

export const InventoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    productId: '',
    type: 'in',
    quantity: '',
    unitPrice: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const loadData = () => {
    try {
      setLoading(true);
      const storedTransactions = localStorage.getItem(STORAGE_KEY);
      const storedProducts = localStorage.getItem(PRODUCTS_KEY);

      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTransaction = (newTransaction) => {
    try {
      const updatedTransactions = [...transactions, newTransaction];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
      setTransactions(updatedTransactions);

      // Update product stock
      const product = products.find(p => p.id === newTransaction.productId);
      if (product) {
        const updatedProducts = products.map(p => {
          if (p.id === newTransaction.productId) {
            const stockChange = newTransaction.type === 'in' 
              ? parseInt(newTransaction.quantity) 
              : -parseInt(newTransaction.quantity);
            return { ...p, stock: p.stock + stockChange };
          }
          return p;
        });
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
        setProducts(updatedProducts);
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Có lỗi khi lưu dữ liệu!');
    }
  };

  const generateId = () => {
    return `INV${Date.now()}`;
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      const product = products.find(p => p.id === formData.productId);
      if (!product) {
        alert('Vui lòng chọn sản phẩm!');
        return;
      }

      const newTransaction = {
        id: generateId(),
        ...formData,
        productName: product.name,
        quantity: parseInt(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice || product.price),
        total: parseInt(formData.quantity) * parseFloat(formData.unitPrice || product.price),
        createdAt: new Date().toISOString()
      };
      
      saveTransaction(newTransaction);
      closeModal();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const openModal = () => {
    setFormData({
      productId: '',
      type: 'in',
      quantity: '',
      unitPrice: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = t.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Low stock products
  const lowStockProducts = products.filter(p => p.stock < 10);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý kho hàng</h1>
        <p className="text-gray-600 text-sm">Theo dõi nhập xuất kho sản phẩm</p>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <i className="fa-solid fa-exclamation-triangle text-red-600" />
            <h3 className="font-semibold text-red-800">Cảnh báo tồn kho thấp</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockProducts.map(p => (
              <span key={p.id} className="px-2 py-1 bg-white text-red-700 text-xs rounded border border-red-300">
                {p.name}: {p.stock} {p.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="search-inventory"
            />
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          data-testid="filter-type"
        >
          <option value="all">Tất cả</option>
          <option value="in">Nhập kho</option>
          <option value="out">Xuất kho</option>
        </select>
        
        <motion.button
          onClick={openModal}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          data-testid="add-transaction-button"
        >
          <i className="fa-solid fa-plus" />
          Thêm giao dịch
        </motion.button>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-20">
          <i className="fa-solid fa-warehouse text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500">Chưa có giao dịch nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ngày</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sản phẩm</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Loại</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Số lượng</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Đơn giá</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Tổng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => {
                const typeInfo = TRANSACTION_TYPES.find(t => t.value === transaction.type);
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50" data-testid={`transaction-${transaction.id}`}>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {new Date(transaction.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {transaction.productName}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 bg-${typeInfo.color}-100 text-${typeInfo.color}-700 text-xs rounded font-medium`}>
                        <i className={`fa-solid ${typeInfo.icon}`} />
                        {typeInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800">
                      {transaction.type === 'in' ? '+' : '-'}{transaction.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {formatCurrency(transaction.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-700">
                      {formatCurrency(transaction.total)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {transaction.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Transaction Modal */}
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
              className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              data-testid="inventory-modal"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
                <h2 className="text-lg font-bold text-gray-800">Thêm giao dịch kho</h2>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.productId}
                      onChange={(e) => {
                        const product = products.find(p => p.id === e.target.value);
                        setFormData({ 
                          ...formData, 
                          productId: e.target.value,
                          unitPrice: product?.price || ''
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="product-select"
                    >
                      <option value="">Chọn sản phẩm</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} (Tồn: {product.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại giao dịch <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="type-select"
                    >
                      {TRANSACTION_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số lượng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="10"
                        data-testid="quantity-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Đơn giá (VNĐ)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.unitPrice}
                        onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="100000"
                        data-testid="unitprice-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="date-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Ghi chú về giao dịch..."
                      data-testid="notes-input"
                    />
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
                    data-testid="submit-transaction"
                  >
                    Thêm mới
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