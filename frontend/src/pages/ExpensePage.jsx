import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'salon_expenses';

const EXPENSE_CATEGORIES = [
  { value: 'salary', label: 'Lương nhân viên', icon: 'fa-user-tie', color: 'blue' },
  { value: 'rent', label: 'Thuê mặt bằng', icon: 'fa-building', color: 'purple' },
  { value: 'utilities', label: 'Điện nước', icon: 'fa-bolt', color: 'yellow' },
  { value: 'supplies', label: 'Vật tư', icon: 'fa-boxes', color: 'orange' },
  { value: 'marketing', label: 'Marketing', icon: 'fa-bullhorn', color: 'pink' },
  { value: 'maintenance', label: 'Bảo trì', icon: 'fa-wrench', color: 'gray' },
  { value: 'other', label: 'Khác', icon: 'fa-circle-dot', color: 'slate' }
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Tiền mặt', icon: 'fa-money-bill' },
  { value: 'card', label: 'Thẻ', icon: 'fa-credit-card' },
  { value: 'transfer', label: 'Chuyển khoản', icon: 'fa-exchange-alt' }
];

export const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  const [formData, setFormData] = useState({
    category: 'salary',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    recipient: '',
    notes: ''
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setExpenses(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveExpenses = (updatedExpenses) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedExpenses));
      setExpenses(updatedExpenses);
    } catch (error) {
      console.error('Error saving expenses:', error);
      alert('Có lỗi khi lưu dữ liệu!');
    }
  };

  const generateId = () => {
    return `EXP${Date.now()}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      let updatedExpenses;
      
      if (editingExpense) {
        updatedExpenses = expenses.map(exp => 
          exp.id === editingExpense.id 
            ? { 
                ...exp, 
                ...formData,
                amount: parseFloat(formData.amount),
                updatedAt: new Date().toISOString()
              }
            : exp
        );
      } else {
        const newExpense = {
          id: generateId(),
          ...formData,
          amount: parseFloat(formData.amount),
          createdAt: new Date().toISOString()
        };
        updatedExpenses = [...expenses, newExpense];
      }
      
      saveExpenses(updatedExpenses);
      closeModal();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleDelete = (expenseId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chi phí này?')) {
      return;
    }

    try {
      const updatedExpenses = expenses.filter(e => e.id !== expenseId);
      saveExpenses(updatedExpenses);
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleDuplicate = (expense) => {
    try {
      const newExpense = {
        ...expense,
        id: generateId(),
        description: `${expense.description} (Copy)`,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      const updatedExpenses = [...expenses, newExpense];
      saveExpenses(updatedExpenses);
      alert('Đã sao chép chi phí thành công!');
    } catch (error) {
      console.error('Error duplicating expense:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const openModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        category: expense.category,
        amount: expense.amount,
        description: expense.description || '',
        date: expense.date,
        paymentMethod: expense.paymentMethod,
        recipient: expense.recipient || '',
        notes: expense.notes || ''
      });
    } else {
      setEditingExpense(null);
      setFormData({
        category: 'salary',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        recipient: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Statistics
  const stats = useMemo(() => {
    const monthExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));
    const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const categoryTotals = EXPENSE_CATEGORIES.map(cat => ({
      ...cat,
      total: monthExpenses.filter(e => e.category === cat.value).reduce((sum, e) => sum + e.amount, 0)
    })).sort((a, b) => b.total - a.total);

    return {
      total,
      count: monthExpenses.length,
      topCategory: categoryTotals[0],
      categories: categoryTotals.filter(c => c.total > 0)
    };
  }, [expenses, selectedMonth]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    let filtered = expenses.filter(e => e.date.startsWith(selectedMonth));

    if (filterCategory !== 'all') {
      filtered = filtered.filter(e => e.category === filterCategory);
    }

    if (filterPayment !== 'all') {
      filtered = filtered.filter(e => e.paymentMethod === filterPayment);
    }

    if (searchTerm) {
      filtered = filtered.filter(e =>
        (e.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.recipient || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, selectedMonth, filterCategory, filterPayment, searchTerm]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Compact */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Quản lý chi phí</h1>
            <p className="text-xs text-gray-600">Ghi chép và theo dõi các khoản chi tiêu</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-3 text-xs">
            <div className="text-center">
              <p className="font-bold text-red-600">{formatCurrency(stats.total)}</p>
              <p className="text-gray-500">Tổng chi</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-blue-600">{stats.count}</p>
              <p className="text-gray-500">Giao dịch</p>
            </div>
            {stats.topCategory && stats.topCategory.total > 0 && (
              <div className="text-center">
                <p className="font-bold text-purple-600">{stats.topCategory.label}</p>
                <p className="text-gray-500">Chi nhiều nhất</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions & Filters - Compact */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex gap-2 flex-wrap items-center">
          {/* Month Picker */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="month-picker"
          />

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="category-filter"
          >
            <option value="all">Tất cả danh mục</option>
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          {/* Payment Filter */}
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="payment-filter"
          >
            <option value="all">Tất cả thanh toán</option>
            {PAYMENT_METHODS.map(method => (
              <option key={method.value} value={method.value}>{method.label}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm mô tả, người nhận..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="search-expenses"
            />
            <i className="fa-solid fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          </div>
          
          {/* Add Button */}
          <motion.button
            onClick={() => openModal()}
            className="ml-auto px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium text-xs flex items-center gap-1.5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="add-expense-button"
          >
            <i className="fa-solid fa-plus" />
            Thêm chi phí
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-20">
            <i className="fa-solid fa-receipt text-5xl text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">Không tìm thấy chi phí nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {filteredExpenses.map((expense) => {
              const categoryInfo = EXPENSE_CATEGORIES.find(c => c.value === expense.category);
              const paymentInfo = PAYMENT_METHODS.find(p => p.value === expense.paymentMethod);

              return (
                <motion.div
                  key={expense.id}
                  className="bg-white rounded border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-testid={`expense-card-${expense.id}`}
                >
                  <div className="p-2 bg-gradient-to-br from-red-50 to-orange-50 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <i className={`fa-solid ${categoryInfo.icon} text-${categoryInfo.color}-600 text-xs`} />
                          <span className="text-xs font-semibold text-gray-800">{categoryInfo.label}</span>
                        </div>
                        <h3 className="font-bold text-red-600 text-sm">-{formatCurrency(expense.amount)}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <div className="mb-2 space-y-1 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <i className="fa-solid fa-calendar text-blue-600 w-3" />
                        <span className="text-gray-600">Ngày:</span>
                        <span className="font-medium text-gray-800">{new Date(expense.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <i className={`fa-solid ${paymentInfo.icon} text-green-600 w-3`} />
                        <span className="text-gray-600">Thanh toán:</span>
                        <span className="font-medium text-gray-800">{paymentInfo.label}</span>
                      </div>
                      {expense.recipient && (
                        <div className="flex items-center gap-1.5">
                          <i className="fa-solid fa-user text-purple-600 w-3" />
                          <span className="text-gray-600">Người nhận:</span>
                          <span className="font-medium text-gray-800 truncate">{expense.recipient}</span>
                        </div>
                      )}
                    </div>

                    {expense.description && (
                      <div className="mb-2 pb-2 border-b border-gray-100">
                        <p className="text-[10px] text-gray-600 line-clamp-2">{expense.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-1 mb-1">
                      <button
                        onClick={() => openModal(expense)}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-[10px] font-medium"
                        data-testid={`edit-${expense.id}`}
                      >
                        <i className="fa-solid fa-edit mr-0.5" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDuplicate(expense)}
                        className="px-2 py-1 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 transition-colors text-[10px] font-medium"
                        data-testid={`duplicate-${expense.id}`}
                      >
                        <i className="fa-solid fa-copy mr-0.5" />
                        Sao chép
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-[10px] font-medium"
                        data-testid={`delete-${expense.id}`}
                      >
                        <i className="fa-solid fa-trash mr-0.5" />
                        Xóa
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal - Compact */}
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
              data-testid="expense-modal"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50 sticky top-0 z-10">
                <h2 className="text-base font-bold text-gray-800">
                  {editingExpense ? 'Cập nhật chi phí' : 'Thêm chi phí mới'}
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
                        Danh mục <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="category-select"
                      >
                        {EXPENSE_CATEGORIES.map(category => (
                          <option key={category.value} value={category.value}>{category.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Số tiền (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="any"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="500000"
                        data-testid="amount-input"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Mô tả chi tiết về khoản chi..."
                      data-testid="description-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ngày <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="date-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Phương thức <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="paymentmethod-select"
                      >
                        {PAYMENT_METHODS.map(method => (
                          <option key={method.value} value={method.value}>{method.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Người nhận
                    </label>
                    <input
                      type="text"
                      value={formData.recipient}
                      onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Tên người nhận hoặc nhà cung cấp..."
                      data-testid="recipient-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows="2"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Ghi chú thêm..."
                      data-testid="notes-input"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full px-3 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium"
                    data-testid="submit-expense"
                  >
                    {editingExpense ? 'Cập nhật' : 'Thêm mới'}
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
