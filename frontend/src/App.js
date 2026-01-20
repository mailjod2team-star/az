import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoadingScreen } from './components/LoadingScreen';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('soc-dashboard');
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
      
      <div className="App min-h-screen bg-white text-gray-900 relative overflow-hidden">
        {/* Main Application */}
        <div className="relative flex flex-col h-screen">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar activeView={activeView} onNavigate={setActiveView} />
            <main className="flex-1 overflow-auto bg-white">
              {/* Main content */}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;