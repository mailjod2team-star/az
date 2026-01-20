import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoadingScreen } from './components/LoadingScreen';
import { ServicesPage } from './pages/ServicesPage';
import { ProductsPage } from './pages/ProductsPage';
import { CustomersPage } from './pages/CustomersPage';
import { MembershipPage } from './pages/MembershipPage';
import { CashierPage } from './pages/CashierPage';
import { BookingPage } from './pages/BookingPage';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    services: 0,
    products: 0,
    customers: 0,
    bookings: 0,
    revenue: 0
  });

  useEffect(() => {
    loadStats();
  }, [activeView]);

  const loadStats = () => {
    try {
      const services = JSON.parse(localStorage.getItem('salon_services') || '[]');
      const products = JSON.parse(localStorage.getItem('salon_products') || '[]');
      const customers = JSON.parse(localStorage.getItem('salon_customers') || '[]');
      const bookings = JSON.parse(localStorage.getItem('salon_bookings') || '[]');
      const transactions = JSON.parse(localStorage.getItem('salon_transactions') || '[]');

      const todayBookings = bookings.filter(b => b.date === new Date().toISOString().split('T')[0]);
      const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);

      setStats({
        services: services.filter(s => s.status === 'active').length,
        products: products.filter(p => p.status === 'active').length,
        customers: customers.filter(c => c.status === 'active').length,
        bookings: todayBookings.length,
        revenue: totalRevenue
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'services':
        return <ServicesPage />;
      case 'products':
        return <ProductsPage />;
      case 'customers':
        return <CustomersPage />;
      case 'membership':
        return <MembershipPage />;
      case 'cashier':
        return <CashierPage />;
      case 'booking':
        return <BookingPage />;
      case 'dashboard':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Tổng quan</h1>
            <p className="text-gray-600 mb-6">Chào mừng đến với hệ thống POS Salon!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-cut text-emerald-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dịch vụ</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.services}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-box text-orange-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sản phẩm</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.products}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-users text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Khách hàng</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.customers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-calendar-check text-purple-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lịch hôm nay</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.bookings}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-800">Tổng doanh thu</h3>
                  <i className="fa-solid fa-money-bill-trend-up text-3xl text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-emerald-700">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue)}
                </p>
                <p className="text-sm text-gray-600 mt-1">Từ tất cả giao dịch</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Truy cập nhanh</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveView('cashier')}
                    className="p-3 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 text-left transition-colors"
                  >
                    <i className="fa-solid fa-cash-register text-blue-600 text-xl mb-1" />
                    <p className="text-sm font-medium text-gray-800">Thu ngân</p>
                  </button>
                  <button
                    onClick={() => setActiveView('booking')}
                    className="p-3 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 text-left transition-colors"
                  >
                    <i className="fa-solid fa-calendar-plus text-purple-600 text-xl mb-1" />
                    <p className="text-sm font-medium text-gray-800">Đặt lịch</p>
                  </button>
                  <button
                    onClick={() => setActiveView('customers')}
                    className="p-3 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 text-left transition-colors"
                  >
                    <i className="fa-solid fa-user-plus text-pink-600 text-xl mb-1" />
                    <p className="text-sm font-medium text-gray-800">Khách hàng</p>
                  </button>
                  <button
                    onClick={() => setActiveView('services')}
                    className="p-3 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 text-left transition-colors"
                  >
                    <i className="fa-solid fa-cut text-emerald-600 text-xl mb-1" />
                    <p className="text-sm font-medium text-gray-800">Dịch vụ</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fa-solid fa-tools text-6xl text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Đang phát triển</h2>
              <p className="text-gray-500">Chức năng này đang được phát triển...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
      
      <div className="App min-h-screen bg-white text-gray-900 relative overflow-hidden">
        {/* Main Application */}
        <div className="relative flex flex-col h-screen">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar activeView={activeView} onNavigate={setActiveView} />
            <main className="flex-1 overflow-auto bg-gray-50">
              {renderContent()}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;