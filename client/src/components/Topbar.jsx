import React, { useState } from 'react';
import { Search, Bell, ChevronDown, LogOut, Building2, User, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/referrals?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const hospitalInitial = user?.hospitalName?.charAt(0) || 'C';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between transition-all">
      
      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients, referrals, or appointments..."
            className="w-full bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
          />
        </div>
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        
        {/* Notification Bell */}
        <button
          onClick={() => navigate('/incoming')}
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          title="Network Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User / Hospital Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 pr-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {hospitalInitial}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {user?.hospitalName || 'CareFlow Demo Hospital'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium capitalize">
                {user?.role || 'Admin'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {user?.hospitalName || 'CareFlow Demo Hospital'}
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  {user?.email || 'admin@careflow.ai'}
                </span>
              </div>

              <button
                onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Facility Settings</span>
              </button>

              <button
                onClick={() => { setProfileOpen(false); logout(); }}
                className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
