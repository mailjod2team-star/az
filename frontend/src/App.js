import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoadingScreen } from './components/LoadingScreen';
import { ServicesPage } from './pages/ServicesPage';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  const renderContent = () => {
    switch (activeView) {
      case 'services':
        return <ServicesPage />;
      case 'dashboard':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>
            <p className="text-gray-600">Chào mừng đến với hệ thống POS Salon!</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-cut text-emerald-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dịch vụ</p>
                    <p className="text-2xl font-bold text-gray-800">4</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-users text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Khách hàng</p>
                    <p className="text-2xl font-bold text-gray-800">0</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-calendar-check text-purple-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lịch hẹn</p>
                    <p className="text-2xl font-bold text-gray-800">0</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-money-bill text-emerald-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Doanh thu</p>
                    <p className="text-2xl font-bold text-gray-800">0đ</p>
                  </div>
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