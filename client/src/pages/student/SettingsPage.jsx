import React, { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { Settings, Bell, Shield, Moon, Menu } from 'lucide-react';

const SettingsPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);

  return (
    <div className="min-h-screen pathpilot-bg text-slate-100 flex">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 sticky top-0 z-30">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2 text-slate-300">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-sm font-bold text-white">Settings</span>
          <div className="w-6" />
        </div>

        <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full text-left">
          
          <div className="glass-panel-glow p-6 sm:p-8 border border-slate-800 bg-slate-950/90">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-cyan-400" />
              <span>Platform Settings</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Manage notifications, dark theme visual options, and account security.</p>
          </div>

          <div className="space-y-4 max-w-2xl">
            <div className="glass-panel-dark p-6 space-y-4 border border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span>Notifications & Study Reminders</span>
              </h3>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-white">Daily Study Reminders</h4>
                  <p className="text-[11px] text-slate-400">Receive email alerts for due revision cards and roadmap goals.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
