import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

export const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: 'salary',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash'
  });

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

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      const newExpense = {
        id: generateId(),
        ...formData,
        amount: parseFloat(formData.amount),
        createdAt: new Date().toISOString()
      };
      
      const updatedExpenses = [...expenses, newExpense];
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

  const openModal = () => {
    setFormData({
      category: 'salary',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash'
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const filteredExpenses = expenses
    .filter(e => e.date.startsWith(selectedMonth))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const expensesByCategory = EXPENSE_CATEGORIES.map(category => {
    const categoryExpenses = filteredExpenses.filter(e => e.category === category.value);
    const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      ...category,
      count: categoryExpenses.length,
      total
    };
  }).filter(c => c.count > 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý chi phí</h1>
        <p className="text-gray-600 text-sm">Ghi chép và theo dõi các khoản chi tiêu</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-receipt text-red-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng chi</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-calendar text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tháng này</p>
              <p className="text-xl font-bold text-gray-800">{filteredExpenses.length}</p>
              <p className="text-xs text-gray-500">giao dịch</p>
            </div>
          </div>
        </div>

        {expensesByCategory.slice(0, 2).map((category) => (
          <div key={category.value} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-${category.color}-100 rounded-lg flex items-center justify-center`}>
                <i className={`fa-solid ${category.icon} text-${category.color}-600 text-xl`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{category.label}</p>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(category.total)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          data-testid="month-picker"
        />
        
        <motion.button
          onClick={openModal}
          className="ml-auto px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          data-testid="add-expense-button"
        >
          <i className="fa-solid fa-plus" />
          Thêm chi phí
        </motion.button>
      </div>

      {/* Category Breakdown */}
      {expensesByCategory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Phân loại chi phí</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {expensesByCategory.map((category) => (
              <div key={category.value} className={`p-3 bg-${category.color}-50 rounded-lg border border-${category.color}-200`}>
                <div className="flex items-center gap-2 mb-1">
                  <i className={`fa-solid ${category.icon} text-${category.color}-600`} />
                  <span className="text-sm font-medium text-gray-700">{category.label}</span>
                </div>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(category.total)}</p>
                <p className="text-xs text-gray-500">{category.count} giao dịch</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="text-center py-20">
          <i className="fa-solid fa-receipt text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500">Chưa có chi phí nào trong tháng này</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ngày</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Danh mục</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mô tả</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Số tiền</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Thanh toán</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExpenses.map((expense) => {
                const categoryInfo = EXPENSE_CATEGORIES.find(c => c.value === expense.category);
                return (
                  <tr key={expense.id} className="hover:bg-gray-50" data-testid={`expense-${expense.id}`}>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {new Date(expense.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 bg-${categoryInfo.color}-100 text-${categoryInfo.color}-700 text-xs rounded font-medium`}>
                        <i className={`fa-solid ${categoryInfo.icon}`} />
                        {categoryInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {expense.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                      -{formatCurrency(expense.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-gray-500">
                        {expense.paymentMethod === 'cash' ? 'Tiền mặt' : 'Thẻ'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        data-testid={`delete-expense-${expense.id}`}
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <motion.div
            className="bg-white rounded-lg shadow-2xl w-full max-w-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            data-testid="expense-modal"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
              <h2 className="text-lg font-bold text-gray-800">Thêm chi phí mới</h2>
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
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    data-testid="category-select"
                  >
                    {EXPENSE_CATEGORIES.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số tiền (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="500000"
                    data-testid="amount-input"
                  />
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
                    placeholder="Mô tả chi tiết về khoản chi..."
                    data-testid="description-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                      Phương thức
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="paymentmethod-select"
                    >
                      <option value="cash">Tiền mặt</option>
                      <option value="card">Thẻ</option>
                      <option value="transfer">Chuyển khoản</option>
                    </select>
                  </div>
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
                  data-testid="submit-expense"
                >
                  Thêm mới
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};