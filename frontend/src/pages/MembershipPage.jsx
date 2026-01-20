import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'salon_memberships';
const CUSTOMERS_KEY = 'salon_customers';

const INITIAL_MEMBERSHIPS = [
  {
    id: 'MB001',
    customerId: 'CUS001',
    customerName: 'Nguyễn Văn A',
    cardNumber: 'VIP001',
    type: 'gold',
    discount: 15,
    points: 350,
    startDate: '2024-01-15',
    expiryDate: '2025-01-15',
    status: 'active'
  }
];

const MEMBERSHIP_TYPES = [
  { value: 'silver', label: 'Bạc', discount: 5, color: 'gray', icon: 'fa-medal' },
  { value: 'gold', label: 'Vàng', discount: 10, color: 'yellow', icon: 'fa-crown' },
  { value: 'platinum', label: 'Bạch kim', discount: 15, color: 'blue', icon: 'fa-gem' },
  { value: 'diamond', label: 'Kim cương', discount: 20, color: 'purple', icon: 'fa-star' }
];

export const MembershipPage = () => {
  const [memberships, setMemberships] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    customerId: '',
    cardNumber: '',
    type: 'silver',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    status: 'active'
  });

  const loadData = () => {
    try {
      setLoading(true);
      
      // Load customers
      const storedCustomers = localStorage.getItem(CUSTOMERS_KEY);
      if (storedCustomers) {
        setCustomers(JSON.parse(storedCustomers));
      }

      // Load memberships
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setMemberships(JSON.parse(stored));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MEMBERSHIPS));
        setMemberships(INITIAL_MEMBERSHIPS);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMemberships(INITIAL_MEMBERSHIPS);
    } finally {
      setLoading(false);
    }
  };

  const saveMemberships = (updatedMemberships) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMemberships));
      setMemberships(updatedMemberships);
    } catch (error) {
      console.error('Error saving memberships:', error);
      alert('Có lỗi khi lưu dữ liệu!');
    }
  };

  const generateId = () => {
    const existingIds = memberships.map(m => m.id);
    const numbers = existingIds
      .map(id => parseInt(id.replace('MB', '')))
      .filter(num => !isNaN(num));
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `MB${String(nextNum).padStart(3, '0')}`;
  };

  const generateCardNumber = (type) => {
    const prefix = type.toUpperCase().substring(0, 3);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${random}`;
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      const selectedCustomer = customers.find(c => c.id === formData.customerId);
      if (!selectedCustomer) {
        alert('Vui lòng chọn khách hàng!');
        return;
      }

      const selectedType = MEMBERSHIP_TYPES.find(t => t.value === formData.type);
      
      let updatedMemberships;
      
      if (editingMembership) {
        updatedMemberships = memberships.map(m => 
          m.id === editingMembership.id 
            ? { 
                ...m, 
                ...formData,
                customerName: selectedCustomer.name,
                discount: selectedType.discount
              }
            : m
        );
      } else {
        const newMembership = {
          id: generateId(),
          ...formData,
          customerName: selectedCustomer.name,
          cardNumber: formData.cardNumber || generateCardNumber(formData.type),
          discount: selectedType.discount,
          points: 0
        };
        updatedMemberships = [...memberships, newMembership];
      }
      
      saveMemberships(updatedMemberships);
      closeModal();
    } catch (error) {
      console.error('Error saving membership:', error);
      alert('Có lỗi xảy ra khi lưu thẻ thành viên!');
    }
  };

  const handleDelete = (membershipId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thẻ thành viên này?')) {
      return;
    }

    try {
      const updatedMemberships = memberships.filter(m => m.id !== membershipId);
      saveMemberships(updatedMemberships);
    } catch (error) {
      console.error('Error deleting membership:', error);
      alert('Có lỗi xảy ra khi xóa thẻ thành viên!');
    }
  };

  const openModal = (membership = null) => {
    if (membership) {
      setEditingMembership(membership);
      setFormData({
        customerId: membership.customerId,
        cardNumber: membership.cardNumber,
        type: membership.type,
        startDate: membership.startDate,
        expiryDate: membership.expiryDate,
        status: membership.status
      });
    } else {
      setEditingMembership(null);
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      setFormData({
        customerId: '',
        cardNumber: '',
        type: 'silver',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: oneYearLater.toISOString().split('T')[0],
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMembership(null);
  };

  const filteredMemberships = memberships.filter(membership =>
    membership.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    membership.cardNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMembershipTypeInfo = (type) => {
    return MEMBERSHIP_TYPES.find(t => t.value === type) || MEMBERSHIP_TYPES[0];
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý thẻ thành viên</h1>
        <p className="text-gray-600 text-sm">Quản lý thẻ membership và ưu đãi cho khách hàng</p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc số thẻ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="search-memberships"
            />
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        <motion.button
          onClick={() => openModal()}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          data-testid="add-membership-button"
        >
          <i className="fa-solid fa-plus" />
          Thêm thẻ
        </motion.button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredMemberships.length === 0 ? (
        <div className="text-center py-20">
          <i className="fa-solid fa-id-card text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500">Không tìm thấy thẻ thành viên nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMemberships.map((membership) => {
            const typeInfo = getMembershipTypeInfo(membership.type);
            return (
              <motion.div
                key={membership.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                data-testid={`membership-card-${membership.id}`}
              >
                <div className={`p-4 bg-gradient-to-br from-${typeInfo.color}-50 to-${typeInfo.color}-100 border-b border-gray-200`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-${typeInfo.color}-200 flex items-center justify-center`}>
                        <i className={`fa-solid ${typeInfo.icon} text-${typeInfo.color}-700 text-xl`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-base">{membership.customerName}</h3>
                        <p className="text-sm text-gray-600">{membership.cardNumber}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      membership.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {membership.status === 'active' ? 'Hoạt động' : 'Hết hạn'}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Loại thẻ:</span>
                      <span className={`font-semibold text-${typeInfo.color}-700 text-base`}>{typeInfo.label}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">Giảm giá:</span>
                      <span className="font-semibold text-emerald-700 text-base">{membership.discount}%</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">Điểm tích lũy:</span>
                      <span className="font-semibold text-purple-700 text-base">{membership.points || 0} điểm</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <i className="fa-solid fa-calendar text-blue-600 w-4" />
                      <span className="text-gray-600">Từ:</span>
                      <span className="font-medium text-gray-800">{membership.startDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <i className="fa-solid fa-calendar-xmark text-red-600 w-4" />
                      <span className="text-gray-600">Đến:</span>
                      <span className="font-medium text-gray-800">{membership.expiryDate}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <motion.button
                      onClick={() => openModal(membership)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      data-testid={`edit-membership-${membership.id}`}
                    >
                      <i className="fa-solid fa-edit mr-1" />
                      Sửa
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(membership.id)}
                      className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      data-testid={`delete-membership-${membership.id}`}
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
              data-testid="membership-modal"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-yellow-50">
                <h2 className="text-lg font-bold text-gray-800">
                  {editingMembership ? 'Cập nhật thẻ' : 'Thêm thẻ mới'}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Khách hàng <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="membership-customer-select"
                      disabled={editingMembership}
                    >
                      <option value="">Chọn khách hàng</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại thẻ <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="membership-type-select"
                    >
                      {MEMBERSHIP_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label} - Giảm {type.discount}%
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số thẻ (tự động nếu để trống)
                    </label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="VIP001"
                      data-testid="membership-cardnumber-input"
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
                        data-testid="membership-startdate-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày hết hạn <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="membership-expirydate-input"
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
                      data-testid="membership-status-select"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="expired">Hết hạn</option>
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
                    data-testid="submit-membership"
                  >
                    {editingMembership ? 'Cập nhật' : 'Thêm mới'}
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