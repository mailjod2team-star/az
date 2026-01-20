import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

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
  const [selectedPeriod, setSelectedPeriod] = useState('month');
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

  // Filter data based on selected period
  const getFilteredData = () => {
    const now = new Date();

    if (selectedPeriod === 'month') {
      return {
        transactions: transactions.filter(t => t.date.startsWith(selectedMonth)),
        expenses: expenses.filter(e => e.date.startsWith(selectedMonth))
      };
    } else if (selectedPeriod === 'quarter') {
      const currentMonth = now.getMonth();
      const quarterStart = Math.floor(currentMonth / 3) * 3;
      const quarterDate = new Date(now.getFullYear(), quarterStart, 1);
      return {
        transactions: transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= quarterDate && tDate <= now;
        }),
        expenses: expenses.filter(e => {
          const eDate = new Date(e.date);
          return eDate >= quarterDate && eDate <= now;
        })
      };
    } else {
      return {
        transactions: transactions.filter(t => new Date(t.date).getFullYear() === now.getFullYear()),
        expenses: expenses.filter(e => new Date(e.date).getFullYear() === now.getFullYear())
      };
    }
  };

  const { transactions: filteredTransactions, expenses: filteredExpenses } = getFilteredData();

  // Revenue calculations
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalRevenue - totalExpense;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  // Top services
  const serviceStats = {};
  filteredTransactions.forEach(transaction => {
    if (transaction.items) {
      transaction.items.forEach(item => {
        if (item.type === 'service') {
          if (!serviceStats[item.id]) {
            serviceStats[item.id] = { id: item.id, name: item.name, count: 0, revenue: 0 };
          }
          serviceStats[item.id].count += item.quantity || 1;
          serviceStats[item.id].revenue += item.price * (item.quantity || 1);
        }
      });
    }
  });
  const topServices = Object.values(serviceStats).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Top products
  const productStats = {};
  filteredTransactions.forEach(transaction => {
    if (transaction.items) {
      transaction.items.forEach(item => {
        if (item.type === 'product') {
          if (!productStats[item.id]) {
            productStats[item.id] = { id: item.id, name: item.name, count: 0, revenue: 0 };
          }
          productStats[item.id].count += item.quantity || 1;
          productStats[item.id].revenue += item.price * (item.quantity || 1);
        }
      });
    }
  });
  const topProducts = Object.values(productStats).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Top customers
  const customerStats = {};
  filteredTransactions.forEach(transaction => {
    if (transaction.customerId && transaction.customerId !== 'GUEST') {
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
  const topCustomers = Object.values(customerStats).sort((a, b) => b.spent - a.spent).slice(0, 5);

  // Generate revenue chart data
  const generateRevenueChartData = () => {
    const data = [];
    const days = selectedPeriod === 'month' ? 30 : selectedPeriod === 'quarter' ? 90 : 365;
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTransactions = filteredTransactions.filter(t => t.date === dateStr);
      const dayExpenses = filteredExpenses.filter(e => e.date === dateStr);
      
      const revenue = dayTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
      const expense = dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      data.push({
        date: selectedPeriod === 'year' ? dateStr.slice(5, 10) : dateStr.slice(5, 10),
        revenue: revenue,
        expense: expense,
        profit: revenue - expense,
      });
    }

    return data;
  };

  const revenueChartData = generateRevenueChartData();

  // Revenue by payment method
  const cashRevenue = filteredTransactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.total, 0);
  const cardRevenue = filteredTransactions.filter(t => t.paymentMethod === 'card').reduce((sum, t) => sum + t.total, 0);

  // Revenue by category
  const serviceRevenue = filteredTransactions.reduce((sum, t) => {
    const serviceItems = t.items?.filter(item => item.type === 'service') || [];
    return sum + serviceItems.reduce((s, item) => s + (item.price * (item.quantity || 1)), 0);
  }, 0);

  const productRevenue = filteredTransactions.reduce((sum, t) => {
    const productItems = t.items?.filter(item => item.type === 'product') || [];
    return sum + productItems.reduce((s, item) => s + (item.price * item.quantity), 0);
  }, 0);

  const categoryData = [
    { name: 'Dịch vụ', value: serviceRevenue, color: '#10b981' },
    { name: 'Sản phẩm', value: productRevenue, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  const paymentMethodData = [
    { name: 'Tiền mặt', value: cashRevenue, color: '#22c55e' },
    { name: 'Thẻ/CK', value: cardRevenue, color: '#3b82f6' }
  ].filter(item => item.value > 0);

  // Expense breakdown
  const expensesByCategory = {};
  filteredExpenses.forEach(e => {
    const category = e.category || 'Khác';
    expensesByCategory[category] = (expensesByCategory[category] || 0) + e.amount;
  });
  
  const expenseCategoryData = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#ef4444'];

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Báo cáo doanh thu</h1>
            <p className="text-xs text-gray-600">Phân tích kinh doanh chi tiết</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="w-auto">
              <TabsList className="h-8">
                <TabsTrigger value="month" className="text-xs px-3 py-1">Tháng</TabsTrigger>
                <TabsTrigger value="quarter" className="text-xs px-3 py-1">Quý</TabsTrigger>
                <TabsTrigger value="year" className="text-xs px-3 py-1">Năm</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {selectedPeriod === 'month' && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                data-testid="month-picker"
              />
            )}
          </div>
        </div>
      </div>

      <div className="p-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="space-y-2 max-w-full">
            {/* Financial Summary Cards - Compact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500" data-testid="revenue-card">
                <CardContent className="p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-7 h-7 bg-emerald-100 rounded flex items-center justify-center">
                      <i className="fa-solid fa-money-bill-trend-up text-emerald-600 text-xs" />
                    </div>
                    <Badge variant="default" className="text-[10px] bg-emerald-500 px-1 py-0">
                      {filteredTransactions.length} GD
                    </Badge>
                  </div>
                  <p className="text-[10px] font-medium text-gray-500 uppercase mb-0.5">Tổng doanh thu</p>
                  <p className="text-base font-bold text-emerald-600">{formatCurrency(totalRevenue)}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    TB/đơn: <span className="font-semibold text-gray-600">
                      {formatCurrency(filteredTransactions.length > 0 ? totalRevenue / filteredTransactions.length : 0)}
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500" data-testid="expense-card">
                <CardContent className="p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-7 h-7 bg-red-100 rounded flex items-center justify-center">
                      <i className="fa-solid fa-money-bill-transfer text-red-600 text-xs" />
                    </div>
                    <Badge variant="destructive" className="text-[10px] px-1 py-0">
                      {filteredExpenses.length} khoản
                    </Badge>
                  </div>
                  <p className="text-[10px] font-medium text-gray-500 uppercase mb-0.5">Tổng chi phí</p>
                  <p className="text-base font-bold text-red-600">{formatCurrency(totalExpense)}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    TB/khoản: <span className="font-semibold text-gray-600">
                      {formatCurrency(filteredExpenses.length > 0 ? totalExpense / filteredExpenses.length : 0)}
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${profit >= 0 ? 'border-l-blue-500' : 'border-l-gray-400'}`} data-testid="profit-card">
                <CardContent className="p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className={`w-7 h-7 ${profit >= 0 ? 'bg-blue-100' : 'bg-gray-100'} rounded flex items-center justify-center`}>
                      <i className={`fa-solid fa-hand-holding-dollar ${profit >= 0 ? 'text-blue-600' : 'text-gray-600'} text-xs`} />
                    </div>
                    <Badge variant={profit >= 0 ? "default" : "secondary"} className={`text-[10px] px-1 py-0 ${profit >= 0 ? 'bg-blue-500' : ''}`}>
                      {profitMargin.toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-[10px] font-medium text-gray-500 uppercase mb-0.5">Lợi nhuận ròng</p>
                  <p className={`text-base font-bold ${profit >= 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                    {formatCurrency(profit)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Tỷ suất lợi nhuận
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500" data-testid="customers-card">
                <CardContent className="p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-7 h-7 bg-purple-100 rounded flex items-center justify-center">
                      <i className="fa-solid fa-users text-purple-600 text-xs" />
                    </div>
                    <Badge variant="default" className="text-[10px] bg-purple-500 px-1 py-0">
                      Active
                    </Badge>
                  </div>
                  <p className="text-[10px] font-medium text-gray-500 uppercase mb-0.5">Khách hàng</p>
                  <p className="text-base font-bold text-purple-600">
                    {customers.filter(c => c.status === 'active').length}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Tổng: <span className="font-semibold text-gray-600">{customers.length}</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Charts Section */}
            <Tabs defaultValue="overview" className="space-y-2">
              <TabsList className="grid w-full grid-cols-3 h-8">
                <TabsTrigger value="overview" className="text-xs">Tổng quan</TabsTrigger>
                <TabsTrigger value="analysis" className="text-xs">Phân tích</TabsTrigger>
                <TabsTrigger value="top-items" className="text-xs">Top bán chạy</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-2">
                {/* Revenue Trend Chart */}
                <Card data-testid="revenue-trend-chart">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <i className="fa-solid fa-chart-line text-emerald-600 text-xs" />
                      Biểu đồ doanh thu & lợi nhuận
                    </CardTitle>
                    <CardDescription className="text-[10px]">Theo dõi xu hướng kinh doanh</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <ResponsiveContainer width="100%" height={280}>
                      <ComposedChart data={revenueChartData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip 
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '11px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          name="Doanh thu"
                          stroke="#10b981" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="expense" 
                          name="Chi phí"
                          stroke="#ef4444" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorExpense)" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="profit" 
                          name="Lợi nhuận"
                          stroke="#3b82f6" 
                          strokeWidth={2}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Category & Payment Method Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <Card data-testid="category-distribution">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <i className="fa-solid fa-chart-pie text-purple-600 text-xs" />
                        Doanh thu theo danh mục
                      </CardTitle>
                      <CardDescription className="text-[10px]">Phân bổ dịch vụ & sản phẩm</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      {categoryData.length > 0 ? (
                        <>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {categoryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="mt-2 space-y-1">
                            {categoryData.map((item, index) => (
                              <div key={index} className="flex items-center justify-between text-[10px]">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2 h-2 rounded" style={{ backgroundColor: item.color }} />
                                  <span className="text-gray-600">{item.name}</span>
                                </div>
                                <span className="font-semibold">{formatCurrency(item.value)}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <i className="fa-solid fa-chart-pie text-3xl mb-2 text-gray-300" />
                          <p className="text-xs">Chưa có dữ liệu</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card data-testid="payment-method-distribution">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <i className="fa-solid fa-credit-card text-blue-600 text-xs" />
                        Doanh thu theo thanh toán
                      </CardTitle>
                      <CardDescription className="text-[10px]">Phân bổ phương thức thanh toán</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      {paymentMethodData.length > 0 ? (
                        <>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={paymentMethodData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {paymentMethodData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="mt-2 space-y-1">
                            {paymentMethodData.map((item, index) => (
                              <div key={index} className="flex items-center justify-between text-[10px]">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2 h-2 rounded" style={{ backgroundColor: item.color }} />
                                  <span className="text-gray-600">{item.name}</span>
                                </div>
                                <span className="font-semibold">{formatCurrency(item.value)}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <i className="fa-solid fa-credit-card text-3xl mb-2 text-gray-300" />
                          <p className="text-xs">Chưa có dữ liệu</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-2">
                {/* Expense Breakdown */}
                <Card data-testid="expense-breakdown">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <i className="fa-solid fa-chart-column text-red-600 text-xs" />
                      Phân tích chi phí theo danh mục
                    </CardTitle>
                    <CardDescription className="text-[10px]">Top 5 danh mục chi phí cao nhất</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    {expenseCategoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={expenseCategoryData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip 
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '11px' }}
                          />
                          <Bar dataKey="value" name="Chi phí" radius={[8, 8, 0, 0]}>
                            {expenseCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-20 text-gray-500">
                        <i className="fa-solid fa-chart-column text-4xl mb-3 text-gray-300" />
                        <p className="text-sm font-medium">Chưa có dữ liệu chi phí</p>
                        <p className="text-xs mt-1">Thêm chi phí để xem phân tích</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="p-2 text-center">
                      <i className="fa-solid fa-cut text-teal-600 text-lg mb-1" />
                      <p className="text-base font-bold text-gray-800">{services.filter(s => s.status === 'active').length}</p>
                      <p className="text-[10px] text-gray-600">Dịch vụ</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-50 to-amber-50">
                    <CardContent className="p-2 text-center">
                      <i className="fa-solid fa-box text-orange-600 text-lg mb-1" />
                      <p className="text-base font-bold text-gray-800">{products.filter(p => p.status === 'active').length}</p>
                      <p className="text-[10px] text-gray-600">Sản phẩm</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardContent className="p-2 text-center">
                      <i className="fa-solid fa-receipt text-blue-600 text-lg mb-1" />
                      <p className="text-base font-bold text-gray-800">{filteredTransactions.length}</p>
                      <p className="text-[10px] text-gray-600">Giao dịch</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-red-50 to-rose-50">
                    <CardContent className="p-2 text-center">
                      <i className="fa-solid fa-money-bill text-red-600 text-lg mb-1" />
                      <p className="text-base font-bold text-gray-800">{filteredExpenses.length}</p>
                      <p className="text-[10px] text-gray-600">Chi phí</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="top-items" className="space-y-2">
                {/* Top Services & Products */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  <Card data-testid="top-services">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <i className="fa-solid fa-cut text-emerald-600 text-xs" />
                        Top 5 dịch vụ
                      </CardTitle>
                      <CardDescription className="text-[10px]">Dịch vụ có doanh thu cao nhất</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      {topServices.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <i className="fa-solid fa-cut text-3xl mb-2 text-gray-300" />
                          <p className="text-xs">Chưa có dữ liệu</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {topServices.map((service, index) => (
                            <div key={service.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-bold text-emerald-700">#{index + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 text-xs truncate">{service.name}</p>
                                <p className="text-[10px] text-gray-500">{service.count} lượt</p>
                              </div>
                              <p className="font-semibold text-emerald-700 text-xs">
                                {formatCurrency(service.revenue)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card data-testid="top-products">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <i className="fa-solid fa-box text-orange-600 text-xs" />
                        Top 5 sản phẩm
                      </CardTitle>
                      <CardDescription className="text-[10px]">Sản phẩm có doanh thu cao nhất</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      {topProducts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <i className="fa-solid fa-box text-3xl mb-2 text-gray-300" />
                          <p className="text-xs">Chưa có dữ liệu</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {topProducts.map((product, index) => (
                            <div key={product.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-bold text-orange-700">#{index + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 text-xs truncate">{product.name}</p>
                                <p className="text-[10px] text-gray-500">{product.count} đã bán</p>
                              </div>
                              <p className="font-semibold text-orange-700 text-xs">
                                {formatCurrency(product.revenue)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Top Customers */}
                <Card data-testid="top-customers">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <i className="fa-solid fa-star text-amber-600 text-xs" />
                      Top 5 khách hàng VIP
                    </CardTitle>
                    <CardDescription className="text-[10px]">Khách hàng chi tiêu cao nhất</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    {topCustomers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <i className="fa-solid fa-star text-3xl mb-2 text-gray-300" />
                        <p className="text-xs">Chưa có dữ liệu</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {topCustomers.map((customer, index) => (
                          <div key={customer.id} className="flex items-center gap-2 p-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded hover:shadow transition-all">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-white">#{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 text-xs truncate">{customer.name}</p>
                              <p className="text-[10px] text-gray-500">{customer.visits} lượt</p>
                            </div>
                            <p className="font-semibold text-amber-700 text-xs">
                              {formatCurrency(customer.spent)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};
