import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TRANSACTIONS_KEY = 'salon_transactions';

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const RevenuePage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [viewMode, setViewMode] = useState('overview'); // overview, daily, chart
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const matchesMonth = t.date.startsWith(selectedMonth);
        const matchesPayment = filterPaymentMethod === 'all' || t.paymentMethod === filterPaymentMethod;
        const matchesSearch = !searchTerm || 
          t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.id?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesMonth && matchesPayment && matchesSearch;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [transactions, selectedMonth, filterPaymentMethod, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalDiscount = filteredTransactions.reduce((sum, t) => sum + (t.discount || 0), 0);
    const totalTransactions = filteredTransactions.length;
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const cashTransactions = filteredTransactions.filter(t => t.paymentMethod === 'cash');
    const cardTransactions = filteredTransactions.filter(t => t.paymentMethod === 'card');
    const cashRevenue = cashTransactions.reduce((sum, t) => sum + t.total, 0);
    const cardRevenue = cardTransactions.reduce((sum, t) => sum + t.total, 0);

    // Previous month comparison
    const prevMonth = new Date(selectedMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthStr = prevMonth.toISOString().slice(0, 7);
    const prevMonthTransactions = transactions.filter(t => t.date.startsWith(prevMonthStr));
    const prevMonthRevenue = prevMonthTransactions.reduce((sum, t) => sum + t.total, 0);
    const revenueGrowth = prevMonthRevenue > 0 ? ((totalRevenue - prevMonthRevenue) / prevMonthRevenue * 100) : 0;

    // Top products/services
    const itemsMap = new Map();
    filteredTransactions.forEach(t => {
      t.items?.forEach(item => {
        const key = item.name;
        if (itemsMap.has(key)) {
          const existing = itemsMap.get(key);
          itemsMap.set(key, {
            ...existing,
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + (item.price * item.quantity)
          });
        } else {
          itemsMap.set(key, {
            name: item.name,
            quantity: item.quantity,
            revenue: item.price * item.quantity
          });
        }
      });
    });
    const topItems = Array.from(itemsMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      totalDiscount,
      totalTransactions,
      averageTransaction,
      cashRevenue,
      cardRevenue,
      cashTransactions: cashTransactions.length,
      cardTransactions: cardTransactions.length,
      revenueGrowth,
      prevMonthRevenue,
      topItems
    };
  }, [filteredTransactions, transactions, selectedMonth]);

  // Daily revenue data
  const dailyData = useMemo(() => {
    const dailyMap = new Map();
    filteredTransactions.forEach(t => {
      const date = t.date;
      if (dailyMap.has(date)) {
        dailyMap.set(date, dailyMap.get(date) + t.total);
      } else {
        dailyMap.set(date, t.total);
      }
    });
    
    return Array.from(dailyMap.entries())
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        fullDate: date,
        revenue: Math.round(revenue)
      }))
      .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
  }, [filteredTransactions]);

  // Payment method data for pie chart
  const paymentData = [
    { name: 'Tiền mặt', value: stats.cashRevenue },
    { name: 'Thẻ/CK', value: stats.cardRevenue }
  ].filter(item => item.value > 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatShortCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}tr`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k`;
    }
    return amount;
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

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    const headers = ['Mã GD', 'Thời gian', 'Khách hàng', 'Số mục', 'Tạm tính', 'Giảm giá', 'Tổng', 'PT Thanh toán'];
    const rows = filteredTransactions.map(t => [
      t.id,
      formatDateTime(t.timestamp),
      t.customerName,
      t.items.length,
      t.subtotal,
      t.discount || 0,
      t.total,
      t.paymentMethod === 'cash' ? 'Tiền mặt' : 'Thẻ'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `doanh-thu-${selectedMonth}.csv`;
    link.click();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Compact */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Báo cáo doanh thu</h1>
            <p className="text-xs text-gray-600">Theo dõi và phân tích doanh thu chi tiết</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4 text-xs">
            <div className="text-center">
              <p className="font-bold text-emerald-600 text-sm">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-gray-500">Tổng doanh thu</p>
              {stats.revenueGrowth !== 0 && (
                <p className={`text-[10px] font-medium ${stats.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.revenueGrowth > 0 ? '↑' : '↓'} {Math.abs(stats.revenueGrowth).toFixed(1)}%
                </p>
              )}
            </div>
            <div className="text-center">
              <p className="font-bold text-blue-600 text-sm">{stats.totalTransactions}</p>
              <p className="text-gray-500">Giao dịch</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-purple-600 text-sm">{formatCurrency(stats.averageTransaction)}</p>
              <p className="text-gray-500">TB/đơn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & View Modes - Compact */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex gap-2 flex-wrap items-center">
          {/* View Mode Tabs */}
          <div className="flex gap-1 bg-gray-100 p-0.5 rounded">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                viewMode === 'overview' 
                  ? 'bg-white text-emerald-600 font-semibold shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              data-testid="view-overview"
            >
              <i className="fa-solid fa-chart-pie mr-1" />
              Tổng quan
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                viewMode === 'daily' 
                  ? 'bg-white text-emerald-600 font-semibold shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              data-testid="view-daily"
            >
              <i className="fa-solid fa-calendar-day mr-1" />
              Chi tiết
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                viewMode === 'chart' 
                  ? 'bg-white text-emerald-600 font-semibold shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              data-testid="view-chart"
            >
              <i className="fa-solid fa-chart-line mr-1" />
              Biểu đồ
            </button>
          </div>

          <div className="h-5 w-px bg-gray-300"></div>

          {/* Month Picker */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="month-picker"
          />

          {/* Payment Filter */}
          <select
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            data-testid="payment-filter"
          >
            <option value="all">Tất cả PT</option>
            <option value="cash">Tiền mặt</option>
            <option value="card">Thẻ/CK</option>
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-[150px]">
            <input
              type="text"
              placeholder="Tìm mã GD, khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-6 pr-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              data-testid="search-transactions"
            />
            <i className="fa-solid fa-search absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]" />
          </div>

          {/* Export Button */}
          <motion.button
            onClick={exportToCSV}
            className="ml-auto px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs flex items-center gap-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-testid="export-csv"
          >
            <i className="fa-solid fa-download" />
            Xuất CSV
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-20">
            <i className="fa-solid fa-chart-line text-5xl text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">Chưa có giao dịch nào</p>
          </div>
        ) : (
          <>
            {/* Overview Mode */}
            {viewMode === 'overview' && (
              <div className="space-y-2">
                {/* Summary Cards - Compact */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-money-bill-trend-up text-emerald-600 text-sm" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-600">Tổng DT</p>
                        <p className="text-xs font-bold text-emerald-600 truncate">{formatShortCurrency(stats.totalRevenue)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-receipt text-blue-600 text-sm" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-600">Giao dịch</p>
                        <p className="text-xs font-bold text-gray-800">{stats.totalTransactions}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-chart-line text-purple-600 text-sm" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-600">TB/đơn</p>
                        <p className="text-xs font-bold text-gray-800 truncate">{formatShortCurrency(stats.averageTransaction)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-amber-100 rounded flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-tag text-amber-600 text-sm" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-600">Giảm giá</p>
                        <p className="text-xs font-bold text-amber-600 truncate">{formatShortCurrency(stats.totalDiscount)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method Cards */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xs font-semibold text-gray-800">Tiền mặt</h3>
                      <i className="fa-solid fa-money-bill text-green-600 text-lg" />
                    </div>
                    <p className="text-base font-bold text-green-600">{formatShortCurrency(stats.cashRevenue)}</p>
                    <p className="text-[10px] text-gray-500">{stats.cashTransactions} GD</p>
                  </div>

                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xs font-semibold text-gray-800">Thẻ/CK</h3>
                      <i className="fa-solid fa-credit-card text-blue-600 text-lg" />
                    </div>
                    <p className="text-base font-bold text-blue-600">{formatShortCurrency(stats.cardRevenue)}</p>
                    <p className="text-[10px] text-gray-500">{stats.cardTransactions} GD</p>
                  </div>
                </div>

                {/* Top Products/Services */}
                {stats.topItems.length > 0 && (
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-800 mb-2 flex items-center gap-1">
                      <i className="fa-solid fa-star text-yellow-500" />
                      Top 5 bán chạy
                    </h3>
                    <div className="space-y-1">
                      {stats.topItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-[10px] p-1 bg-gray-50 rounded">
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            <span className="font-semibold text-emerald-600 w-4 flex-shrink-0">#{index + 1}</span>
                            <span className="text-gray-800 truncate">{item.name}</span>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="font-bold text-emerald-600">{formatShortCurrency(item.revenue)}</p>
                            <p className="text-gray-500">{item.quantity} lượt</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chart Mode */}
            {viewMode === 'chart' && (
              <div className="space-y-2">
                {/* Daily Revenue Chart */}
                {dailyData.length > 0 && (
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-800 mb-2">Doanh thu theo ngày</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10 }}
                          stroke="#9ca3af"
                        />
                        <YAxis 
                          tick={{ fontSize: 10 }}
                          stroke="#9ca3af"
                          tickFormatter={formatShortCurrency}
                        />
                        <Tooltip 
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{ fontSize: 11 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981', r: 3 }}
                          name="Doanh thu"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Payment Method Pie Chart */}
                {paymentData.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <h3 className="text-xs font-semibold text-gray-800 mb-2">Phân bổ thanh toán</h3>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={paymentData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={50}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {paymentData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Top Items Bar Chart */}
                    {stats.topItems.length > 0 && (
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <h3 className="text-xs font-semibold text-gray-800 mb-2">Top 5 bán chạy</h3>
                        <ResponsiveContainer width="100%" height={150}>
                          <BarChart data={stats.topItems.slice(0, 5)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={formatShortCurrency} />
                            <YAxis 
                              dataKey="name" 
                              type="category" 
                              tick={{ fontSize: 9 }}
                              width={80}
                            />
                            <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ fontSize: 11 }} />
                            <Bar dataKey="revenue" fill="#3b82f6" name="Doanh thu" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Daily Details Mode */}
            {viewMode === 'daily' && (
              <div className="bg-white rounded border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-700">Mã GD</th>
                        <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-700">Thời gian</th>
                        <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-gray-700">Khách hàng</th>
                        <th className="px-2 py-1.5 text-right text-[10px] font-semibold text-gray-700">Số mục</th>
                        <th className="px-2 py-1.5 text-right text-[10px] font-semibold text-gray-700">Tạm tính</th>
                        <th className="px-2 py-1.5 text-right text-[10px] font-semibold text-gray-700">Giảm giá</th>
                        <th className="px-2 py-1.5 text-right text-[10px] font-semibold text-gray-700">Tổng</th>
                        <th className="px-2 py-1.5 text-center text-[10px] font-semibold text-gray-700">PT</th>
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
                          <td className="px-2 py-1.5 text-[10px] font-mono text-gray-600">
                            {transaction.id.substring(0, 8)}...
                          </td>
                          <td className="px-2 py-1.5 text-[10px] text-gray-600">
                            {formatDateTime(transaction.timestamp)}
                          </td>
                          <td className="px-2 py-1.5 text-[10px] text-gray-800 font-medium">
                            {transaction.customerName}
                          </td>
                          <td className="px-2 py-1.5 text-[10px] text-right text-gray-600">
                            {transaction.items?.length || 0}
                          </td>
                          <td className="px-2 py-1.5 text-[10px] text-right text-gray-800">
                            {formatShortCurrency(transaction.subtotal)}
                          </td>
                          <td className="px-2 py-1.5 text-[10px] text-right text-amber-600">
                            {transaction.discount > 0 ? `-${formatShortCurrency(transaction.discount)}` : '-'}
                          </td>
                          <td className="px-2 py-1.5 text-[10px] text-right font-semibold text-emerald-700">
                            {formatShortCurrency(transaction.total)}
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] rounded font-medium ${
                              transaction.paymentMethod === 'cash'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              <i className={`fa-solid ${transaction.paymentMethod === 'cash' ? 'fa-money-bill' : 'fa-credit-card'}`} />
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};