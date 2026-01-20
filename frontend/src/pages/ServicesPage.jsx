import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'salon_services';

// Initial sample data
const INITIAL_SERVICES = [
  {
    id: 'SV001',
    name: 'Cắt tóc nam',
    price: 100000,
    duration: 30,
    category: 'cat-toc',
    description: 'Cắt tóc nam cơ bản',
    status: 'active'
  },
  {
    id: 'SV002',
    name: 'Cắt tóc nữ',
    price: 150000,
    duration: 45,
    category: 'cat-toc',
    description: 'Cắt tóc nữ',
    status: 'active'
  },
  {
    id: 'SV003',
    name: 'Nhuộm tóc',
    price: 500000,
    duration: 120,
    category: 'nhuom',
    description: 'Nhuộm tóc toàn bộ',
    status: 'active'
  },
  {
    id: 'SV004',
    name: 'Uốn tóc',
    price: 800000,
    duration: 180,
    category: 'uon',
    description: 'Uốn tóc Hàn Quốc',
    status: 'active'
  },
  {
    id: 'SV005',
    name: 'Gội đầu massage',
    price: 80000,
    duration: 20,
    category: 'goi-dau',
    description: 'Gội đầu dưỡng sinh và massage thư giãn',
    status: 'active'
  }
];

export const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    category: 'cat-toc',
    description: '',
    status: 'active'
  });

  const categories = [
    { value: 'cat-toc', label: 'Cắt tóc' },
    { value: 'nhuom', label: 'Nhuộm tóc' },
    { value: 'uon', label: 'Uốn tóc' },
    { value: 'duoi', label: 'Duỗi tóc' },
    { value: 'goi-dau', label: 'Gội đầu' },
    { value: 'khac', label: 'Khác' }
  ];

  // Load services from localStorage
  const loadServices = () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setServices(JSON.parse(stored));
      } else {
        // Initialize with sample data
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SERVICES));
        setServices(INITIAL_SERVICES);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      setServices(INITIAL_SERVICES);
    } finally {
      setLoading(false);
    }
  };

  // Save services to localStorage
  const saveServices = (updatedServices) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedServices));
      setServices(updatedServices);
    } catch (error) {
      console.error('Error saving services:', error);
      alert('Có lỗi khi lưu dữ liệu!');
    }
  };

  // Generate new ID
  const generateId = () => {
    const existingIds = services.map(s => s.id);
    const numbers = existingIds
      .map(id => parseInt(id.replace('SV', '')))
      .filter(num => !isNaN(num));
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `SV${String(nextNum).padStart(3, '0')}`;
  };

  useEffect(() => {
    loadServices();
  }, []);

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      let updatedServices;
      
      if (editingService) {
        // Update service
        updatedServices = services.map(s => 
          s.id === editingService.id 
            ? { ...s, ...formData, price: parseFloat(formData.price), duration: parseInt(formData.duration) }
            : s
        );
      } else {
        // Create new service
        const newService = {
          id: generateId(),
          ...formData,
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration)
        };
        updatedServices = [...services, newService];
      }
      
      saveServices(updatedServices);
      closeModal();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Có lỗi xảy ra khi lưu dịch vụ!');
    }
  };

  // Handle delete
  const handleDelete = (serviceId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      return;
    }

    try {
      const updatedServices = services.filter(s => s.id !== serviceId);
      saveServices(updatedServices);
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Có lỗi xảy ra khi xóa dịch vụ!');
    }
  };

  // Open modal for create/edit
  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        price: service.price,
        duration: service.duration,
        category: service.category,
        description: service.description || '',
        status: service.status
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        price: '',
        duration: '',
        category: 'cat-toc',
        description: '',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  // Filter services
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý dịch vụ</h1>
        <p className="text-gray-600 text-sm">Quản lý các dịch vụ salon của bạn</p>
      </div>

      {/* Actions bar */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="search-services"
            />
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        <motion.button
          onClick={() => openModal()}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          data-testid="add-service-button"
        >
          <i className="fa-solid fa-plus" />
          Thêm dịch vụ
        </motion.button>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-20">
          <i className="fa-solid fa-box-open text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500">Không tìm thấy dịch vụ nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredServices.map((service) => (
            <motion.div
              key={service.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              data-testid={`service-card-${service.id}`}
            >
              {/* Card Header */}
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-gray-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-base mb-1">{service.name}</h3>
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded">
                      {categories.find(c => c.value === service.category)?.label || service.category}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    service.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {service.status === 'active' ? 'Hoạt động' : 'Ngưng'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <i className="fa-solid fa-money-bill text-emerald-600 w-4" />
                    <span className="text-gray-600">Giá:</span>
                    <span className="font-semibold text-emerald-700">{formatCurrency(service.price)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="fa-solid fa-clock text-blue-600 w-4" />
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-semibold text-gray-800">{service.duration} phút</span>
                  </div>
                </div>

                {service.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{service.description}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <motion.button
                    onClick={() => openModal(service)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid={`edit-service-${service.id}`}
                  >
                    <i className="fa-solid fa-edit mr-1" />
                    Sửa
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(service.id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid={`delete-service-${service.id}`}
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

      {/* Modal */}
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              data-testid="service-modal"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                <h2 className="text-base font-bold text-gray-800">
                  {editingService ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  data-testid="close-modal"
                >
                  <i className="fa-solid fa-xmark text-gray-700 text-sm" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-3">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tên dịch vụ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Nhập tên dịch vụ"
                      data-testid="service-name-input"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="service-category-select"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price and Duration */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Giá (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="100000"
                        data-testid="service-price-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Thời gian (phút) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="30"
                        data-testid="service-duration-input"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="2"
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                      placeholder="Mô tả chi tiết về dịch vụ..."
                      data-testid="service-description-input"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="service-status-select"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Ngưng hoạt động</option>
                    </select>
                  </div>
                </div>

                {/* Modal Footer */}
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
                    data-testid="submit-service"
                  >
                    {editingService ? 'Cập nhật' : 'Thêm mới'}
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
