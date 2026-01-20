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
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showQuickActions, setShowQuickActions] = useState(null);
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

  // Toggle service status
  const toggleStatus = (serviceId) => {
    try {
      const updatedServices = services.map(s =>
        s.id === serviceId ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
      );
      saveServices(updatedServices);
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  // Statistics
  const stats = React.useMemo(() => {
    return {
      total: services.length,
      active: services.filter(s => s.status === 'active').length,
      inactive: services.filter(s => s.status === 'inactive').length,
      avgPrice: services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length) : 0,
      avgDuration: services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.duration, 0) / services.length) : 0,
    };
  }, [services]);

  // Filter services
  const filteredServices = services.filter(service => {
    // Search filter
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    
    // Status filter
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Format currency
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
            <h1 className="text-lg font-bold text-gray-800">Quản lý dịch vụ</h1>
            <p className="text-xs text-gray-600">Quản lý các dịch vụ salon</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-3 text-xs">
            <div className="text-center">
              <p className="font-bold text-emerald-600">{stats.total}</p>
              <p className="text-gray-500">Tổng</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-green-600">{stats.active}</p>
              <p className="text-gray-500">Hoạt động</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-blue-600">{formatCurrency(stats.avgPrice)}</p>
              <p className="text-gray-500">Giá TB</p>
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
              <i className="fa-solid fa-grid mr-1" />
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

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="category-filter"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
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
            <option value="inactive">Ngưng hoạt động</option>
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm dịch vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="search-services"
            />
            <i className="fa-solid fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          </div>
          
          {/* Add Button */}
          <motion.button
            onClick={() => openModal()}
            className="ml-auto px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium text-xs flex items-center gap-1.5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="add-service-button"
          >
            <i className="fa-solid fa-plus" />
            Thêm dịch vụ
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20">
            <i className="fa-solid fa-box-open text-5xl text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">Không tìm thấy dịch vụ nào</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {filteredServices.map((service) => (
              <motion.div
                key={service.id}
                className="bg-white rounded border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                data-testid={`service-card-${service.id}`}
              >
                {/* Card Header */}
                <div className="p-2 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-xs truncate">{service.name}</h3>
                      <p className="text-[10px] text-gray-600 truncate">
                        {categories.find(c => c.value === service.category)?.label}
                      </p>
                    </div>
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded shrink-0 ${
                      service.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {service.status === 'active' ? 'Hoạt động' : 'Ngưng'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-2">
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <i className="fa-solid fa-money-bill text-emerald-600 w-3 text-[10px]" />
                      <span className="text-gray-800 font-semibold truncate">{formatCurrency(service.price)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <i className="fa-solid fa-clock text-blue-600 w-3 text-[10px]" />
                      <span className="text-gray-600 text-[10px]">{service.duration} phút</span>
                    </div>
                  </div>

                  {service.description && (
                    <p className="text-[10px] text-gray-500 mb-2 line-clamp-2">{service.description}</p>
                  )}

                  <div className="flex gap-1 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => toggleStatus(service.id)}
                      className={`flex-1 px-2 py-1 rounded transition-colors text-[10px] font-medium ${
                        service.status === 'active'
                          ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                      data-testid={`toggle-status-${service.id}`}
                    >
                      <i className={`fa-solid ${service.status === 'active' ? 'fa-pause' : 'fa-play'} mr-0.5`} />
                      {service.status === 'active' ? 'Tắt' : 'Bật'}
                    </button>
                    <button
                      onClick={() => openModal(service)}
                      className="flex-1 px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-[10px] font-medium"
                      data-testid={`edit-service-${service.id}`}
                    >
                      <i className="fa-solid fa-edit mr-0.5" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-[10px]"
                      data-testid={`delete-service-${service.id}`}
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Tên dịch vụ</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Danh mục</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Giá</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Thời gian</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Trạng thái</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <motion.tr
                    key={service.id}
                    className="hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    data-testid={`service-row-${service.id}`}
                  >
                    <td className="px-3 py-2">
                      <div className="text-xs font-semibold text-gray-800">{service.name}</div>
                      {service.description && (
                        <div className="text-[10px] text-gray-500 truncate max-w-xs">{service.description}</div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium">
                        {categories.find(c => c.value === service.category)?.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs font-semibold text-emerald-700">
                      {formatCurrency(service.price)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600">{service.duration} phút</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                        service.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {service.status === 'active' ? 'Hoạt động' : 'Ngưng'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => toggleStatus(service.id)}
                          className={`p-1.5 rounded transition-colors ${
                            service.status === 'active'
                              ? 'text-yellow-600 hover:bg-yellow-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={service.status === 'active' ? 'Tắt' : 'Bật'}
                        >
                          <i className={`fa-solid ${service.status === 'active' ? 'fa-pause' : 'fa-play'} text-xs`} />
                        </button>
                        <button
                          onClick={() => openModal(service)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Sửa"
                        >
                          <i className="fa-solid fa-edit text-xs" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Xóa"
                        >
                          <i className="fa-solid fa-trash text-xs" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - Compact */}
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
              data-testid="service-modal"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-emerald-50 sticky top-0 z-10">
                <h2 className="text-base font-bold text-gray-800">
                  {editingService ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}
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
                      Tên dịch vụ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Nhập tên dịch vụ"
                      data-testid="service-name-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="service-category-select"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Giá (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="1000"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="30"
                        data-testid="service-duration-input"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                      placeholder="Mô tả chi tiết về dịch vụ..."
                      data-testid="service-description-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="service-status-select"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Ngưng hoạt động</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full px-3 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium"
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
