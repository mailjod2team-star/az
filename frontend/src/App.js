import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ProxyTable } from './components/ProxyTable';
import { LoadingScreen } from './components/LoadingScreen';
import { SOCDashboard } from './components/SOCDashboard';
import WorkflowBuilder from './components/WorkflowBuilder';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('soc-dashboard');
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
      
      <div className="App min-h-screen bg-gradient-to-br from-emerald-50 via-green-50/50 to-teal-100/80 text-gray-900 relative overflow-hidden">
        {/* Main Application */}
        <div className="relative flex flex-col h-screen">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar activeView={activeView} onNavigate={setActiveView} />
            <main className="flex-1 overflow-auto bg-gradient-to-br from-white/60 via-emerald-50/40 to-green-50/50">
              {activeView === 'soc-dashboard' && <SOCDashboard />}
              {activeView === 'profiles' && <ProxyTable />}
              {activeView === 'workflow' && <WorkflowBuilder />}
              {activeView === 'settings' && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-300 animate-float">
                      <i className="fa-solid fa-gear text-5xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Cài đặt hệ thống</h3>
                    <p className="text-gray-500">Tính năng đang được phát triển...</p>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;