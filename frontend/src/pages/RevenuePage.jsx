import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TRANSACTIONS_KEY = 'salon_transactions';

export const RevenuePage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');

  const loadTransactions = () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem(TRANSACTIONS_KEY);
      if (stored) {
        setTransactions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions = transactions
    .filter(t => {
      const matchesMonth = t.date.startsWith(selectedMonth);
      const matchesPayment = filterPaymentMethod === 'all' || t.paymentMethod === filterPaymentMethod;
      return matchesMonth && matchesPayment;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalDiscount = filteredTransactions.reduce((sum, t) => sum + (t.discount || 0), 0);
  const totalTransactions = filteredTransactions.length;
  const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const cashTransactions = filteredTransactions.filter(t => t.paymentMethod === 'cash');
  const cardTransactions = filteredTransactions.filter(t => t.paymentMethod === 'card');
  const cashRevenue = cashTransactions.reduce((sum, t) => sum + t.total, 0);
  const cardRevenue = cardTransactions.reduce((sum, t) => sum + t.total, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Báo cáo doanh thu</h1>
        <p className="text-gray-600 text-sm">Theo dõi doanh thu từ các giao dịch bán hàng</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-money-bill-trend-up text-emerald-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng doanh thu</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-receipt text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Số giao dịch</p>
              <p className="text-xl font-bold text-gray-800">{totalTransactions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Trung bình/đơn</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(averageTransaction)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-tag text-amber-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng giảm giá</p>
              <p className="text-xl font-bold text-amber-600">{formatCurrency(totalDiscount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Tiền mặt</h3>
            <i className="fa-solid fa-money-bill text-green-600 text-2xl" />
          </div>
          <p className="text-2xl font-bold text-green-600 mb-1">{formatCurrency(cashRevenue)}</p>
          <p className="text-sm text-gray-500">{cashTransactions.length} giao dịch</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Thẻ/Chuyển khoản</h3>
            <i className="fa-solid fa-credit-card text-blue-600 text-2xl" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mb-1">{formatCurrency(cardRevenue)}</p>
          <p className="text-sm text-gray-500">{cardTransactions.length} giao dịch</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          data-testid="month-picker"
        />

        <select
          value={filterPaymentMethod}
          onChange={(e) => setFilterPaymentMethod(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          data-testid="payment-filter"
        >
          <option value="all">Tất cả phương thức</option>
          <option value="cash">Tiền mặt</option>
          <option value="card">Thẻ</option>
        </select>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-20">
          <i className="fa-solid fa-chart-line text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500">Chưa có giao dịch nào trong tháng này</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mã GD</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Thời gian</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Khách hàng</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Số mục</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Tạm tính</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Giảm giá</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Tổng</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">PT Thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <motion.tr 
                    key={transaction.id} 
                    className="hover:bg-gray-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    data-testid={`transaction-${transaction.id}`}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">
                      {transaction.id.substring(0, 12)}...
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDateTime(transaction.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                      {transaction.customerName}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {transaction.items.length}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-800">
                      {formatCurrency(transaction.subtotal)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-amber-600">
                      {transaction.discount > 0 ? `-${formatCurrency(transaction.discount)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-700">
                      {formatCurrency(transaction.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded font-medium ${
                        transaction.paymentMethod === 'cash'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        <i className={`fa-solid ${transaction.paymentMethod === 'cash' ? 'fa-money-bill' : 'fa-credit-card'}`} />
                        {transaction.paymentMethod === 'cash' ? 'Tiền mặt' : 'Thẻ'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};