import React, { useState, useEffect, useMemo } from 'react';
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
    createdAt: '2024-01-15',
    membershipLevel: 'vip'
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
    createdAt: '2024-03-10',
    membershipLevel: 'regular'
  }
];

const MEMBERSHIP_LEVELS = {
  new: { label: 'Mới', color: 'gray', icon: 'fa-user-plus' },
  regular: { label: 'Thường', color: 'blue', icon: 'fa-user' },
  vip: { label: 'VIP', color: 'purple', icon: 'fa-crown' },
  platinum: { label: 'Platinum', color: 'yellow', icon: 'fa-star' }
};

export const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [filterMembership, setFilterMembership] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // name, totalSpent, totalVisits, createdAt
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'male',
    birthday: '',
    address: '',
    notes: '',
    status: 'active',
    membershipLevel: 'new'
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
        status: customer.status,
        membershipLevel: customer.membershipLevel || 'new'
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
        status: 'active',
        membershipLevel: 'new'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const openDetailModal = (customer) => {
    setViewingCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setViewingCustomer(null);
  };

  // Statistics
  const stats = useMemo(() => {
    return {
      total: customers.length,
      active: customers.filter(c => c.status === 'active').length,
      inactive: customers.filter(c => c.status === 'inactive').length,
      vip: customers.filter(c => c.membershipLevel === 'vip' || c.membershipLevel === 'platinum').length,
      totalRevenue: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
      avgSpent: customers.length > 0 ? customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / customers.length : 0
    };
  }, [customers]);

  // Filtered and sorted customers
  const filteredCustomers = useMemo(() => {
    let filtered = customers.filter(customer => {
      const matchSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchStatus = filterStatus === 'all' || customer.status === filterStatus;
      const matchGender = filterGender === 'all' || customer.gender === filterGender;
      const matchMembership = filterMembership === 'all' || customer.membershipLevel === filterMembership;

      return matchSearch && matchStatus && matchGender && matchMembership;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'totalSpent':
          return (b.totalSpent || 0) - (a.totalSpent || 0);
        case 'totalVisits':
          return (b.totalVisits || 0) - (a.totalVisits || 0);
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    return filtered;
  }, [customers, searchTerm, filterStatus, filterGender, filterMembership, sortBy]);

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
            <h1 className="text-lg font-bold text-gray-800">Quản lý khách hàng</h1>
            <p className="text-xs text-gray-600">Quản lý thông tin khách hàng của salon</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-3 text-xs">
            <div className="text-center">
              <p className="font-bold text-emerald-600">{stats.active}</p>
              <p className="text-gray-500">Hoạt động</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-purple-600">{stats.vip}</p>
              <p className="text-gray-500">VIP</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-gray-500">Tổng doanh thu</p>
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
              <i className="fa-solid fa-th mr-1" />
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

          {/* Filters */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="filter-status"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngưng hoạt động</option>
          </select>

          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="filter-gender"
          >
            <option value="all">Tất cả giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>

          <select
            value={filterMembership}
            onChange={(e) => setFilterMembership(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="filter-membership"
          >
            <option value="all">Tất cả hạng</option>
            <option value="new">Mới</option>
            <option value="regular">Thường</option>
            <option value="vip">VIP</option>
            <option value="platinum">Platinum</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="sort-by"
          >
            <option value="name">Sắp xếp: Tên</option>
            <option value="totalSpent">Sắp xếp: Chi tiêu</option>
            <option value="totalVisits">Sắp xếp: Số lần</option>
            <option value="createdAt">Sắp xếp: Mới nhất</option>
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, SĐT, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="search-customers"
            />
            <i className="fa-solid fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          </div>
          
          {/* Add Button */}
          <motion.button
            onClick={() => openModal()}
            className="ml-auto px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium text-xs flex items-center gap-1.5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="add-customer-button"
          >
            <i className="fa-solid fa-plus" />
            Thêm khách hàng
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-20">
            <i className="fa-solid fa-users text-5xl text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">Không tìm thấy khách hàng nào</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {filteredCustomers.map((customer) => {
              const membershipInfo = MEMBERSHIP_LEVELS[customer.membershipLevel || 'new'];
              return (
                <motion.div
                  key={customer.id}
                  className="bg-white rounded border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-testid={`customer-card-${customer.id}`}
                >
                  <div className="p-2 bg-gradient-to-br from-pink-50 to-rose-50 border-b border-gray-200">
                    <div className="flex items-start gap-2">
                      <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center shrink-0">
                        <i className={`fa-solid ${customer.gender === 'male' ? 'fa-mars' : 'fa-venus'} text-pink-700 text-sm`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-xs truncate">{customer.name}</h3>
                        <p className="text-[10px] text-gray-600 truncate">{customer.phone}</p>
                      </div>
                      <div className="flex flex-col gap-0.5 items-end shrink-0">
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                          customer.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {customer.status === 'active' ? 'Hoạt động' : 'Ngưng'}
                        </span>
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded bg-${membershipInfo.color}-100 text-${membershipInfo.color}-700`}>
                          <i className={`fa-solid ${membershipInfo.icon} mr-0.5`} />
                          {membershipInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <div className="space-y-1 mb-2">
                      {customer.email && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <i className="fa-solid fa-envelope text-blue-600 w-3 text-[10px]" />
                          <span className="text-gray-600 truncate text-[10px]">{customer.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs">
                        <i className="fa-solid fa-calendar-check text-purple-600 w-3 text-[10px]" />
                        <span className="text-gray-600 text-[10px]">Số lần:</span>
                        <span className="font-semibold text-gray-800 text-[10px]">{customer.totalVisits || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <i className="fa-solid fa-money-bill text-emerald-600 w-3 text-[10px]" />
                        <span className="text-gray-600 text-[10px]">Tổng chi:</span>
                        <span className="font-semibold text-emerald-700 text-[10px]">{formatCurrency(customer.totalSpent || 0)}</span>
                      </div>
                    </div>

                    {customer.notes && (
                      <p className="text-[10px] text-gray-500 mb-2 p-1.5 bg-yellow-50 rounded border-l-2 border-yellow-400 line-clamp-2">
                        <i className="fa-solid fa-note-sticky text-yellow-600 mr-0.5" />
                        {customer.notes}
                      </p>
                    )}

                    <div className="flex gap-1 pt-2 border-t border-gray-100">
                      <motion.button
                        onClick={() => openDetailModal(customer)}
                        className="flex-1 px-2 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors text-[10px] font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        data-testid={`view-customer-${customer.id}`}
                      >
                        <i className="fa-solid fa-eye mr-0.5" />
                        Xem
                      </motion.button>
                      <motion.button
                        onClick={() => openModal(customer)}
                        className="flex-1 px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-[10px] font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        data-testid={`edit-customer-${customer.id}`}
                      >
                        <i className="fa-solid fa-edit mr-0.5" />
                        Sửa
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(customer.id)}
                        className="flex-1 px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-[10px] font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        data-testid={`delete-customer-${customer.id}`}
                      >
                        <i className="fa-solid fa-trash mr-0.5" />
                        Xóa
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCustomers.map((customer) => {
              const membershipInfo = MEMBERSHIP_LEVELS[customer.membershipLevel || 'new'];
              return (
                <motion.div
                  key={customer.id}
                  className="bg-white rounded border border-gray-200 p-2 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  data-testid={`customer-list-${customer.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center shrink-0">
                      <i className={`fa-solid ${customer.gender === 'male' ? 'fa-mars' : 'fa-venus'} text-pink-700 text-sm`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-gray-800 text-xs">{customer.name}</h3>
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded bg-${membershipInfo.color}-100 text-${membershipInfo.color}-700`}>
                          <i className={`fa-solid ${membershipInfo.icon} mr-0.5`} />
                          {membershipInfo.label}
                        </span>
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                          customer.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {customer.status === 'active' ? 'Hoạt động' : 'Ngưng'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-600">
                        <span><i className="fa-solid fa-phone mr-1" />{customer.phone}</span>
                        {customer.email && <span><i className="fa-solid fa-envelope mr-1" />{customer.email}</span>}
                        <span><i className="fa-solid fa-calendar-check mr-1" />{customer.totalVisits || 0} lần</span>
                        <span className="text-emerald-700 font-semibold"><i className="fa-solid fa-money-bill mr-1" />{formatCurrency(customer.totalSpent || 0)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => openDetailModal(customer)}
                        className="px-2 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors text-[10px] font-medium"
                      >
                        <i className="fa-solid fa-eye mr-0.5" />
                        Xem
                      </button>
                      <button
                        onClick={() => openModal(customer)}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-[10px] font-medium"
                      >
                        <i className="fa-solid fa-edit mr-0.5" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-[10px] font-medium"
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
              data-testid="customer-modal"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50 sticky top-0 z-10">
                <h2 className="text-base font-bold text-gray-800">
                  {editingCustomer ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}
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
                        Họ tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="0901234567"
                        data-testid="customer-phone-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="email@example.com"
                      data-testid="customer-email-input"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Giới tính
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="customer-gender-select"
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Hạng
                      </label>
                      <select
                        value={formData.membershipLevel}
                        onChange={(e) => setFormData({ ...formData, membershipLevel: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="customer-membership-select"
                      >
                        <option value="new">Mới</option>
                        <option value="regular">Thường</option>
                        <option value="vip">VIP</option>
                        <option value="platinum">Platinum</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Trạng thái
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="customer-status-select"
                      >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Ngưng</option>
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                      placeholder="Ghi chú về khách hàng..."
                      data-testid="customer-notes-input"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full px-3 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium"
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

      {/* Detail Modal - Compact */}
      <AnimatePresence>
        {isDetailModalOpen && viewingCustomer && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetailModal}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              data-testid="customer-detail-modal"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 sticky top-0 z-10">
                <h2 className="text-base font-bold text-gray-800">Chi tiết khách hàng</h2>
                <button
                  onClick={closeDetailModal}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                  data-testid="close-detail-modal"
                >
                  <i className="fa-solid fa-xmark text-gray-700" />
                </button>
              </div>

              <div className="p-3">
                {/* Customer Info */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded p-3 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-full bg-pink-200 flex items-center justify-center">
                      <i className={`fa-solid ${viewingCustomer.gender === 'male' ? 'fa-mars' : 'fa-venus'} text-pink-700 text-2xl`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{viewingCustomer.name}</h3>
                      <div className="flex gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          viewingCustomer.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {viewingCustomer.status === 'active' ? 'Hoạt động' : 'Ngưng'}
                        </span>
                        {MEMBERSHIP_LEVELS[viewingCustomer.membershipLevel || 'new'] && (
                          <span className={`px-2 py-1 text-xs font-medium rounded bg-${MEMBERSHIP_LEVELS[viewingCustomer.membershipLevel || 'new'].color}-100 text-${MEMBERSHIP_LEVELS[viewingCustomer.membershipLevel || 'new'].color}-700`}>
                            <i className={`fa-solid ${MEMBERSHIP_LEVELS[viewingCustomer.membershipLevel || 'new'].icon} mr-1`} />
                            {MEMBERSHIP_LEVELS[viewingCustomer.membershipLevel || 'new'].label}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p><i className="fa-solid fa-phone mr-2 text-blue-600" />{viewingCustomer.phone}</p>
                        {viewingCustomer.email && <p><i className="fa-solid fa-envelope mr-2 text-blue-600" />{viewingCustomer.email}</p>}
                        {viewingCustomer.birthday && <p><i className="fa-solid fa-cake-candles mr-2 text-pink-600" />{new Date(viewingCustomer.birthday).toLocaleDateString('vi-VN')}</p>}
                        {viewingCustomer.address && <p><i className="fa-solid fa-location-dot mr-2 text-red-600" />{viewingCustomer.address}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-blue-50 rounded p-2 text-center">
                    <p className="text-xl font-bold text-blue-700">{viewingCustomer.totalVisits || 0}</p>
                    <p className="text-xs text-gray-600">Lần ghé thăm</p>
                  </div>
                  <div className="bg-emerald-50 rounded p-2 text-center">
                    <p className="text-sm font-bold text-emerald-700">{formatCurrency(viewingCustomer.totalSpent || 0)}</p>
                    <p className="text-xs text-gray-600">Tổng chi tiêu</p>
                  </div>
                  <div className="bg-purple-50 rounded p-2 text-center">
                    <p className="text-sm font-bold text-purple-700">{viewingCustomer.totalVisits > 0 ? formatCurrency((viewingCustomer.totalSpent || 0) / viewingCustomer.totalVisits) : '0₫'}</p>
                    <p className="text-xs text-gray-600">TB mỗi lần</p>
                  </div>
                </div>

                {/* Notes */}
                {viewingCustomer.notes && (
                  <div className="bg-yellow-50 rounded p-2 border-l-4 border-yellow-400 mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                      <i className="fa-solid fa-note-sticky mr-1 text-yellow-600" />
                      Ghi chú
                    </p>
                    <p className="text-xs text-gray-600">{viewingCustomer.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      closeDetailModal();
                      openModal(viewingCustomer);
                    }}
                    className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                  >
                    <i className="fa-solid fa-edit mr-1" />
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};