import React, { useState, useEffect } from 'react';
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
  pending: { label: 'Chờ xác nhận', color: 'yellow', icon: 'fa-clock' },
  confirmed: { label: 'Đã xác nhận', color: 'blue', icon: 'fa-check-circle' },
  completed: { label: 'Hoàn thành', color: 'green', icon: 'fa-check-double' },
  cancelled: { label: 'Đã hủy', color: 'red', icon: 'fa-times-circle' }
};

export const BookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('calendar'); // calendar or list
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

  const todayBookings = getBookingsByDate(selectedDate);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý đặt lịch</h1>
        <p className="text-gray-600 text-sm">Quản lý lịch hẹn dịch vụ của khách hàng</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            data-testid="calendar-view"
          >
            <i className="fa-solid fa-calendar mr-2" />
            Lịch
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            data-testid="list-view"
          >
            <i className="fa-solid fa-list mr-2" />
            Danh sách
          </button>
        </div>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          data-testid="date-picker"
        />
        
        <motion.button
          onClick={() => openModal()}
          className="ml-auto px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          data-testid="add-booking-button"
        >
          <i className="fa-solid fa-plus" />
          Thêm lịch hẹn
        </motion.button>
      </div>

      {/* Content */}
      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Lịch hẹn ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
          </h3>
          
          {todayBookings.length === 0 ? (
            <div className="text-center py-12">
              <i className="fa-solid fa-calendar-xmark text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500">Không có lịch hẹn nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {TIME_SLOTS.map((timeSlot) => {
                const bookingsAtTime = getBookingsByDateAndTime(selectedDate, timeSlot);
                
                if (bookingsAtTime.length === 0) return null;

                return (
                  <div key={timeSlot} className="border-l-4 border-emerald-500 pl-4">
                    <p className="text-sm font-semibold text-gray-600 mb-2">{timeSlot}</p>
                    <div className="space-y-2">
                      {bookingsAtTime.map((booking) => {
                        const statusInfo = STATUS_CONFIG[booking.status];
                        return (
                          <motion.div
                            key={booking.id}
                            className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            data-testid={`booking-${booking.id}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-800">{booking.customerName}</h4>
                                  <span className={`px-2 py-0.5 text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-700 rounded`}>
                                    <i className={`fa-solid ${statusInfo.icon} mr-1`} />
                                    {statusInfo.label}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  <i className="fa-solid fa-cut mr-1" />
                                  {booking.serviceName} ({booking.duration} phút)
                                </p>
                                <p className="text-sm text-gray-500">
                                  <i className="fa-solid fa-phone mr-1" />
                                  {booking.customerPhone}
                                </p>
                                {booking.notes && (
                                  <p className="text-sm text-gray-500 mt-1 italic">
                                    <i className="fa-solid fa-note-sticky mr-1" />
                                    {booking.notes}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex gap-1 ml-2">
                                {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                                  <>
                                    <button
                                      onClick={() => updateStatus(booking.id, 'completed')}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                      title="Hoàn thành"
                                      data-testid={`complete-${booking.id}`}
                                    >
                                      <i className="fa-solid fa-check" />
                                    </button>
                                    <button
                                      onClick={() => updateStatus(booking.id, 'cancelled')}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                      title="Hủy"
                                      data-testid={`cancel-${booking.id}`}
                                    >
                                      <i className="fa-solid fa-times" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => openModal(booking)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Sửa"
                                  data-testid={`edit-booking-${booking.id}`}
                                >
                                  <i className="fa-solid fa-edit" />
                                </button>
                                <button
                                  onClick={() => handleDelete(booking.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Xóa"
                                  data-testid={`delete-booking-${booking.id}`}
                                >
                                  <i className="fa-solid fa-trash" />
                                </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings
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
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-testid={`booking-card-${booking.id}`}
                >
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{booking.customerName}</h3>
                        <p className="text-sm text-gray-600">{booking.customerPhone}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-700 rounded`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <i className="fa-solid fa-cut text-emerald-600 w-4" />
                        <span className="text-gray-800 font-medium">{booking.serviceName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <i className="fa-solid fa-calendar text-blue-600 w-4" />
                        <span className="text-gray-600">{new Date(booking.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <i className="fa-solid fa-clock text-purple-600 w-4" />
                        <span className="text-gray-600">{booking.time} ({booking.duration} phút)</span>
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="text-sm text-gray-500 mb-4 p-2 bg-yellow-50 rounded border-l-2 border-yellow-400">
                        {booking.notes}
                      </p>
                    )}

                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                        <button
                          onClick={() => updateStatus(booking.id, 'completed')}
                          className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-sm font-medium"
                        >
                          <i className="fa-solid fa-check mr-1" />
                          Hoàn thành
                        </button>
                      )}
                      <button
                        onClick={() => openModal(booking)}
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        <i className="fa-solid fa-edit mr-1" />
                        Sửa
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      )}

      {/* Booking Modal */}
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
              data-testid="booking-modal"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                <h2 className="text-lg font-bold text-gray-800">
                  {editingBooking ? 'Cập nhật lịch hẹn' : 'Thêm lịch hẹn mới'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dịch vụ <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.serviceId}
                      onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                        data-testid="booking-date-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giờ <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        data-testid="booking-time-select"
                      >
                        {TIME_SLOTS.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Ghi chú thêm về lịch hẹn..."
                      data-testid="booking-notes-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      data-testid="booking-status-select"
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                        <option key={key} value={key}>{value.label}</option>
                      ))}
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
