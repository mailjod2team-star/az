import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'salon_inventory';
const PRODUCTS_KEY = 'salon_products';

const TRANSACTION_TYPES = [
  { value: 'in', label: 'Nhập kho', icon: 'fa-arrow-down', color: 'green', bgClass: 'bg-green-100', textClass: 'text-green-700' },
  { value: 'out', label: 'Xuất kho', icon: 'fa-arrow-up', color: 'red', bgClass: 'bg-red-100', textClass: 'text-red-700' },
  { value: 'adjust', label: 'Điều chỉnh', icon: 'fa-arrows-rotate', color: 'blue', bgClass: 'bg-blue-100', textClass: 'text-blue-700' }
];

export const InventoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // list or cards
  const [dateInput, setDateInput] = useState('');
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

  // Auto-format date input: 13032004 -> 13/03/2004
  const handleDateInput = (value) => {
    const digits = value.replace(/\D/g, '');
    let formatted = digits;

    if (digits.length >= 2) {
      formatted = digits.slice(0, 2);
      if (digits.length >= 4) {
        formatted += '/' + digits.slice(2, 4);
        if (digits.length >= 8) {
          formatted += '/' + digits.slice(4, 8);
        } else if (digits.length > 4) {
          formatted += '/' + digits.slice(4);
        }
      } else if (digits.length > 2) {
        formatted += '/' + digits.slice(2);
      }
    }

    setDateInput(formatted);

    if (digits.length === 8) {
      const day = digits.slice(0, 2);
      const month = digits.slice(2, 4);
      const year = digits.slice(4, 8);
      
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() == year && 
          date.getMonth() == month - 1 && 
          date.getDate() == day) {
        setFormData({ ...formData, date: `${year}-${month}-${day}` });
      }
    }
  };

  const saveTransaction = (newTransaction) => {
    try {
      let updatedTransactions;
      
      if (editingTransaction) {
        // Update existing transaction
        updatedTransactions = transactions.map(t => 
          t.id === editingTransaction.id ? newTransaction : t
        );
        
        // Revert old stock change
        const oldProduct = products.find(p => p.id === editingTransaction.productId);
        if (oldProduct) {
          const revertChange = editingTransaction.type === 'in' 
            ? -editingTransaction.quantity 
            : editingTransaction.quantity;
          
          const updatedProducts = products.map(p => {
            if (p.id === editingTransaction.productId) {
              return { ...p, stock: p.stock + revertChange };
            }
            return p;
          });
          
          // Apply new stock change
          const newProduct = updatedProducts.find(p => p.id === newTransaction.productId);
          if (newProduct) {
            const stockChange = newTransaction.type === 'in' 
              ? parseInt(newTransaction.quantity) 
              : -parseInt(newTransaction.quantity);
            
            const finalProducts = updatedProducts.map(p => {
              if (p.id === newTransaction.productId) {
                return { ...p, stock: p.stock + stockChange };
              }
              return p;
            });
            
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(finalProducts));
            setProducts(finalProducts);
          }
        }
      } else {
        // Add new transaction
        updatedTransactions = [...transactions, newTransaction];
        
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
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Có lỗi khi lưu dữ liệu!');
    }
  };

  const generateId = () => {
    const existingIds = transactions.map(t => t.id);
    const numbers = existingIds
      .map(id => parseInt(id.replace('INV', '')))
      .filter(num => !isNaN(num));
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `INV${String(nextNum).padStart(3, '0')}`;
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

      // Check if out quantity exceeds stock
      if (formData.type === 'out' && parseInt(formData.quantity) > product.stock) {
        alert(`Không đủ tồn kho! Tồn hiện tại: ${product.stock} ${product.unit}`);
        return;
      }

      const newTransaction = {
        id: editingTransaction ? editingTransaction.id : generateId(),
        ...formData,
        productName: product.name,
        productUnit: product.unit,
        quantity: parseInt(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice || product.price),
        total: parseInt(formData.quantity) * parseFloat(formData.unitPrice || product.price),
        createdAt: editingTransaction ? editingTransaction.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      saveTransaction(newTransaction);
      closeModal();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleDelete = (transactionId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      return;
    }

    try {
      const transaction = transactions.find(t => t.id === transactionId);
      if (transaction) {
        // Revert stock change
        const updatedProducts = products.map(p => {
          if (p.id === transaction.productId) {
            const revertChange = transaction.type === 'in' 
              ? -transaction.quantity 
              : transaction.quantity;
            return { ...p, stock: p.stock + revertChange };
          }
          return p;
        });
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
        setProducts(updatedProducts);
      }

      const updatedTransactions = transactions.filter(t => t.id !== transactionId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Có lỗi xảy ra khi xóa giao dịch!');
    }
  };

  const openModal = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      
      // Format date for display
      const dateParts = transaction.date.split('-');
      const displayDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
      setDateInput(displayDate);
      
      setFormData({
        productId: transaction.productId,
        type: transaction.type,
        quantity: transaction.quantity,
        unitPrice: transaction.unitPrice,
        notes: transaction.notes || '',
        date: transaction.date
      });
    } else {
      setEditingTransaction(null);
      
      const today = new Date();
      const displayDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
      setDateInput(displayDate);
      
      setFormData({
        productId: '',
        type: 'in',
        quantity: '',
        unitPrice: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const matchesSearch = t.productName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [transactions, searchTerm, filterType]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Statistics
  const stats = useMemo(() => {
    const totalIn = transactions.filter(t => t.type === 'in').reduce((sum, t) => sum + t.total, 0);
    const totalOut = transactions.filter(t => t.type === 'out').reduce((sum, t) => sum + t.total, 0);
    
    return {
      totalTransactions: transactions.length,
      totalIn,
      totalOut,
      lowStock: products.filter(p => p.stock < 10).length
    };
  }, [transactions, products]);

  // Low stock products
  const lowStockProducts = products.filter(p => p.stock < 10);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Compact */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Quản lý kho hàng</h1>
            <p className="text-xs text-gray-600">Theo dõi nhập xuất kho sản phẩm</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-3 text-xs">
            <div className="text-center">
              <p className="font-bold text-green-600">{stats.totalTransactions}</p>
              <p className="text-gray-500">Giao dịch</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-blue-600">{formatCurrency(stats.totalIn)}</p>
              <p className="text-gray-500">Nhập</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-red-600">{formatCurrency(stats.totalOut)}</p>
              <p className="text-gray-500">Xuất</p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert - Compact */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-3 py-2">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-exclamation-triangle text-red-600 text-xs" />
            <span className="font-semibold text-red-800 text-xs">Cảnh báo tồn kho thấp:</span>
            <div className="flex flex-wrap gap-1.5">
              {lowStockProducts.slice(0, 5).map(p => (
                <span key={p.id} className="px-1.5 py-0.5 bg-white text-red-700 text-[10px] rounded border border-red-300">
                  {p.name}: {p.stock} {p.unit}
                </span>
              ))}
              {lowStockProducts.length > 5 && (
                <span className="px-1.5 py-0.5 text-[10px] text-red-600">+{lowStockProducts.length - 5} nữa</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions & Filters - Compact */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex gap-2 flex-wrap items-center">
          {/* View Mode */}
          <div className="flex gap-1">
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
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              data-testid="cards-view"
            >
              <i className="fa-solid fa-grip mr-1" />
              Thẻ
            </button>
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="filter-type"
          >
            <option value="all">Tất cả loại</option>
            {TRANSACTION_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="search-inventory"
            />
            <i className="fa-solid fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          </div>
          
          {/* Add Button */}
          <motion.button
            onClick={() => openModal()}
            className="ml-auto px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium text-xs flex items-center gap-1.5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="add-transaction-button"
          >
            <i className="fa-solid fa-plus" />
            Thêm giao dịch
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-20">
            <i className="fa-solid fa-warehouse text-5xl text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">Chưa có giao dịch nào</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Ngày</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Sản phẩm</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Loại</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Số lượng</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Đơn giá</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Tổng</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Ghi chú</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => {
                  const typeInfo = TRANSACTION_TYPES.find(t => t.value === transaction.type);
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50" data-testid={`transaction-${transaction.id}`}>
                      <td className="px-3 py-2 text-xs text-gray-800">
                        {new Date(transaction.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-3 py-2 text-xs font-medium text-gray-800">
                        {transaction.productName}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 ${typeInfo.bgClass} ${typeInfo.textClass} text-[10px] rounded font-medium`}>
                          <i className={`fa-solid ${typeInfo.icon}`} />
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-right font-semibold text-gray-800">
                        {transaction.type === 'in' ? '+' : '-'}{transaction.quantity} {transaction.productUnit}
                      </td>
                      <td className="px-3 py-2 text-xs text-right text-gray-600">
                        {formatCurrency(transaction.unitPrice)}
                      </td>
                      <td className="px-3 py-2 text-xs text-right font-semibold text-emerald-700">
                        {formatCurrency(transaction.total)}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500 max-w-[150px] truncate">
                        {transaction.notes || '-'}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => openModal(transaction)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Sửa"
                            data-testid={`edit-transaction-${transaction.id}`}
                          >
                            <i className="fa-solid fa-edit text-xs" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Xóa"
                            data-testid={`delete-transaction-${transaction.id}`}
                          >
                            <i className="fa-solid fa-trash text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {filteredTransactions.map((transaction) => {
              const typeInfo = TRANSACTION_TYPES.find(t => t.value === transaction.type);
              return (
                <motion.div
                  key={transaction.id}
                  className="bg-white rounded border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-testid={`transaction-card-${transaction.id}`}
                >
                  <div className="p-2 bg-gradient-to-br from-slate-50 to-gray-50 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-xs truncate">{transaction.productName}</h3>
                        <p className="text-[10px] text-gray-600">{new Date(transaction.date).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <span className={`px-1.5 py-0.5 text-[10px] font-medium ${typeInfo.bgClass} ${typeInfo.textClass} rounded shrink-0`}>
                        {typeInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-2">
                    <div className="space-y-1 mb-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        <i className={`fa-solid ${typeInfo.icon} ${transaction.type === 'in' ? 'text-green-600' : 'text-red-600'} w-3 text-[10px]`} />
                        <span className="text-gray-800 font-semibold">
                          {transaction.type === 'in' ? '+' : '-'}{transaction.quantity} {transaction.productUnit}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <i className="fa-solid fa-money-bill text-emerald-600 w-3 text-[10px]" />
                        <span className="text-gray-600 text-[10px]">{formatCurrency(transaction.unitPrice)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <i className="fa-solid fa-calculator text-blue-600 w-3 text-[10px]" />
                        <span className="text-emerald-700 font-semibold text-[10px]">{formatCurrency(transaction.total)}</span>
                      </div>
                    </div>

                    {transaction.notes && (
                      <p className="text-[10px] text-gray-500 mb-2 p-1.5 bg-yellow-50 rounded border-l-2 border-yellow-400 line-clamp-2">
                        {transaction.notes}
                      </p>
                    )}

                    <div className="flex gap-1 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => openModal(transaction)}
                        className="flex-1 px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-[10px] font-medium"
                        data-testid={`edit-card-${transaction.id}`}
                      >
                        <i className="fa-solid fa-edit mr-0.5" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-[10px]"
                        data-testid={`delete-card-${transaction.id}`}
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction Modal - Compact */}
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
              data-testid="inventory-modal"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-emerald-50 sticky top-0 z-10">
                <h2 className="text-base font-bold text-gray-800">
                  {editingTransaction ? 'Cập nhật giao dịch' : 'Thêm giao dịch kho'}
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
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="product-select"
                    >
                      <option value="">Chọn sản phẩm</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} (Tồn: {product.stock} {product.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Loại giao dịch <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="type-select"
                    >
                      {TRANSACTION_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Số lượng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="10"
                        data-testid="quantity-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Đơn giá (VNĐ)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.unitPrice}
                        onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="100000"
                        data-testid="unitprice-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ngày <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={dateInput}
                      onChange={(e) => handleDateInput(e.target.value)}
                      placeholder="13/03/2004"
                      maxLength="10"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="date-input"
                    />
                    <p className="text-[10px] text-gray-500 mt-0.5">VD: 13032004</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows="2"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                      placeholder="Ghi chú về giao dịch..."
                      data-testid="notes-input"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full px-3 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium"
                    data-testid="submit-transaction"
                  >
                    {editingTransaction ? 'Cập nhật' : 'Thêm mới'}
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
