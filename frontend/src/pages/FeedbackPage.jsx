import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'suggestion',
    rating: 5,
    content: ''
  });

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = () => {
    const stored = localStorage.getItem('deartech_feedbacks');
    if (stored) {
      setFeedbacks(JSON.parse(stored));
    }
  };

  const saveFeedbacks = (data) => {
    localStorage.setItem('deartech_feedbacks', JSON.stringify(data));
    setFeedbacks(data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newFeedback = {
      id: Date.now().toString(),
      ...formData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      response: ''
    };
    
    const updated = [newFeedback, ...feedbacks];
    saveFeedbacks(updated);
    
    setFormData({
      name: '',
      email: '',
      type: 'suggestion',
      rating: 5,
      content: ''
    });
    setShowForm(false);
  };

  const handleStatusChange = (id, newStatus) => {
    const updated = feedbacks.map(fb => 
      fb.id === id ? { ...fb, status: newStatus } : fb
    );
    saveFeedbacks(updated);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa góp ý này?')) {
      const updated = feedbacks.filter(fb => fb.id !== id);
      saveFeedbacks(updated);
      setSelectedFeedback(null);
    }
  };

  const filteredFeedbacks = feedbacks.filter(fb => {
    if (filterType !== 'all' && fb.type !== filterType) return false;
    if (filterStatus !== 'all' && fb.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter(fb => fb.status === 'pending').length,
    resolved: feedbacks.filter(fb => fb.status === 'resolved').length,
    avgRating: feedbacks.length > 0 
      ? (feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length).toFixed(1)
      : 0
  };

  const typeLabels = {
    bug: 'Báo lỗi',
    feature: 'Tính năng mới',
    improvement: 'Cải thiện',
    suggestion: 'Góp ý'
  };

  const typeColors = {
    bug: 'red',
    feature: 'blue',
    improvement: 'purple',
    suggestion: 'green'
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <i className="fa-solid fa-envelope text-emerald-600" />
              Hòm thư góp ý
            </h1>
            <p className="text-xs text-gray-600">Góp ý để DearTech phát triển tốt hơn</p>
          </div>
          <motion.button
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-emerald-700 text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <i className="fa-solid fa-plus" />
            Gửi góp ý
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-2 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-700 font-medium">Tổng góp ý</p>
                <p className="text-xl font-bold text-emerald-900">{stats.total}</p>
              </div>
              <i className="fa-solid fa-comments text-emerald-600 text-xl" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-2 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-700 font-medium">Chờ xử lý</p>
                <p className="text-xl font-bold text-amber-900">{stats.pending}</p>
              </div>
              <i className="fa-solid fa-clock text-amber-600 text-xl" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700 font-medium">Đã xử lý</p>
                <p className="text-xl font-bold text-blue-900">{stats.resolved}</p>
              </div>
              <i className="fa-solid fa-check-circle text-blue-600 text-xl" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-700 font-medium">Đánh giá TB</p>
                <p className="text-xl font-bold text-purple-900">{stats.avgRating}/5</p>
              </div>
              <i className="fa-solid fa-star text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-700">Lọc:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-xs"
          >
            <option value="all">Tất cả loại</option>
            <option value="bug">Báo lỗi</option>
            <option value="feature">Tính năng mới</option>
            <option value="improvement">Cải thiện</option>
            <option value="suggestion">Góp ý</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-xs"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="resolved">Đã xử lý</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-1 gap-2">
          {filteredFeedbacks.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-inbox text-gray-400 text-3xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có góp ý nào</h3>
              <p className="text-gray-600 mb-4">Hãy gửi góp ý đầu tiên của bạn!</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
              >
                Gửi góp ý ngay
              </button>
            </div>
          ) : (
            filteredFeedbacks.map((feedback) => (
              <motion.div
                key={feedback.id}
                className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedFeedback(feedback)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium bg-${typeColors[feedback.type]}-100 text-${typeColors[feedback.type]}-700`}>
                        {typeLabels[feedback.type]}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        feedback.status === 'pending' 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {feedback.status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`fa-solid fa-star text-xs ${
                              i < feedback.rating ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm text-gray-800 mb-1">{feedback.name}</h3>
                    <p className="text-xs text-gray-600 mb-1.5 line-clamp-2">{feedback.content}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span><i className="fa-solid fa-envelope mr-1" />{feedback.email}</span>
                      <span><i className="fa-solid fa-clock mr-1" />{new Date(feedback.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(
                        feedback.id,
                        feedback.status === 'pending' ? 'resolved' : 'pending'
                      );
                    }}
                    className={`ml-3 px-2.5 py-1 rounded-lg text-xs font-medium ${
                      feedback.status === 'pending'
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {feedback.status === 'pending' ? 'Đánh dấu xong' : 'Mở lại'}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="bg-white rounded-lg shadow-lg max-w-lg w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800">Gửi góp ý của bạn</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fa-solid fa-times text-lg" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Loại góp ý <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      >
                        <option value="suggestion">Góp ý chung</option>
                        <option value="bug">Báo lỗi</option>
                        <option value="feature">Đề xuất tính năng mới</option>
                        <option value="improvement">Cải thiện tính năng</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Đánh giá phần mềm <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-1 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setFormData({ ...formData, rating: star });
                            }}
                            className="text-xl focus:outline-none hover:scale-110 transition-transform cursor-pointer"
                          >
                            <i
                              className={`fa-solid fa-star ${
                                star <= formData.rating ? 'text-yellow-500' : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nội dung góp ý <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows="4"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                      placeholder="Chia sẻ ý kiến, góp ý của bạn về DearTech..."
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 text-sm"
                    >
                      <i className="fa-solid fa-paper-plane mr-2" />
                      Gửi góp ý
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedFeedback && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFeedback(null)}
          >
            <motion.div
              className="bg-white rounded-lg shadow-lg max-w-lg w-full"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800">Chi tiết góp ý</h2>
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fa-solid fa-times text-lg" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium bg-${typeColors[selectedFeedback.type]}-100 text-${typeColors[selectedFeedback.type]}-700`}>
                      {typeLabels[selectedFeedback.type]}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedFeedback.status === 'pending' 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {selectedFeedback.status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fa-solid fa-star text-xs ${
                            i < selectedFeedback.rating ? 'text-yellow-500' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Họ tên:</label>
                      <p className="text-sm text-gray-800 font-medium">{selectedFeedback.name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Email:</label>
                      <p className="text-sm text-gray-800">{selectedFeedback.email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Thời gian:</label>
                      <p className="text-sm text-gray-800">{new Date(selectedFeedback.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Nội dung góp ý:</label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedFeedback.content}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleDelete(selectedFeedback.id)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 text-sm"
                    >
                      <i className="fa-solid fa-trash mr-1" />
                      Xóa
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(
                          selectedFeedback.id,
                          selectedFeedback.status === 'pending' ? 'resolved' : 'pending'
                        );
                        setSelectedFeedback({
                          ...selectedFeedback,
                          status: selectedFeedback.status === 'pending' ? 'resolved' : 'pending'
                        });
                      }}
                      className="flex-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 text-sm"
                    >
                      <i className={`fa-solid ${selectedFeedback.status === 'pending' ? 'fa-check' : 'fa-undo'} mr-1`} />
                      {selectedFeedback.status === 'pending' ? 'Đánh dấu đã xử lý' : 'Mở lại'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};