import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col antialiased selection:bg-blue-500 selection:text-white">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-slate-950/40">
              <AppRoutes />
            </main>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
