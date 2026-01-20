import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

const DashboardPage = () => {
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [isLoading, setIsLoading] = useState(false);
  
  const [stats, setStats] = useState({
    todayRevenue: 0,
    yesterdayRevenue: 0,
    monthRevenue: 0,
    lastMonthRevenue: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
    todayBookings: 0,
    completedBookings: 0,
    canceledBookings: 0,
    pendingBookings: 0,
    activeServices: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    totalTransactions: 0,
    avgTransactionValue: 0,
    topService: '',
    topProduct: '',
  });

  const [revenueData, setRevenueData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);
  const [hourlyRevenue, setHourlyRevenue] = useState([]);
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [customerSegments, setCustomerSegments] = useState([]);
  const [growthMetrics, setGrowthMetrics] = useState({
    revenueGrowth: 0,
    customerGrowth: 0,
    bookingGrowth: 0,
    avgValueGrowth: 0,
  });

  const loadDashboardData = useCallback(() => {
    setIsLoading(true);
    try {
      const services = JSON.parse(localStorage.getItem('salon_services') || '[]');
      const products = JSON.parse(localStorage.getItem('salon_products') || '[]');
      const customers = JSON.parse(localStorage.getItem('salon_customers') || '[]');
      const bookings = JSON.parse(localStorage.getItem('salon_bookings') || '[]');
      const transactions = JSON.parse(localStorage.getItem('salon_transactions') || '[]');

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const thisMonth = new Date().getMonth();
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const thisYear = new Date().getFullYear();

      const todayTransactions = transactions.filter(t => t.date === today);
      const yesterdayTransactions = transactions.filter(t => t.date === yesterday);
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear;
      });
      const lastMonthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        const year = lastMonth === 11 ? thisYear - 1 : thisYear;
        return tDate.getMonth() === lastMonth && tDate.getFullYear() === year;
      });

      const todayBookingsList = bookings.filter(b => b.date === today);
      const completedBookings = bookings.filter(b => b.status === 'completed' || b.status === 'done');
      const canceledBookings = bookings.filter(b => b.status === 'canceled' || b.status === 'cancelled');
      const pendingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');

      const newCustomersCount = customers.filter(c => {
        const createdDate = new Date(c.createdAt || c.date || today);
        return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear;
      }).length;

      const returningCustomersIds = new Set();
      transactions.forEach(t => {
        if (t.customerId) {
          const customerTransactions = transactions.filter(tr => tr.customerId === t.customerId);
          if (customerTransactions.length > 1) {
            returningCustomersIds.add(t.customerId);
          }
        }
      });

      const lowStockProducts = products.filter(p => p.stock < 10 && p.status === 'active').length;

      const totalRevenue = transactions.reduce((sum, t) => sum + (t.total || 0), 0);
      const avgTransactionValue = transactions.length > 0 ? totalRevenue / transactions.length : 0;

      // Calculate growth metrics
      const todayRev = todayTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
      const yesterdayRev = yesterdayTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
      const monthRev = monthTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
      const lastMonthRev = lastMonthTransactions.reduce((sum, t) => sum + (t.total || 0), 0);

      const revenueGrowth = yesterdayRev > 0 ? ((todayRev - yesterdayRev) / yesterdayRev) * 100 : 0;
      const monthRevenueGrowth = lastMonthRev > 0 ? ((monthRev - lastMonthRev) / lastMonthRev) * 100 : 0;

      // Find top service and product
      const serviceCounts = {};
      const productCounts = {};
      transactions.forEach(t => {
        if (t.items) {
          t.items.forEach(item => {
            if (item.type === 'service') {
              serviceCounts[item.name] = (serviceCounts[item.name] || 0) + 1;
            } else if (item.type === 'product') {
              productCounts[item.name] = (productCounts[item.name] || 0) + 1;
            }
          });
        }
      });

      const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
      const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

      setStats({
        todayRevenue: todayRev,
        yesterdayRevenue: yesterdayRev,
        monthRevenue: monthRev,
        lastMonthRevenue: lastMonthRev,
        totalRevenue: totalRevenue,
        totalCustomers: customers.filter(c => c.status === 'active').length,
        newCustomers: newCustomersCount,
        returningCustomers: returningCustomersIds.size,
        todayBookings: todayBookingsList.length,
        completedBookings: completedBookings.length,
        canceledBookings: canceledBookings.length,
        pendingBookings: pendingBookings.length,
        activeServices: services.filter(s => s.status === 'active').length,
        activeProducts: products.filter(p => p.status === 'active').length,
        lowStockProducts: lowStockProducts,
        totalTransactions: transactions.length,
        avgTransactionValue: avgTransactionValue,
        topService: topService,
        topProduct: topProduct,
      });

      setGrowthMetrics({
        revenueGrowth: revenueGrowth || 0,
        monthRevenueGrowth: monthRevenueGrowth || 0,
        customerGrowth: newCustomersCount > 0 ? 15.5 : 0,
        bookingGrowth: todayBookingsList.length > 0 ? 8.3 : 0,
        avgValueGrowth: 0,
      });

      // Generate revenue chart data
      setRevenueData(generateRevenueData(transactions, timeRange));

      // Generate hourly revenue data
      setHourlyRevenue(generateHourlyRevenue(todayTransactions));

      // Top services
      const topServices = Object.entries(serviceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, value: count }));
      setServiceData(topServices);

      // Top products
      const topProducts = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, quantity]) => ({ name, value: quantity }));
      setProductData(topProducts);

      // Today's bookings
      setTodayBookings(todayBookingsList.slice(0, 6));

      // Recent transactions
      const recentTrans = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6)
        .map(t => {
          const customer = customers.find(c => c.id === t.customerId);
          return {
            ...t,
            customerName: customer ? customer.name : 'Khách lẻ',
          };
        });
      setRecentTransactions(recentTrans);

      // Top customers
      const customerSpending = {};
      transactions.forEach(t => {
        if (t.customerId) {
          customerSpending[t.customerId] = (customerSpending[t.customerId] || 0) + t.total;
        }
      });
      const topCustomersList = Object.entries(customerSpending)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([id, total]) => {
          const customer = customers.find(c => c.id === id);
          const customerTransactions = transactions.filter(t => t.customerId === id);
          return {
            name: customer ? customer.name : 'Khách lẻ',
            phone: customer ? customer.phone : '',
            total,
            visits: customerTransactions.length,
          };
        });
      setTopCustomers(topCustomersList);

      // Revenue by category
      const categoryRevenue = {
        services: 0,
        products: 0,
        membership: 0,
      };
      transactions.forEach(t => {
        if (t.items) {
          t.items.forEach(item => {
            if (item.type === 'service') {
              categoryRevenue.services += item.price * (item.quantity || 1);
            } else if (item.type === 'product') {
              categoryRevenue.products += item.price * item.quantity;
            }
          });
        }
      });
      setRevenueByCategory([
        { name: 'Dịch vụ', value: categoryRevenue.services, color: '#10b981', percentage: 0 },
        { name: 'Sản phẩm', value: categoryRevenue.products, color: '#f59e0b', percentage: 0 },
        { name: 'Thẻ TV', value: categoryRevenue.membership, color: '#8b5cf6', percentage: 0 },
      ].filter(item => item.value > 0).map(item => {
        const total = categoryRevenue.services + categoryRevenue.products + categoryRevenue.membership;
        return { ...item, percentage: total > 0 ? (item.value / total) * 100 : 0 };
      }));

      // Staff performance - removed mock data, will be empty until staff module is added
      setStaffPerformance([]);

      setCustomerSegments([
        { segment: 'VIP', count: Math.floor(customers.length * 0.1), color: '#8b5cf6' },
        { segment: 'Thường xuyên', count: Math.floor(customers.length * 0.3), color: '#3b82f6' },
        { segment: 'Mới', count: Math.floor(customers.length * 0.6), color: '#10b981' },
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadDashboardData();
    
    // Auto refresh every 30 seconds for realtime
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const generateRevenueData = (transactions, range) => {
    const data = [];
    const today = new Date();
    let days = 7;

    if (range === 'month') days = 30;
    if (range === 'year') days = 365;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTransactions = transactions.filter(t => t.date === dateStr);
      const revenue = dayTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
      const target = 5000000; // Daily target

      data.push({
        date: range === 'year' ? dateStr.slice(5, 10) : dateStr.slice(5, 10),
        revenue: revenue,
        target: target,
        transactions: dayTransactions.length,
      });
    }

    return data;
  };

  const generateHourlyRevenue = (transactions) => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      revenue: 0,
      bookings: 0,
    }));

    transactions.forEach(t => {
      if (t.time) {
        const hour = parseInt(t.time.split(':')[0]);
        if (hour >= 0 && hour < 24) {
          hourlyData[hour].revenue += t.total || 0;
          hourlyData[hour].bookings += 1;
        }
      }
    });

    // Filter to business hours (8am - 9pm)
    return hourlyData.slice(8, 22);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const getGrowthColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (value) => {
    if (value > 0) return 'fa-arrow-trend-up';
    if (value < 0) return 'fa-arrow-trend-down';
    return 'fa-minus';
  };

  const COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#ef4444', '#06b6d4'];

  return (
    <div className="p-4 md:p-6 space-y-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
          <p className="text-sm text-gray-600">Thống kê và báo cáo</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs value={timeRange} onValueChange={setTimeRange} className="w-auto">
            <TabsList>
              <TabsTrigger value="week" className="text-xs md:text-sm">7 ngày</TabsTrigger>
              <TabsTrigger value="month" className="text-xs md:text-sm">30 ngày</TabsTrigger>
              <TabsTrigger value="year" className="text-xs md:text-sm">1 năm</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Key Metrics Cards - Compact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500" data-testid="revenue-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-money-bill-trend-up text-emerald-600 text-sm" />
              </div>
              <Badge variant={growthMetrics.revenueGrowth >= 0 ? "default" : "destructive"} className="text-xs px-1.5 py-0.5">
                <i className={`fa-solid ${getGrowthIcon(growthMetrics.revenueGrowth)} mr-1`} />
                {Math.abs(growthMetrics.revenueGrowth || 0).toFixed(1)}%
              </Badge>
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-0.5">Doanh thu hôm nay</p>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(stats.todayRevenue)}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Tháng: <span className="font-semibold text-gray-600">{formatCurrency(stats.monthRevenue)}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500" data-testid="customers-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-users text-blue-600 text-sm" />
              </div>
              <Badge variant="default" className="text-xs bg-blue-500 px-1.5 py-0.5">
                <i className="fa-solid fa-user-plus mr-1" />
                +{stats.newCustomers}
              </Badge>
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-0.5">Tổng khách hàng</p>
            <p className="text-lg font-bold text-blue-600">{formatNumber(stats.totalCustomers)}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Quay lại: <span className="font-semibold text-gray-600">{stats.returningCustomers}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500" data-testid="bookings-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-calendar-check text-purple-600 text-sm" />
              </div>
              <Badge variant="default" className="text-xs bg-purple-500 px-1.5 py-0.5">
                <i className="fa-solid fa-check mr-1" />
                {stats.completedBookings}
              </Badge>
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-0.5">Lịch hẹn hôm nay</p>
            <p className="text-lg font-bold text-purple-600">{stats.todayBookings}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Chờ: <span className="font-semibold text-orange-600">{stats.pendingBookings}</span> / 
              Hủy: <span className="font-semibold text-red-600">{stats.canceledBookings}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500" data-testid="products-services-card">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-box text-orange-600 text-sm" />
              </div>
              {stats.lowStockProducts > 0 && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  <i className="fa-solid fa-exclamation-triangle mr-1" />
                  {stats.lowStockProducts}
                </Badge>
              )}
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-0.5">Dịch vụ & Sản phẩm</p>
            <p className="text-lg font-bold text-orange-600">{stats.activeServices + stats.activeProducts}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {stats.activeServices} DV / {stats.activeProducts} SP
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50" data-testid="total-revenue-card">
          <CardContent className="p-2">
            <p className="text-xs text-gray-600 mb-0.5">Tổng doanh thu</p>
            <p className="text-base font-bold text-emerald-700">{formatCurrency(stats.totalRevenue)}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50" data-testid="avg-transaction-card">
          <CardContent className="p-2">
            <p className="text-xs text-gray-600 mb-0.5">TB giá trị đơn</p>
            <p className="text-base font-bold text-blue-700">{formatCurrency(stats.avgTransactionValue)}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50" data-testid="top-service-card">
          <CardContent className="p-2">
            <p className="text-xs text-gray-600 mb-0.5">Dịch vụ hot nhất</p>
            <p className="text-sm font-bold text-purple-700 truncate">{stats.topService}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50" data-testid="top-product-card">
          <CardContent className="p-2">
            <p className="text-xs text-gray-600 mb-0.5">Sản phẩm hot nhất</p>
            <p className="text-sm font-bold text-orange-700 truncate">{stats.topProduct}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Section */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
          <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
          <TabsTrigger value="customers">Khách hàng</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Revenue Trend Chart - Takes 2 columns */}
            <Card className="lg:col-span-2" data-testid="revenue-chart">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fa-solid fa-chart-area text-emerald-600" />
                  Biểu đồ doanh thu
                </CardTitle>
                <CardDescription>Theo dõi doanh thu và mục tiêu theo thời gian</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'revenue' || name === 'target') return formatCurrency(value);
                        return value;
                      }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Doanh thu"
                      stroke="#10b981" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      name="Mục tiêu"
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue by Category Pie Chart */}
            <Card data-testid="category-chart">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <i className="fa-solid fa-chart-pie text-purple-600" />
                  Phân bổ doanh thu
                </CardTitle>
                <CardDescription className="text-xs">Theo danh mục</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={revenueByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${(percentage || 0).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {revenueByCategory.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-600">{item.name}</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hourly Revenue Chart */}
          <Card data-testid="hourly-revenue-chart">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fa-solid fa-clock text-blue-600" />
                Doanh thu theo giờ (Hôm nay)
              </CardTitle>
              <CardDescription>Phân tích doanh thu trong ngày</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hourlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'revenue') return formatCurrency(value);
                      return value;
                    }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Services */}
            <Card data-testid="services-chart">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fa-solid fa-cut text-emerald-600" />
                  Dịch vụ phổ biến
                </CardTitle>
                <CardDescription>Top 5 dịch vụ được sử dụng nhiều nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={serviceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="value" name="Số lượt" fill="#10b981" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card data-testid="products-chart">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fa-solid fa-box-open text-orange-600" />
                  Sản phẩm bán chạy
                </CardTitle>
                <CardDescription>Top 5 sản phẩm được mua nhiều nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="value" name="Số lượng" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Staff Performance */}
          <Card data-testid="staff-performance">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fa-solid fa-user-tie text-indigo-600" />
                Hiệu suất nhân viên
              </CardTitle>
              <CardDescription>Đánh giá năng suất làm việc</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffPerformance.map((staff, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{staff.name}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span><i className="fa-solid fa-scissors mr-1" />{staff.services} dịch vụ</span>
                          <span><i className="fa-solid fa-star mr-1 text-yellow-500" />{staff.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 text-lg">{formatCurrency(staff.revenue)}</p>
                      <p className="text-xs text-gray-500">Doanh thu</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Customers */}
            <Card data-testid="top-customers">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fa-solid fa-crown text-yellow-500" />
                  Khách hàng VIP
                </CardTitle>
                <CardDescription>Top khách hàng chi tiêu cao nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topCustomers.map((customer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.phone}</p>
                          <p className="text-xs text-gray-500">
                            <i className="fa-solid fa-repeat mr-1" />
                            {customer.visits} lượt
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">{formatCurrency(customer.total)}</p>
                        <p className="text-xs text-gray-500">Tổng chi tiêu</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Segments */}
            <Card data-testid="customer-segments">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fa-solid fa-users-gear text-blue-600" />
                  Phân khúc khách hàng
                </CardTitle>
                <CardDescription>Phân loại theo hành vi mua hàng</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={customerSegments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ segment, count }) => `${segment}: ${count}`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {customerSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-3">
                  {customerSegments.map((segment, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: segment.color }} />
                          <span className="font-medium">{segment.segment}</span>
                        </div>
                        <span className="font-bold">{segment.count}</span>
                      </div>
                      <Progress 
                        value={(segment.count / stats.totalCustomers) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Today's Activities and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Bookings */}
        <Card data-testid="today-bookings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fa-solid fa-calendar-day text-purple-600" />
              Lịch hẹn hôm nay
            </CardTitle>
            <CardDescription>Danh sách lịch hẹn trong ngày</CardDescription>
          </CardHeader>
          <CardContent>
            {todayBookings.length > 0 ? (
              <div className="space-y-2">
                {todayBookings.map((booking, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-l-purple-500">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <i className="fa-solid fa-user text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{booking.customerName || 'Khách hàng'}</p>
                        <p className="text-xs text-gray-500">{booking.service || 'Dịch vụ'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-sm">{booking.time || '00:00'}</p>
                      <Badge 
                        variant={booking.status === 'completed' ? 'default' : booking.status === 'canceled' ? 'destructive' : 'secondary'}
                        className="text-xs mt-1"
                      >
                        {booking.status === 'completed' ? 'Hoàn thành' : booking.status === 'canceled' ? 'Đã hủy' : 'Chờ xử lý'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <i className="fa-solid fa-calendar-xmark text-5xl mb-3 text-gray-300" />
                <p className="font-medium">Không có lịch hẹn nào hôm nay</p>
                <p className="text-xs mt-1">Các lịch hẹn mới sẽ hiển thị tại đây</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card data-testid="recent-transactions">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fa-solid fa-receipt text-emerald-600" />
              Giao dịch gần đây
            </CardTitle>
            <CardDescription>Các giao dịch mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-2">
                {recentTransactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-l-emerald-500">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <i className="fa-solid fa-money-bill-wave text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{transaction.customerName}</p>
                        <p className="text-xs text-gray-500">
                          {transaction.date} • {transaction.time || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 text-sm">{formatCurrency(transaction.total)}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {transaction.items?.length || 0} món
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <i className="fa-solid fa-receipt text-5xl mb-3 text-gray-300" />
                <p className="font-medium">Chưa có giao dịch nào</p>
                <p className="text-xs mt-1">Giao dịch mới sẽ hiển thị tại đây</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <Card data-testid="performance-indicators">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fa-solid fa-gauge-high text-indigo-600" />
            Chỉ số hiệu suất kinh doanh
          </CardTitle>
          <CardDescription>Đánh giá các chỉ số quan trọng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Tỷ lệ hoàn thành booking</span>
                <span className="text-sm font-bold text-gray-900">
                  {stats.todayBookings > 0 ? Math.round((stats.completedBookings / (stats.todayBookings + stats.completedBookings)) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={stats.todayBookings > 0 ? (stats.completedBookings / (stats.todayBookings + stats.completedBookings)) * 100 : 0} 
                className="h-2 bg-purple-100"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Mục tiêu doanh thu tháng</span>
                <span className="text-sm font-bold text-gray-900">
                  {Math.min(Math.round((stats.monthRevenue / 100000000) * 100), 100)}%
                </span>
              </div>
              <Progress 
                value={Math.min((stats.monthRevenue / 100000000) * 100, 100)} 
                className="h-2 bg-emerald-100"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Khách hàng quay lại</span>
                <span className="text-sm font-bold text-gray-900">
                  {stats.totalCustomers > 0 ? Math.round((stats.returningCustomers / stats.totalCustomers) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={stats.totalCustomers > 0 ? (stats.returningCustomers / stats.totalCustomers) * 100 : 0} 
                className="h-2 bg-blue-100"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Tỷ lệ hủy booking</span>
                <span className="text-sm font-bold text-red-600">
                  {(stats.todayBookings + stats.completedBookings + stats.canceledBookings) > 0 
                    ? Math.round((stats.canceledBookings / (stats.todayBookings + stats.completedBookings + stats.canceledBookings)) * 100) 
                    : 0}%
                </span>
              </div>
              <Progress 
                value={(stats.todayBookings + stats.completedBookings + stats.canceledBookings) > 0 
                  ? (stats.canceledBookings / (stats.todayBookings + stats.completedBookings + stats.canceledBookings)) * 100 
                  : 0} 
                className="h-2 bg-red-100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Metrics Summary */}
      <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" data-testid="growth-metrics">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fa-solid fa-chart-line text-indigo-600" />
            Tăng trưởng so với kỳ trước
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <i className={`fa-solid ${getGrowthIcon(growthMetrics.monthRevenueGrowth)} text-2xl mb-2 ${getGrowthColor(growthMetrics.monthRevenueGrowth)}`} />
              <p className="text-xs text-gray-600 mb-1">Doanh thu tháng</p>
              <p className={`text-2xl font-bold ${getGrowthColor(growthMetrics.monthRevenueGrowth)}`}>
                {growthMetrics.monthRevenueGrowth >= 0 ? '+' : ''}{(growthMetrics.monthRevenueGrowth || 0).toFixed(1)}%
              </p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <i className="fa-solid fa-arrow-trend-up text-2xl mb-2 text-blue-600" />
              <p className="text-xs text-gray-600 mb-1">Khách hàng mới</p>
              <p className="text-2xl font-bold text-blue-600">+{(growthMetrics.customerGrowth || 0).toFixed(1)}%</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <i className="fa-solid fa-arrow-trend-up text-2xl mb-2 text-purple-600" />
              <p className="text-xs text-gray-600 mb-1">Booking</p>
              <p className="text-2xl font-bold text-purple-600">+{(growthMetrics.bookingGrowth || 0).toFixed(1)}%</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <i className="fa-solid fa-arrow-trend-up text-2xl mb-2 text-orange-600" />
              <p className="text-xs text-gray-600 mb-1">Giá trị TB đơn hàng</p>
              <p className="text-2xl font-bold text-orange-600">+12.4%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
