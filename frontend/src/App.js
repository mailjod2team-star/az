import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoadingScreen } from './components/LoadingScreen';
import DashboardPage from './pages/DashboardPage';
import { ServicesPage } from './pages/ServicesPage';
import { ProductsPage } from './pages/ProductsPage';
import { CustomersPage } from './pages/CustomersPage';
import { MembershipPage } from './pages/MembershipPage';
import { CashierPage } from './pages/CashierPage';
import { BookingPage } from './pages/BookingPage';
import { InventoryPage } from './pages/InventoryPage';
import { VoucherPage } from './pages/VoucherPage';
import { ExpensePage } from './pages/ExpensePage';
import { RevenuePage } from './pages/RevenuePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { StaffPage } from './pages/StaffPage';
import { MarketingPage } from './pages/MarketingPage';
import { TermsPage } from './pages/TermsPage';
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
      case 'dashboard':
        return <DashboardPage />;
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
      case 'inventory':
        return <InventoryPage />;
      case 'staff':
        return <StaffPage />;
      case 'voucher':
        return <VoucherPage />;
      case 'marketing':
        return <MarketingPage />;
      case 'expense':
        return <ExpensePage />;
      case 'revenue':
        return <RevenuePage />;
      case 'reports':
        return <ReportsPage />;
      case 'terms':
        return <TermsPage />;
      case 'settings':
        return <SettingsPage />;
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
          <Header onNavigate={setActiveView} />
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