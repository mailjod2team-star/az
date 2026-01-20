import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const StaffPage = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Compact */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Quản lý nhân viên</h1>
            <p className="text-xs text-gray-600">Quản lý thông tin và lịch làm việc của nhân viên</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="bg-white rounded border border-gray-200 p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-user-tie text-indigo-600 text-3xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Quản lý nhân viên</h2>
            <p className="text-gray-600 mb-4">Chức năng đang được phát triển</p>
            <div className="text-left bg-gray-50 rounded p-4 text-sm text-gray-700">
              <p className="font-semibold mb-2">Các tính năng sẽ có:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Thêm/sửa/xóa thông tin nhân viên</li>
                <li>Quản lý lịch làm việc, ca làm việc</li>
                <li>Theo dõi hiệu suất làm việc</li>
                <li>Quản lý phân quyền nhân viên</li>
                <li>Lịch sử công việc và KPI</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};