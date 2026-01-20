import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOKINGS_KEY = 'salon_bookings';
const SERVICES_KEY = 'salon_services';
const CUSTOMERS_KEY = 'salon_customers';

const INITIAL_BOOKINGS = [
  {
    id: 'BK001',
    customerId: 'CUS001',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    serviceId: 'SV001',
    serviceName: 'Cắt tóc nam',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: 30,
    status: 'confirmed',
    notes: '',
    createdAt: new Date().toISOString()
  }
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00'
];

const STATUS_CONFIG = {
  pending: { label: 'Chờ xác nhận', color: 'yellow', bgClass: 'bg-yellow-100', textClass: 'text-yellow-700', icon: 'fa-clock' },
  confirmed: { label: 'Đã xác nhận', color: 'blue', bgClass: 'bg-blue-100', textClass: 'text-blue-700', icon: 'fa-check-circle' },
  completed: { label: 'Hoàn thành', color: 'green', bgClass: 'bg-green-100', textClass: 'text-green-700', icon: 'fa-check-double' },
  cancelled: { label: 'Đã hủy', color: 'red', bgClass: 'bg-red-100', textClass: 'text-red-700', icon: 'fa-times-circle' },
  noshow: { label: 'Không đến', color: 'gray', bgClass: 'bg-gray-100', textClass: 'text-gray-700', icon: 'fa-user-slash' }
};

