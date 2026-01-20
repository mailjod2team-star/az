import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const FeedbackPage = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Compact */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Đánh giá khách hàng</h1>
            <p className="text-xs text-gray-600">Xem và quản lý phản hồi từ khách hàng</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="bg-white rounded border border-gray-200 p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-comment-dots text-yellow-600 text-3xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Đánh giá & Phản hồi</h2>
            <p className="text-gray-600 mb-4">Chức năng đang được phát triển</p>
            <div className="text-left bg-gray-50 rounded p-4 text-sm text-gray-700">
              <p className="font-semibold mb-2">Các tính năng sẽ có:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Thu thập đánh giá từ khách hàng</li>
                <li>Quản lý phản hồi và khiếu nại</li>
                <li>Thống kê mức độ hài lòng</li>
                <li>Phân tích sentiment khách hàng</li>
                <li>Gửi khảo sát sau dịch vụ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};