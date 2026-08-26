import React, { useState, useEffect } from 'react';
import { checkApiHealth } from '../../services/apiClient';

const BackendStatus = () => {
  const [status, setStatus] = useState({
    loading: true,
    connected: false,
    message: '',
    dbStatus: '',
    timestamp: null
  });

  const verifyConnection = async () => {
    setStatus((prev) => ({ ...prev, loading: true }));
    const result = await checkApiHealth();

    if (result.success) {
      setStatus({
        loading: false,
        connected: true,
        message: result.data.message || 'API Online',
        dbStatus: result.data.database || 'connected',
        timestamp: result.data.timestamp
      });
    } else {
      setStatus({
        loading: false,
        connected: false,
        message: result.error,
        dbStatus: 'disconnected',
        timestamp: null
      });
    }
  };

  useEffect(() => {
    verifyConnection();
    const interval = setInterval(verifyConnection, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-sm text-slate-300">
      <div className="flex items-center space-x-2">
        <span className="font-semibold text-slate-400">System Foundation:</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
          Frontend active
        </span>
      </div>

      <div className="flex items-center space-x-3">
        {status.loading ? (
          <span className="flex items-center text-amber-400 space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Checking API Connection...</span>
          </span>
        ) : status.connected ? (
          <div className="flex items-center space-x-3">
            <span className="flex items-center text-emerald-400 font-medium space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Backend Connected (GET /api/v1/health)</span>
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">
              MongoDB: <strong className={status.dbStatus === 'connected' ? 'text-emerald-400' : 'text-rose-400'}>{status.dbStatus}</strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="flex items-center text-rose-400 font-medium space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Backend Offline ({status.message})</span>
            </span>
            <button
              onClick={verifyConnection}
              className="ml-2 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded border border-rose-500/30 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackendStatus;
