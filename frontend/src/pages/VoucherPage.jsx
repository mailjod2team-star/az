import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'salon_vouchers';

const DISCOUNT_TYPES = [
  { value: 'percent', label: 'Phần trăm (%)', icon: 'fa-percent' },
  { value: 'fixed', label: 'Số tiền cố định (VNĐ)', icon: 'fa-money-bill' }
];

export const VoucherPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    discountType: 'percent',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    usageCount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active'
  });

  const loadVouchers = () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setVouchers(JSON.parse(stored));
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

  useEffect(() => {
    loadVouchers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
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
                usageLimit: parseInt(formData.usageLimit || 0)
              }
            : v
        );
      } else {
        const newVoucher = {
          id: generateId(),
          ...formData,
          code: formData.code || generateCode(),
          discountValue: parseFloat(formData.discountValue),
          minPurchase: parseFloat(formData.minPurchase || 0),
          maxDiscount: parseFloat(formData.maxDiscount || 0),
          usageLimit: parseInt(formData.usageLimit || 0),
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
    } catch (error) {
      console.error('Error deleting voucher:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const openModal = (voucher = null) => {
    if (voucher) {
      setEditingVoucher(voucher);
      setFormData({
        code: voucher.code,
        name: voucher.name,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        minPurchase: voucher.minPurchase || '',
        maxDiscount: voucher.maxDiscount || '',
        usageLimit: voucher.usageLimit || '',
        usageCount: voucher.usageCount || 0,
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
        discountType: 'percent',
        discountValue: '',
        minPurchase: '',
        maxDiscount: '',
        usageLimit: '',
        usageCount: 0,
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

  const filteredVouchers = vouchers.filter(voucher =>
    voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voucher.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý khuyến mãi</h1>
        <p className="text-gray-600 text-sm">Tạo và quản lý mã giảm giá voucher</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã hoặc tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="search-vouchers"
            />
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        <motion.button
          onClick={() => openModal()}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          data-testid="add-voucher-button"
        >
          <i className="fa-solid fa-plus" />
          Thêm voucher
        </motion.button>
      </div>

      {/* Vouchers Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div className="text-center py-20">
          <i className="fa-solid fa-ticket text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500">Chưa có voucher nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVouchers.map((voucher) => {
            const expired = isVoucherExpired(voucher);
            const maxedOut = isVoucherMaxedOut(voucher);
            const inactive = expired || maxedOut || voucher.status !== 'active';

            return (
              <motion.div
                key={voucher.id}
                className={`bg-white rounded-lg shadow-sm border-2 overflow-hidden hover:shadow-md transition-shadow ${
                  inactive ? 'border-gray-300 opacity-70' : 'border-rose-200'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                data-testid={`voucher-card-${voucher.id}`}
              >
                <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 border-b border-gray-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="inline-block px-3 py-1.5 bg-white border-2 border-dashed border-rose-400 rounded font-mono font-bold text-rose-700 text-lg mb-2">
                        {voucher.code}
                      </div>
                      <h3 className="font-semibold text-gray-800 text-sm">{voucher.name}</h3>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      inactive 
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {expired ? 'Hết hạn' : maxedOut ? 'Hết lượt' : voucher.status === 'active' ? 'Hoạt động' : 'Ngưng'}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Giảm giá</p>
                      <p className="text-2xl font-bold text-emerald-700">
                        {voucher.discountType === 'percent' 
                          ? `${voucher.discountValue}%`
                          : formatCurrency(voucher.discountValue)
                        }
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
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
                        <span className="text-gray-600">Lượt sử dụng:</span>
                        <span className="font-semibold text-gray-800">{voucher.usageCount}/{voucher.usageLimit}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Từ:</span>
                      <span className="text-gray-800">{voucher.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đến:</span>
                      <span className="text-gray-800">{voucher.endDate}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <motion.button
                      onClick={() => openModal(voucher)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      data-testid={`edit-voucher-${voucher.id}`}
                    >
                      <i className="fa-solid fa-edit mr-1" />
                      Sửa
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(voucher.id)}
                      className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      data-testid={`delete-voucher-${voucher.id}`}
                    >
                      <i className="fa-solid fa-trash mr-1" />
                      Xóa
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Voucher Modal */}
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
              data-testid="voucher-modal"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-pink-50">
                <h2 className="text-lg font-bold text-gray-800">
                  {editingVoucher ? 'Cập nhật voucher' : 'Thêm voucher mới'}
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
                        Mã voucher (tự động nếu để trống)
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                        placeholder="SUMMER2024"
                        data-testid="code-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên voucher <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Giảm giá mùa hè"
                        data-testid="name-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại giảm giá <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="discounttype-select"
                    >
                      {DISCOUNT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giá trị giảm <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder={formData.discountType === 'percent' ? '10' : '50000'}
                        data-testid="discountvalue-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Đơn tối thiểu
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.minPurchase}
                        onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="100000"
                        data-testid="minpurchase-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giảm tối đa
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="50000"
                        data-testid="maxdiscount-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số lượt sử dụng (0 = không giới hạn)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="100"
                      data-testid="usagelimit-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày bắt đầu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="startdate-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày hết hạn <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="enddate-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="status-select"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Ngưng hoạt động</option>
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
    </div>
  );
};