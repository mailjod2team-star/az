import React, { useState } from 'react';
import { TechParticles } from './components/TechParticles';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ProxyTable } from './components/ProxyTable';
import { LoadingScreen } from './components/LoadingScreen';
import { SOCDashboard } from './components/SOCDashboard';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('proxy-list');
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
      
      <div className="App min-h-screen bg-background text-foreground relative overflow-hidden">
        {/* Background Particles */}
        <TechParticles />

        {/* Main Application */}
        <div className="relative z-10 flex flex-col h-screen">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar activeView={activeView} onNavigate={setActiveView} />
            <main className="flex-1 overflow-auto">
              {activeView === 'proxy-list' && <ProxyTable />}
              {activeView === 'soc-dashboard' && <SOCDashboard />}
              {activeView === 'forwarding' && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3">
                    <i className="fa-solid fa-share text-6xl text-primary animate-float" />
                    <h3 className="text-2xl font-display font-bold">Forwarding List</h3>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </div>
              )}
              {activeView === 'share-code' && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3">
                    <i className="fa-solid fa-code text-6xl text-secondary animate-float" />
                    <h3 className="text-2xl font-display font-bold">Share Code</h3>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </div>
              )}
              {activeView === 'api-reference' && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3">
                    <i className="fa-solid fa-book text-6xl text-accent animate-float" />
                    <h3 className="text-2xl font-display font-bold">API Reference</h3>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </div>
              )}
              {activeView === 'settings' && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3">
                    <i className="fa-solid fa-gear text-6xl text-warning animate-float" />
                    <h3 className="text-2xl font-display font-bold">Settings</h3>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Scan Line Effect */}
        <div className="fixed inset-0 pointer-events-none z-50 opacity-20">
          <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
        </div>
      </div>
    </>
  );
}

export default App;
