import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'salon_vouchers';
const VOUCHER_USAGE_KEY = 'salon_voucher_usage';
const TRANSACTIONS_KEY = 'salon_transactions';

const DISCOUNT_TYPES = [
  { value: 'percent', label: 'Phần trăm (%)', icon: 'fa-percent' },
  { value: 'fixed', label: 'Số tiền cố định (VNĐ)', icon: 'fa-money-bill' }
];

const APPLICABLE_TO = [
  { value: 'all', label: 'Tất cả' },
  { value: 'services', label: 'Chỉ dịch vụ' },
  { value: 'products', label: 'Chỉ sản phẩm' }
];

export const VoucherPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [voucherUsage, setVoucherUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percent',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    usagePerCustomer: '',
    applicableTo: 'all',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setVouchers(JSON.parse(stored));
      }
      
      const storedUsage = localStorage.getItem(VOUCHER_USAGE_KEY);
      if (storedUsage) {
        setVoucherUsage(JSON.parse(storedUsage));
      }
    } catch (error) {
      console.error('Error loading vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveVouchers = (updatedVouchers) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVouchers));
      setVouchers(updatedVouchers);
    } catch (error) {
      console.error('Error saving vouchers:', error);
      alert('Có lỗi khi lưu dữ liệu!');
    }
  };

  const saveVoucherUsage = (updatedUsage) => {
    try {
      localStorage.setItem(VOUCHER_USAGE_KEY, JSON.stringify(updatedUsage));
      setVoucherUsage(updatedUsage);
    } catch (error) {
      console.error('Error saving voucher usage:', error);
    }
  };

  const generateId = () => {
    return `VOU${Date.now()}`;
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Validate dates
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        alert('Ngày hết hạn phải sau ngày bắt đầu!');
        return;
      }

      let updatedVouchers;
      
      if (editingVoucher) {
        updatedVouchers = vouchers.map(v => 
          v.id === editingVoucher.id 
            ? { 
                ...v, 
                ...formData,
                discountValue: parseFloat(formData.discountValue),
                minPurchase: parseFloat(formData.minPurchase || 0),
                maxDiscount: parseFloat(formData.maxDiscount || 0),
                usageLimit: parseInt(formData.usageLimit || 0),
                usagePerCustomer: parseInt(formData.usagePerCustomer || 0),
                updatedAt: new Date().toISOString()
              }
            : v
        );
      } else {
        const newVoucher = {
          id: generateId(),
          ...formData,
          code: formData.code.trim() || generateCode(),
          discountValue: parseFloat(formData.discountValue),
          minPurchase: parseFloat(formData.minPurchase || 0),
          maxDiscount: parseFloat(formData.maxDiscount || 0),
          usageLimit: parseInt(formData.usageLimit || 0),
          usagePerCustomer: parseInt(formData.usagePerCustomer || 0),
          usageCount: 0,
          createdAt: new Date().toISOString()
        };
        updatedVouchers = [...vouchers, newVoucher];
      }
      
      saveVouchers(updatedVouchers);
      closeModal();
    } catch (error) {
      console.error('Error saving voucher:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleDelete = (voucherId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) {
      return;
    }

    try {
      const updatedVouchers = vouchers.filter(v => v.id !== voucherId);
      saveVouchers(updatedVouchers);
      
      // Also remove usage records
      const updatedUsage = voucherUsage.filter(u => u.voucherId !== voucherId);
      saveVoucherUsage(updatedUsage);
    } catch (error) {
      console.error('Error deleting voucher:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleToggleStatus = (voucher) => {
    try {
      const newStatus = voucher.status === 'active' ? 'inactive' : 'active';
      const updatedVouchers = vouchers.map(v => 
        v.id === voucher.id 
          ? { ...v, status: newStatus }
          : v
      );
      saveVouchers(updatedVouchers);
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleDuplicate = (voucher) => {
    try {
      const newVoucher = {
        ...voucher,
        id: generateId(),
        code: generateCode(),
        name: `${voucher.name} (Copy)`,
        usageCount: 0,
        createdAt: new Date().toISOString()
      };
      const updatedVouchers = [...vouchers, newVoucher];
      saveVouchers(updatedVouchers);
      alert('Đã sao chép voucher thành công!');
    } catch (error) {
      console.error('Error duplicating voucher:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const openModal = (voucher = null) => {
    if (voucher) {
      setEditingVoucher(voucher);
      setFormData({
        code: voucher.code,
        name: voucher.name,
        description: voucher.description || '',
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        minPurchase: voucher.minPurchase || '',
        maxDiscount: voucher.maxDiscount || '',
        usageLimit: voucher.usageLimit || '',
        usagePerCustomer: voucher.usagePerCustomer || '',
        applicableTo: voucher.applicableTo || 'all',
        startDate: voucher.startDate,
        endDate: voucher.endDate,
        status: voucher.status
      });
    } else {
      setEditingVoucher(null);
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      setFormData({
        code: '',
        name: '',
        description: '',
        discountType: 'percent',
        discountValue: '',
        minPurchase: '',
        maxDiscount: '',
        usageLimit: '',
        usagePerCustomer: '',
        applicableTo: 'all',
        startDate: new Date().toISOString().split('T')[0],
        endDate: oneMonthLater.toISOString().split('T')[0],
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVoucher(null);
  };

  const openUsageModal = (voucher) => {
    setSelectedVoucher(voucher);
    setIsUsageModalOpen(true);
  };

  const closeUsageModal = () => {
    setIsUsageModalOpen(false);
    setSelectedVoucher(null);
  };

  const openHistoryModal = (voucher) => {
    setSelectedVoucher(voucher);
    setIsHistoryModalOpen(true);
  };

  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedVoucher(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const isVoucherExpired = (voucher) => {
    return new Date(voucher.endDate) < new Date();
  };

  const isVoucherMaxedOut = (voucher) => {
    return voucher.usageLimit > 0 && voucher.usageCount >= voucher.usageLimit;
  };

  const isVoucherNotStarted = (voucher) => {
    return new Date(voucher.startDate) > new Date();
  };

  const getVoucherStatusInfo = (voucher) => {
    if (isVoucherExpired(voucher)) {
      return { label: 'Hết hạn', color: 'bg-gray-100 text-gray-700' };
    }
    if (isVoucherMaxedOut(voucher)) {
      return { label: 'Hết lượt', color: 'bg-red-100 text-red-700' };
    }
    if (isVoucherNotStarted(voucher)) {
      return { label: 'Chưa bắt đầu', color: 'bg-blue-100 text-blue-700' };
    }
    if (voucher.status === 'inactive') {
      return { label: 'Tạm ngưng', color: 'bg-orange-100 text-orange-700' };
    }
    return { label: 'Hoạt động', color: 'bg-green-100 text-green-700' };
  };

  // Statistics
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: vouchers.length,
      active: vouchers.filter(v => v.status === 'active' && !isVoucherExpired(v) && !isVoucherMaxedOut(v) && !isVoucherNotStarted(v)).length,
      expired: vouchers.filter(v => isVoucherExpired(v)).length,
      inactive: vouchers.filter(v => v.status === 'inactive').length,
      totalUsage: vouchers.reduce((sum, v) => sum + (v.usageCount || 0), 0),
    };
  }, [vouchers]);

  // Filtered vouchers
  const filteredVouchers = useMemo(() => {
    let filtered = vouchers;

    if (filterStatus !== 'all') {
      if (filterStatus === 'active') {
        filtered = filtered.filter(v => v.status === 'active' && !isVoucherExpired(v) && !isVoucherMaxedOut(v));
      } else if (filterStatus === 'expired') {
        filtered = filtered.filter(v => isVoucherExpired(v));
      } else if (filterStatus === 'inactive') {
        filtered = filtered.filter(v => v.status === 'inactive');
      }
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(v => v.discountType === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(v =>
        v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [vouchers, filterStatus, filterType, searchTerm]);

  const voucherUsageRecords = useMemo(() => {
    if (!selectedVoucher) return [];
    return voucherUsage.filter(u => u.voucherId === selectedVoucher.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [voucherUsage, selectedVoucher]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Compact */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Quản lý khuyến mãi</h1>
            <p className="text-xs text-gray-600">Tạo và quản lý mã voucher giảm giá</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-3 text-xs">
            <div className="text-center">
              <p className="font-bold text-green-600">{stats.active}</p>
              <p className="text-gray-500">Hoạt động</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-red-600">{stats.expired}</p>
              <p className="text-gray-500">Hết hạn</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-purple-600">{stats.totalUsage}</p>
              <p className="text-gray-500">Lượt dùng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions & Filters - Compact */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex gap-2 flex-wrap items-center">
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="type-filter"
          >
            <option value="all">Tất cả loại</option>
            {DISCOUNT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
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
            <option value="active">Hoạt động</option>
            <option value="expired">Hết hạn</option>
            <option value="inactive">Tạm ngưng</option>
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm mã voucher, tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="search-vouchers"
            />
            <i className="fa-solid fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          </div>
          
          {/* Add Button */}
          <motion.button
            onClick={() => openModal()}
            className="ml-auto px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium text-xs flex items-center gap-1.5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="add-voucher-button"
          >
            <i className="fa-solid fa-plus" />
            Thêm voucher
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredVouchers.length === 0 ? (
          <div className="text-center py-20">
            <i className="fa-solid fa-ticket text-5xl text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">Không tìm thấy voucher nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {filteredVouchers.map((voucher) => {
              const statusInfo = getVoucherStatusInfo(voucher);
              const isActive = voucher.status === 'active' && !isVoucherExpired(voucher) && !isVoucherMaxedOut(voucher);

              return (
                <motion.div
                  key={voucher.id}
                  className="bg-white rounded border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-testid={`voucher-card-${voucher.id}`}
                >
                  <div className="p-2 bg-gradient-to-br from-rose-50 to-pink-50 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="inline-block px-2 py-1 bg-white border-2 border-dashed border-rose-400 rounded font-mono font-bold text-rose-700 text-xs mb-1">
                          {voucher.code}
                        </div>
                        <h3 className="font-semibold text-gray-800 text-xs truncate">{voucher.name}</h3>
                      </div>
                      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-2">
                    <div className="mb-2 p-2 bg-emerald-50 rounded border border-emerald-200">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-600 mb-0.5">Giảm giá</p>
                        <p className="text-base font-bold text-emerald-700">
                          {voucher.discountType === 'percent' 
                            ? `${voucher.discountValue}%`
                            : formatCurrency(voucher.discountValue)
                          }
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 mb-2 text-[10px]">
                      {voucher.minPurchase > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Đơn tối thiểu:</span>
                          <span className="font-semibold text-gray-800">{formatCurrency(voucher.minPurchase)}</span>
                        </div>
                      )}
                      {voucher.maxDiscount > 0 && voucher.discountType === 'percent' && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Giảm tối đa:</span>
                          <span className="font-semibold text-gray-800">{formatCurrency(voucher.maxDiscount)}</span>
                        </div>
                      )}
                      {voucher.usageLimit > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lượt dùng:</span>
                          <span className="font-semibold text-gray-800">{voucher.usageCount || 0}/{voucher.usageLimit}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Áp dụng:</span>
                        <span className="font-semibold text-gray-800">
                          {APPLICABLE_TO.find(a => a.value === (voucher.applicableTo || 'all'))?.label}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-0.5 mb-2 pb-2 border-b border-gray-100">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <i className="fa-solid fa-calendar text-blue-600 w-3" />
                        <span className="text-gray-600">Từ:</span>
                        <span className="font-medium text-gray-800">{new Date(voucher.startDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <i className="fa-solid fa-calendar-xmark text-red-600 w-3" />
                        <span className="text-gray-600">Đến:</span>
                        <span className="font-medium text-gray-800">{new Date(voucher.endDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 mb-1">
                      <button
                        onClick={() => openModal(voucher)}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-[10px] font-medium"
                        data-testid={`edit-${voucher.id}`}
                      >
                        <i className="fa-solid fa-edit mr-0.5" />
                        Sửa
                      </button>
                      <button
                        onClick={() => openUsageModal(voucher)}
                        className="px-2 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors text-[10px] font-medium"
                        data-testid={`usage-${voucher.id}`}
                      >
                        <i className="fa-solid fa-chart-line mr-0.5" />
                        Thống kê
                      </button>
                      <button
                        onClick={() => handleDuplicate(voucher)}
                        className="px-2 py-1 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 transition-colors text-[10px] font-medium"
                        data-testid={`duplicate-${voucher.id}`}
                      >
                        <i className="fa-solid fa-copy mr-0.5" />
                        Sao chép
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => handleToggleStatus(voucher)}
                        className={`px-2 py-1 rounded transition-colors text-[10px] font-medium ${
                          voucher.status === 'active'
                            ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                        data-testid={`toggle-${voucher.id}`}
                      >
                        <i className={`fa-solid ${voucher.status === 'active' ? 'fa-pause' : 'fa-play'} mr-0.5`} />
                        {voucher.status === 'active' ? 'Tạm ngưng' : 'Kích hoạt'}
                      </button>
                      <button
                        onClick={() => handleDelete(voucher.id)}
                        className="px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-[10px] font-medium"
                        data-testid={`delete-${voucher.id}`}
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
              data-testid="voucher-modal"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-pink-50 sticky top-0 z-10">
                <h2 className="text-base font-bold text-gray-800">
                  {editingVoucher ? 'Cập nhật voucher' : 'Thêm voucher mới'}
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
                        Mã voucher (tự động nếu trống)
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                        placeholder="SUMMER2024"
                        data-testid="code-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tên voucher <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Giảm giá mùa hè"
                        data-testid="name-input"
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
                      placeholder="Mô tả chi tiết về voucher..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Loại giảm giá <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="discounttype-select"
                    >
                      {DISCOUNT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Giá trị <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="any"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder={formData.discountType === 'percent' ? '10' : '50000'}
                        data-testid="discountvalue-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Đơn tối thiểu
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={formData.minPurchase}
                        onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="100000"
                        data-testid="minpurchase-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Giảm tối đa
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="50000"
                        data-testid="maxdiscount-input"
                        disabled={formData.discountType === 'fixed'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tổng lượt sử dụng (0 = không giới hạn)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="100"
                        data-testid="usagelimit-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Lượt/khách hàng (0 = không giới hạn)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.usagePerCustomer}
                        onChange={(e) => setFormData({ ...formData, usagePerCustomer: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="1"
                        data-testid="usagepercustomer-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Áp dụng cho
                    </label>
                    <select
                      value={formData.applicableTo}
                      onChange={(e) => setFormData({ ...formData, applicableTo: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      {APPLICABLE_TO.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ngày bắt đầu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="startdate-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ngày hết hạn <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="enddate-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="status-select"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm ngưng</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full px-3 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium"
                    data-testid="submit-voucher"
                  >
                    {editingVoucher ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Usage Statistics Modal */}
      <AnimatePresence>
        {isUsageModalOpen && selectedVoucher && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeUsageModal}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-purple-50 sticky top-0 z-10">
                <h2 className="text-base font-bold text-gray-800">Thống kê sử dụng</h2>
                <button
                  onClick={closeUsageModal}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                >
                  <i className="fa-solid fa-xmark text-gray-700" />
                </button>
              </div>

              <div className="p-3">
                <div className="mb-3 p-2 bg-gray-50 rounded">
                  <h3 className="font-bold text-gray-800 text-sm">{selectedVoucher.name}</h3>
                  <p className="text-xs font-mono text-gray-600">{selectedVoucher.code}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 bg-blue-50 rounded text-center">
                    <p className="text-xs text-gray-600 mb-0.5">Đã sử dụng</p>
                    <p className="text-lg font-bold text-blue-600">{selectedVoucher.usageCount || 0}</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded text-center">
                    <p className="text-xs text-gray-600 mb-0.5">Còn lại</p>
                    <p className="text-lg font-bold text-green-600">
                      {selectedVoucher.usageLimit > 0 ? selectedVoucher.usageLimit - (selectedVoucher.usageCount || 0) : '∞'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-700 border-b pb-1">Thông tin chi tiết</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại giảm:</span>
                      <span className="font-semibold text-gray-800">
                        {DISCOUNT_TYPES.find(t => t.value === selectedVoucher.discountType)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá trị:</span>
                      <span className="font-semibold text-emerald-700">
                        {selectedVoucher.discountType === 'percent'
                          ? `${selectedVoucher.discountValue}%`
                          : formatCurrency(selectedVoucher.discountValue)
                        }
                      </span>
                    </div>
                    {selectedVoucher.minPurchase > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Đơn tối thiểu:</span>
                        <span className="font-semibold text-gray-800">{formatCurrency(selectedVoucher.minPurchase)}</span>
                      </div>
                    )}
                    {selectedVoucher.maxDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giảm tối đa:</span>
                        <span className="font-semibold text-gray-800">{formatCurrency(selectedVoucher.maxDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian:</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(selectedVoucher.startDate).toLocaleDateString('vi-VN')} - {new Date(selectedVoucher.endDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>

                {voucherUsageRecords.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-xs font-semibold text-gray-700 border-b pb-1 mb-2">Lịch sử sử dụng gần đây</h4>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto">
                      {voucherUsageRecords.slice(0, 10).map((usage, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-800">{usage.customerName || 'Khách lẻ'}</span>
                            <span className="text-gray-600">{new Date(usage.date).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="text-gray-600 mt-0.5">
                            Giảm: <span className="font-semibold text-emerald-600">{formatCurrency(usage.discountAmount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
