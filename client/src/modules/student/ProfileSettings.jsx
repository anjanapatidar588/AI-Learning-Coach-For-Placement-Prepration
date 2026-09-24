import React from 'react';
import { UserCog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProfileSettings = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
        <UserCog className="w-7 h-7 text-indigo-400" />
        <span>Profile & Target Preferences</span>
      </h1>
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
        <div>
          <label className="text-xs text-gray-400 font-semibold uppercase">Account Name</label>
          <p className="text-white font-semibold text-base">{user?.name || 'Student'}</p>
        </div>
        <div>
          <label className="text-xs text-gray-400 font-semibold uppercase">Email Address</label>
          <p className="text-white font-semibold text-base">{user?.email || 'student@platform.com'}</p>
        </div>
        <div>
          <label className="text-xs text-gray-400 font-semibold uppercase">Assigned Role</label>
          <p className="text-indigo-400 font-mono text-xs font-semibold">STUDENT</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
