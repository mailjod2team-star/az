import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TRANSACTIONS_KEY = 'salon_transactions';
const EXPENSES_KEY = 'salon_expenses';
const SERVICES_KEY = 'salon_services';
const PRODUCTS_KEY = 'salon_products';
const CUSTOMERS_KEY = 'salon_customers';

export const ReportsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setLoading(true);
      const storedTransactions = localStorage.getItem(TRANSACTIONS_KEY);
      const storedExpenses = localStorage.getItem(EXPENSES_KEY);
      const storedServices = localStorage.getItem(SERVICES_KEY);
      const storedProducts = localStorage.getItem(PRODUCTS_KEY);
      const storedCustomers = localStorage.getItem(CUSTOMERS_KEY);

      if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
      if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
      if (storedServices) setServices(JSON.parse(storedServices));
      if (storedProducts) setProducts(JSON.parse(storedProducts));
      if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
  const filteredExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));

  // Revenue calculations
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalRevenue - totalExpense;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  // Top services
  const serviceStats = {};
  filteredTransactions.forEach(transaction => {
    transaction.items.forEach(item => {
      if (item.type === 'service') {
        if (!serviceStats[item.id]) {
          serviceStats[item.id] = {
            id: item.id,
            name: item.name,
            count: 0,
            revenue: 0
          };
        }
        serviceStats[item.id].count += item.quantity;
        serviceStats[item.id].revenue += item.price * item.quantity;
      }
    });
  });
  const topServices = Object.values(serviceStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top products
  const productStats = {};
  filteredTransactions.forEach(transaction => {
    transaction.items.forEach(item => {
      if (item.type === 'product') {
        if (!productStats[item.id]) {
          productStats[item.id] = {
            id: item.id,
            name: item.name,
            count: 0,
            revenue: 0
          };
        }
        productStats[item.id].count += item.quantity;
        productStats[item.id].revenue += item.price * item.quantity;
      }
    });
  });
  const topProducts = Object.values(productStats)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top customers
  const customerStats = {};
  filteredTransactions.forEach(transaction => {
    if (transaction.customerId !== 'GUEST') {
      if (!customerStats[transaction.customerId]) {
        customerStats[transaction.customerId] = {
          id: transaction.customerId,
          name: transaction.customerName,
          visits: 0,
          spent: 0
        };
      }
      customerStats[transaction.customerId].visits += 1;
      customerStats[transaction.customerId].spent += transaction.total;
    }
  });
  const topCustomers = Object.values(customerStats)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  // Daily revenue trend
  const dailyRevenue = {};
  filteredTransactions.forEach(transaction => {
    const date = transaction.date;
    if (!dailyRevenue[date]) {
      dailyRevenue[date] = 0;
    }
    dailyRevenue[date] += transaction.total;
  });
  const dailyRevenueArray = Object.entries(dailyRevenue)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7); // Last 7 days

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Báo cáo tổng hợp</h1>
        <p className="text-gray-600 text-sm">Phân tích kinh doanh và thống kê chi tiết</p>
      </div>

      {/* Month Selector */}
      <div className="mb-6">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          data-testid="month-picker"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <>
          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div 
              className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-lg border-2 border-emerald-200 shadow-sm"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                <i className="fa-solid fa-arrow-trend-up text-emerald-600 text-xl" />
              </div>
              <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-gray-500 mt-1">{filteredTransactions.length} giao dịch</p>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-lg border-2 border-red-200 shadow-sm"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Chi phí</p>
                <i className="fa-solid fa-arrow-trend-down text-red-600 text-xl" />
              </div>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(totalExpense)}</p>
              <p className="text-xs text-gray-500 mt-1">{filteredExpenses.length} khoản chi</p>
            </motion.div>

            <motion.div 
              className={`bg-gradient-to-br ${profit >= 0 ? 'from-blue-50 to-indigo-50 border-blue-200' : 'from-gray-50 to-slate-50 border-gray-300'} p-5 rounded-lg border-2 shadow-sm`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Lợi nhuận</p>
                <i className={`fa-solid fa-wallet ${profit >= 0 ? 'text-blue-600' : 'text-gray-600'} text-xl`} />
              </div>
              <p className={`text-2xl font-bold ${profit >= 0 ? 'text-blue-700' : 'text-gray-700'}`}>
                {formatCurrency(profit)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Biện lợi: {profitMargin.toFixed(1)}%</p>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-lg border-2 border-purple-200 shadow-sm"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Khách hàng</p>
                <i className="fa-solid fa-users text-purple-600 text-xl" />
              </div>
              <p className="text-2xl font-bold text-purple-700">{customers.filter(c => c.status === 'active').length}</p>
              <p className="text-xs text-gray-500 mt-1">Tổng: {customers.length}</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Services */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa-solid fa-cut text-emerald-600 text-xl" />
                <h3 className="text-lg font-bold text-gray-800">Top 5 dịch vụ</h3>
              </div>
              {topServices.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-3">
                  {topServices.map((service, index) => (
                    <div key={service.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-emerald-700">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{service.name}</p>
                        <p className="text-xs text-gray-500">{service.count} lượt</p>
                      </div>
                      <p className="font-semibold text-emerald-700 text-sm">
                        {formatCurrency(service.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa-solid fa-box text-orange-600 text-xl" />
                <h3 className="text-lg font-bold text-gray-800">Top 5 sản phẩm</h3>
              </div>
              {topProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-orange-700">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.count} đã bán</p>
                      </div>
                      <p className="font-semibold text-orange-700 text-sm">
                        {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Customers */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa-solid fa-star text-amber-600 text-xl" />
                <h3 className="text-lg font-bold text-gray-800">Top 5 khách hàng VIP</h3>
              </div>
              {topCustomers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-3">
                  {topCustomers.map((customer, index) => (
                    <div key={customer.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-amber-700">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.visits} lần</p>
                      </div>
                      <p className="font-semibold text-amber-700 text-sm">
                        {formatCurrency(customer.spent)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Daily Revenue Trend */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa-solid fa-chart-line text-blue-600 text-xl" />
                <h3 className="text-lg font-bold text-gray-800">Doanh thu 7 ngày gần đây</h3>
              </div>
              {dailyRevenueArray.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-2">
                  {dailyRevenueArray.map(([date, revenue]) => {
                    const maxRevenue = Math.max(...dailyRevenueArray.map(([, r]) => r));
                    const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                    
                    return (
                      <div key={date}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{new Date(date).toLocaleDateString('vi-VN')}</span>
                          <span className="font-semibold text-blue-700">{formatCurrency(revenue)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <i className="fa-solid fa-cut text-teal-600 text-2xl mb-2" />
              <p className="text-2xl font-bold text-gray-800">{services.filter(s => s.status === 'active').length}</p>
              <p className="text-sm text-gray-600">Dịch vụ</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <i className="fa-solid fa-box text-orange-600 text-2xl mb-2" />
              <p className="text-2xl font-bold text-gray-800">{products.filter(p => p.status === 'active').length}</p>
              <p className="text-sm text-gray-600">Sản phẩm</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <i className="fa-solid fa-receipt text-blue-600 text-2xl mb-2" />
              <p className="text-2xl font-bold text-gray-800">{filteredTransactions.length}</p>
              <p className="text-sm text-gray-600">Giao dịch</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <i className="fa-solid fa-money-bill text-red-600 text-2xl mb-2" />
              <p className="text-2xl font-bold text-gray-800">{filteredExpenses.length}</p>
              <p className="text-sm text-gray-600">Chi phí</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};