export const BookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('calendar'); // calendar or list
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, confirmed, completed, cancelled
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(null);
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [formData, setFormData] = useState({
    customerId: '',
    serviceId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    notes: '',
    status: 'pending'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const storedBookings = localStorage.getItem(BOOKINGS_KEY);
      const storedServices = localStorage.getItem(SERVICES_KEY);
      const storedCustomers = localStorage.getItem(CUSTOMERS_KEY);

      if (storedBookings) {
        setBookings(JSON.parse(storedBookings));
      } else {
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
        setBookings(INITIAL_BOOKINGS);
      }

      if (storedServices) setServices(JSON.parse(storedServices));
      if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveBookings = (updatedBookings) => {
    try {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updatedBookings));
      setBookings(updatedBookings);
    } catch (error) {
      console.error('Error saving bookings:', error);
      alert('Có lỗi khi lưu dữ liệu!');
    }
  };

  // Auto-format date input: 13032004 -> 13/03/2004
  const handleDateInput = (value) => {
    // Remove all non-digit characters
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

    // Convert to YYYY-MM-DD format for backend
    if (digits.length === 8) {
      const day = digits.slice(0, 2);
      const month = digits.slice(2, 4);
      const year = digits.slice(4, 8);
      
      // Validate date
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() == year && 
          date.getMonth() == month - 1 && 
          date.getDate() == day) {
        setFormData({ ...formData, date: `${year}-${month}-${day}` });
      }
    }
  };

  // Auto-format time input: 1030 -> 10:30
  const handleTimeInput = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    let formatted = digits;

    if (digits.length >= 2) {
      formatted = digits.slice(0, 2);
      if (digits.length > 2) {
        formatted += ':' + digits.slice(2, 4);
      }
    }

    setTimeInput(formatted);

    // Convert to HH:MM format for backend
    if (digits.length === 4) {
      const hours = digits.slice(0, 2);
      const minutes = digits.slice(2, 4);
      
      // Validate time
      if (parseInt(hours) >= 0 && parseInt(hours) <= 23 && 
          parseInt(minutes) >= 0 && parseInt(minutes) <= 59) {
        setFormData({ ...formData, time: `${hours}:${minutes}` });
      }
    }
  };

  const generateId = () => {
    const existingIds = bookings.map(b => b.id);
    const numbers = existingIds
      .map(id => parseInt(id.replace('BK', '')))
      .filter(num => !isNaN(num));
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `BK${String(nextNum).padStart(3, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      const customer = customers.find(c => c.id === formData.customerId);
      const service = services.find(s => s.id === formData.serviceId);

      if (!customer || !service) {
        alert('Vui lòng chọn khách hàng và dịch vụ!');
        return;
      }

      let updatedBookings;
      
      if (editingBooking) {
        updatedBookings = bookings.map(b => 
          b.id === editingBooking.id 
            ? {
                ...b,
                ...formData,
                customerName: customer.name,
                customerPhone: customer.phone,
                serviceName: service.name,
                duration: service.duration
              }
            : b
        );
      } else {
        const newBooking = {
          id: generateId(),
          ...formData,
          customerName: customer.name,
          customerPhone: customer.phone,
          serviceName: service.name,
          duration: service.duration,
          createdAt: new Date().toISOString()
        };
        updatedBookings = [...bookings, newBooking];
      }
      
      saveBookings(updatedBookings);
      closeModal();
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('Có lỗi xảy ra khi lưu lịch hẹn!');
    }
  };

  const handleDelete = (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch hẹn này?')) {
      return;
    }

    try {
      const updatedBookings = bookings.filter(b => b.id !== bookingId);
      saveBookings(updatedBookings);
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Có lỗi xảy ra khi xóa lịch hẹn!');
    }
  };

  const updateStatus = (bookingId, newStatus) => {
    try {
      const updatedBookings = bookings.map(b =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      );
      saveBookings(updatedBookings);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const openModal = (booking = null) => {
    if (booking) {
      setEditingBooking(booking);
      
      // Format date for display: YYYY-MM-DD -> DD/MM/YYYY
      const dateParts = booking.date.split('-');
      const displayDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
      setDateInput(displayDate);
      
      // Format time for display: HH:MM
      const timeParts = booking.time.split(':');
      const displayTime = `${timeParts[0]}:${timeParts[1]}`;
      setTimeInput(displayTime);
      
      setFormData({
        customerId: booking.customerId,
        serviceId: booking.serviceId,
        date: booking.date,
        time: booking.time,
        notes: booking.notes || '',
        status: booking.status
      });
    } else {
      setEditingBooking(null);
      
      // Format current date for display
      const today = new Date();
      const displayDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
      setDateInput(displayDate);
      setTimeInput('10:00');
      
      setFormData({
        customerId: '',
        serviceId: '',
        date: selectedDate,
        time: '10:00',
        notes: '',
        status: 'pending'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBooking(null);
  };

  const getBookingsByDate = (date) => {
    return bookings.filter(b => b.date === date).sort((a, b) => a.time.localeCompare(b.time));
  };

  const getBookingsByDateAndTime = (date, time) => {
    return bookings.filter(b => b.date === date && b.time === time);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.date === today);
    
    return {
      total: bookings.length,
      today: todayBookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };
  }, [bookings]);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customerPhone.includes(searchTerm) ||
        b.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [bookings, filterStatus, searchTerm]);

  const todayBookings = getBookingsByDate(selectedDate).filter(b => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (searchTerm && 
        !b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !b.customerPhone.includes(searchTerm) &&
        !b.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    ) return false;
    return true;
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Compact */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Quản lý đặt lịch</h1>
            <p className="text-xs text-gray-600">Quản lý lịch hẹn dịch vụ</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-3 text-xs">
            <div className="text-center">
              <p className="font-bold text-blue-600">{stats.today}</p>
              <p className="text-gray-500">Hôm nay</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-gray-500">Chờ xác nhận</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-green-600">{stats.completed}</p>
              <p className="text-gray-500">Hoàn thành</p>
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
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              data-testid="calendar-view"
            >
              <i className="fa-solid fa-calendar mr-1" />
              Lịch
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

          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="date-picker"
          />

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="status-filter"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
            <option value="noshow">Không đến</option>
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm khách hàng, SĐT, dịch vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="search-bookings"
            />
            <i className="fa-solid fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          </div>
          
          {/* Add Button */}
          <motion.button
            onClick={() => openModal()}
            className="ml-auto px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium text-xs flex items-center gap-1.5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="add-booking-button"
          >
            <i className="fa-solid fa-plus" />
            Thêm lịch hẹn
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {viewMode === 'calendar' ? (
          <div className="bg-white rounded border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800">
                Lịch hẹn ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
              </h3>
              <span className="text-xs text-gray-600">{todayBookings.length} lịch hẹn</span>
            </div>
            
            {todayBookings.length === 0 ? (
              <div className="text-center py-12">
                <i className="fa-solid fa-calendar-xmark text-5xl text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">Không có lịch hẹn nào</p>
              </div>
            ) : (
              <div className="space-y-2">
                {TIME_SLOTS.map((timeSlot) => {
                  const bookingsAtTime = getBookingsByDateAndTime(selectedDate, timeSlot).filter(b => {
                    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
                    if (searchTerm && 
                        !b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        !b.customerPhone.includes(searchTerm) &&
                        !b.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
                    ) return false;
                    return true;
                  });
                  
                  if (bookingsAtTime.length === 0) return null;

                  return (
                    <div key={timeSlot} className="border-l-2 border-emerald-500 pl-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1.5">{timeSlot}</p>
                      <div className="space-y-1.5">
                        {bookingsAtTime.map((booking) => {
                          const statusInfo = STATUS_CONFIG[booking.status];
                          return (
                            <motion.div
                              key={booking.id}
                              className="bg-gray-50 p-2 rounded border border-gray-200 hover:shadow-sm transition-shadow relative"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              data-testid={`booking-${booking.id}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <h4 className="font-semibold text-gray-800 text-xs truncate">{booking.customerName}</h4>
                                    <span className={`px-1.5 py-0.5 text-[10px] font-medium ${statusInfo.bgClass} ${statusInfo.textClass} rounded shrink-0`}>
                                      <i className={`fa-solid ${statusInfo.icon} mr-0.5`} />
                                      {statusInfo.label}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 truncate">
                                    <i className="fa-solid fa-cut mr-1 text-emerald-600" />
                                    {booking.serviceName} ({booking.duration}p)
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    <i className="fa-solid fa-phone mr-1" />
                                    {booking.customerPhone}
                                  </p>
                                  {booking.notes && (
                                    <p className="text-[10px] text-gray-500 mt-0.5 italic truncate">
                                      <i className="fa-solid fa-note-sticky mr-1" />
                                      {booking.notes}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="flex gap-0.5 shrink-0">
                                  {/* Quick Action Button */}
                                  <div className="relative">
                                    <button
                                      onClick={() => setShowQuickActions(showQuickActions === booking.id ? null : booking.id)}
                                      className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                      title="Thao tác nhanh"
                                      data-testid={`quick-actions-${booking.id}`}
                                    >
                                      <i className="fa-solid fa-ellipsis-vertical text-xs" />
                                    </button>
                                    
                                    {/* Quick Actions Dropdown */}
                                    <AnimatePresence>
                                      {showQuickActions === booking.id && (
                                        <>
                                          {/* Backdrop to close menu when clicking outside */}
                                          <div
                                            className="fixed inset-0 z-[5]"
                                            onClick={() => setShowQuickActions(null)}
                                          />
                                          <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[140px]"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            {booking.status === 'pending' && (
                                              <button
                                                onClick={() => { updateStatus(booking.id, 'confirmed'); setShowQuickActions(null); }}
                                                className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 text-blue-700 flex items-center gap-2"
                                                data-testid={`confirm-${booking.id}`}
                                              >
                                                <i className="fa-solid fa-check-circle w-4" />
                                                Xác nhận
                                              </button>
                                            )}
                                            {booking.status === 'confirmed' && (
                                              <button
                                                onClick={() => { updateStatus(booking.id, 'completed'); setShowQuickActions(null); }}
                                                className="w-full px-3 py-2 text-left text-xs hover:bg-green-50 text-green-700 flex items-center gap-2"
                                                data-testid={`complete-${booking.id}`}
                                              >
                                                <i className="fa-solid fa-check-double w-4" />
                                                Hoàn thành
                                              </button>
                                            )}
                                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                              <>
                                                <button
                                                  onClick={() => { updateStatus(booking.id, 'noshow'); setShowQuickActions(null); }}
                                                  className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                                                  data-testid={`noshow-${booking.id}`}
                                                >
                                                  <i className="fa-solid fa-user-slash w-4" />
                                                  Không đến
                                                </button>
                                                <button
                                                  onClick={() => { updateStatus(booking.id, 'cancelled'); setShowQuickActions(null); }}
                                                  className="w-full px-3 py-2 text-left text-xs hover:bg-red-50 text-red-700 flex items-center gap-2"
                                                  data-testid={`cancel-${booking.id}`}
                                                >
                                                  <i className="fa-solid fa-times-circle w-4" />
                                                  Hủy lịch
                                                </button>
                                              </>
                                            )}
                                            <button
                                              onClick={() => { openModal(booking); setShowQuickActions(null); }}
                                              className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 text-blue-700 flex items-center gap-2 border-t border-gray-100"
                                              data-testid={`edit-booking-${booking.id}`}
                                            >
                                              <i className="fa-solid fa-edit w-4" />
                                              Sửa
                                            </button>
                                            <button
                                              onClick={() => { handleDelete(booking.id); setShowQuickActions(null); }}
                                              className="w-full px-3 py-2 text-left text-xs hover:bg-red-50 text-red-700 flex items-center gap-2 border-t border-gray-100"
                                              data-testid={`delete-booking-${booking.id}`}
                                            >
                                              <i className="fa-solid fa-trash w-4" />
                                              Xóa
                                            </button>
                                          </motion.div>
                                        </>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {filteredBookings
              .sort((a, b) => {
                const dateCompare = b.date.localeCompare(a.date);
                if (dateCompare !== 0) return dateCompare;
                return b.time.localeCompare(a.time);
              })
              .map((booking) => {
                const statusInfo = STATUS_CONFIG[booking.status];
                return (
                  <motion.div
                    key={booking.id}
                    className="bg-white rounded border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    data-testid={`booking-card-${booking.id}`}
                  >
                    <div className="p-2 bg-gradient-to-br from-purple-50 to-indigo-50 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-xs truncate">{booking.customerName}</h3>
                          <p className="text-[10px] text-gray-600 truncate">{booking.customerPhone}</p>
                        </div>
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium ${statusInfo.bgClass} ${statusInfo.textClass} rounded shrink-0`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    <div className="p-2">
                      <div className="space-y-1 mb-2">
                        <div className="flex items-center gap-1.5 text-xs">
                          <i className="fa-solid fa-cut text-emerald-600 w-3 text-[10px]" />
                          <span className="text-gray-800 font-medium truncate">{booking.serviceName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <i className="fa-solid fa-calendar text-blue-600 w-3 text-[10px]" />
                          <span className="text-gray-600 text-[10px]">{new Date(booking.date).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <i className="fa-solid fa-clock text-purple-600 w-3 text-[10px]" />
                          <span className="text-gray-600 text-[10px]">{booking.time} ({booking.duration} phút)</span>
                        </div>
                      </div>

                      {booking.notes && (
                        <p className="text-[10px] text-gray-500 mb-2 p-1.5 bg-yellow-50 rounded border-l-2 border-yellow-400 line-clamp-2">
                          {booking.notes}
                        </p>
                      )}

                      <div className="flex gap-1 pt-2 border-t border-gray-100">
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button
                            onClick={() => updateStatus(booking.id, booking.status === 'pending' ? 'confirmed' : 'completed')}
                            className="flex-1 px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors text-[10px] font-medium"
                          >
                            <i className="fa-solid fa-check mr-0.5" />
                            {booking.status === 'pending' ? 'Xác nhận' : 'Hoàn thành'}
                          </button>
                        )}
                        <button
                          onClick={() => openModal(booking)}
                          className="flex-1 px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-[10px] font-medium"
                        >
                          <i className="fa-solid fa-edit mr-0.5" />
                          Sửa
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        )}
      </div>

      {/* Booking Modal - Compact */}
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
              data-testid="booking-modal"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-emerald-50 sticky top-0 z-10">
                <h2 className="text-base font-bold text-gray-800">
                  {editingBooking ? 'Cập nhật lịch hẹn' : 'Thêm lịch hẹn mới'}
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
                      Khách hàng <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="booking-customer-select"
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Dịch vụ <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.serviceId}
                      onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="booking-service-select"
                    >
                      <option value="">Chọn dịch vụ</option>
                      {services.filter(s => s.status === 'active').map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name} - {formatCurrency(service.price)} ({service.duration} phút)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
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
                        data-testid="booking-date-input"
                      />
                      <p className="text-[10px] text-gray-500 mt-0.5">VD: 13032004</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Giờ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={timeInput}
                        onChange={(e) => handleTimeInput(e.target.value)}
                        placeholder="10:30"
                        maxLength="5"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="booking-time-input"
                      />
                      <p className="text-[10px] text-gray-500 mt-0.5">VD: 1030</p>
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
                      data-testid="booking-status-select"
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                        <option key={key} value={key}>{value.label}</option>
                      ))}
                    </select>
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
                      placeholder="Ghi chú thêm về lịch hẹn..."
                      data-testid="booking-notes-input"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full px-3 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium"
                    data-testid="submit-booking"
                  >
                    {editingBooking ? 'Cập nhật' : 'Thêm mới'}
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
