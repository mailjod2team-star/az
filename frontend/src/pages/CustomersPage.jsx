import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'salon_customers';

const INITIAL_CUSTOMERS = [
  {
    id: 'CUS001',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    email: 'nguyenvana@gmail.com',
    gender: 'male',
    birthday: '1990-05-15',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    notes: 'Khách VIP',
    totalVisits: 15,
    totalSpent: 3500000,
    status: 'active',
    createdAt: '2024-01-15'
  },
  {
    id: 'CUS002',
    name: 'Trần Thị B',
    phone: '0912345678',
    email: 'tranthib@gmail.com',
    gender: 'female',
    birthday: '1995-08-20',
    address: '456 Đường XYZ, Quận 3, TP.HCM',
    notes: '',
    totalVisits: 8,
    totalSpent: 2000000,
    status: 'active',
    createdAt: '2024-03-10'
  }
];

export const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'male',
    birthday: '',
    address: '',
    notes: '',
    status: 'active'
  });

  const loadCustomers = () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCustomers(JSON.parse(stored));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CUSTOMERS));
        setCustomers(INITIAL_CUSTOMERS);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers(INITIAL_CUSTOMERS);
    } finally {
      setLoading(false);
    }
  };

  const saveCustomers = (updatedCustomers) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCustomers));
      setCustomers(updatedCustomers);
    } catch (error) {
      console.error('Error saving customers:', error);
      alert('Có lỗi khi lưu dữ liệu!');
    }
  };

  const generateId = () => {
    const existingIds = customers.map(c => c.id);
    const numbers = existingIds
      .map(id => parseInt(id.replace('CUS', '')))
      .filter(num => !isNaN(num));
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `CUS${String(nextNum).padStart(3, '0')}`;
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      let updatedCustomers;
      
      if (editingCustomer) {
        updatedCustomers = customers.map(c => 
          c.id === editingCustomer.id 
            ? { ...c, ...formData }
            : c
        );
      } else {
        const newCustomer = {
          id: generateId(),
          ...formData,
          totalVisits: 0,
          totalSpent: 0,
          createdAt: new Date().toISOString().split('T')[0]
        };
        updatedCustomers = [...customers, newCustomer];
      }
      
      saveCustomers(updatedCustomers);
      closeModal();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Có lỗi xảy ra khi lưu khách hàng!');
    }
  };

  const handleDelete = (customerId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      return;
    }

    try {
      const updatedCustomers = customers.filter(c => c.id !== customerId);
      saveCustomers(updatedCustomers);
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Có lỗi xảy ra khi xóa khách hàng!');
    }
  };

  const openModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        gender: customer.gender,
        birthday: customer.birthday || '',
        address: customer.address || '',
        notes: customer.notes || '',
        status: customer.status
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        gender: 'male',
        birthday: '',
        address: '',
        notes: '',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý khách hàng</h1>
        <p className="text-gray-600 text-sm">Quản lý thông tin khách hàng của salon</p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="search-customers"
            />
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        <motion.button
          onClick={() => openModal()}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          data-testid="add-customer-button"
        >
          <i className="fa-solid fa-plus" />
          Thêm khách hàng
        </motion.button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-20">
          <i className="fa-solid fa-users text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500">Không tìm thấy khách hàng nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              data-testid={`customer-card-${customer.id}`}
            >
              <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 border-b border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-pink-200 flex items-center justify-center">
                    <i className={`fa-solid ${customer.gender === 'male' ? 'fa-mars' : 'fa-venus'} text-pink-700 text-xl`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-base">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    customer.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {customer.status === 'active' ? 'Hoạt động' : 'Ngưng'}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-2 mb-4">
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <i className="fa-solid fa-envelope text-blue-600 w-4" />
                      <span className="text-gray-600 truncate">{customer.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <i className="fa-solid fa-calendar-check text-purple-600 w-4" />
                    <span className="text-gray-600">Số lần:</span>
                    <span className="font-semibold text-gray-800">{customer.totalVisits || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="fa-solid fa-money-bill text-emerald-600 w-4" />
                    <span className="text-gray-600">Tổng chi:</span>
                    <span className="font-semibold text-emerald-700">{formatCurrency(customer.totalSpent || 0)}</span>
                  </div>
                </div>

                {customer.notes && (
                  <p className="text-sm text-gray-500 mb-4 p-2 bg-yellow-50 rounded border-l-2 border-yellow-400">
                    <i className="fa-solid fa-note-sticky text-yellow-600 mr-1" />
                    {customer.notes}
                  </p>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <motion.button
                    onClick={() => openModal(customer)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid={`edit-customer-${customer.id}`}
                  >
                    <i className="fa-solid fa-edit mr-1" />
                    Sửa
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(customer.id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid={`delete-customer-${customer.id}`}
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              data-testid="customer-modal"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50">
                <h2 className="text-base font-bold text-gray-800">
                  {editingCustomer ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  data-testid="close-modal"
                >
                  <i className="fa-solid fa-xmark text-gray-700 text-sm" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Họ tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Nhập họ tên"
                        data-testid="customer-name-input"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="0901234567"
                        data-testid="customer-phone-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="email@example.com"
                        data-testid="customer-email-input"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Giới tính
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="customer-gender-select"
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="customer-birthday-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Nhập địa chỉ"
                      data-testid="customer-address-input"
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
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                      placeholder="Ghi chú về khách hàng..."
                      data-testid="customer-notes-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="customer-status-select"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Ngưng hoạt động</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    data-testid="submit-customer"
                  >
                    {editingCustomer ? 'Cập nhật' : 'Thêm mới'}
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