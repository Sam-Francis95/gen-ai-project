import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ClipboardList, 
  Settings, 
  Activity,
  BrainCircuit,
  BarChart3,
  Bell,
  Ambulance,
  ChevronDown,
  ChevronRight,
  FileText,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [aiToolsOpen, setAiToolsOpen] = useState(true);

  const isAiActive = location.pathname.startsWith('/discharge');

  return (
    <aside className="cf-sidebar">
      
      {/* Brand Header */}
      <div className="cf-sidebar-brand">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <span className="cf-brand-text">CareFlow AI</span>
      </div>

      {/* Navigation Menu */}
      <nav className="cf-sidebar-nav">
        
        <NavLink 
          to="/" 
          end 
          className={({ isActive }) => `cf-nav-item ${isActive ? 'cf-nav-active' : ''}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/referrals" 
          className={({ isActive }) => `cf-nav-item ${isActive ? 'cf-nav-active' : ''}`}
        >
          <Users className="w-4 h-4" />
          <span>Referrals</span>
        </NavLink>

        <NavLink 
          to="/appointments" 
          className={({ isActive }) => `cf-nav-item ${isActive ? 'cf-nav-active' : ''}`}
        >
          <Calendar className="w-4 h-4" />
          <span>Appointments</span>
        </NavLink>

        <NavLink 
          to="/patients" 
          className={({ isActive }) => `cf-nav-item ${isActive ? 'cf-nav-active' : ''}`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Patients</span>
        </NavLink>

        <NavLink 
          to="/incoming" 
          className={({ isActive }) => `cf-nav-item ${isActive ? 'cf-nav-active' : ''}`}
        >
          <Ambulance className="w-4 h-4" />
          <span>Network Transfers</span>
        </NavLink>

        {/* Collapsible AI Tools Group */}
        <div className="cf-nav-group">
          <button
            type="button"
            onClick={() => setAiToolsOpen(!aiToolsOpen)}
            className={`cf-nav-item cf-nav-group-header ${isAiActive ? 'cf-group-active' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <BrainCircuit className="w-4 h-4" />
              <span>AI Tools</span>
            </div>
            {aiToolsOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {aiToolsOpen && (
            <div className="cf-submenu pl-6 space-y-1 mt-1">
              <NavLink 
                to="/discharge" 
                className={({ isActive }) => `cf-sub-item ${isActive ? 'cf-sub-active' : ''}`}
              >
                <span>Discharge AI</span>
              </NavLink>
              
              <NavLink 
                to="/discharge?tab=summary" 
                className={({ isActive }) => `cf-sub-item ${isActive && location.search.includes('summary') ? 'cf-sub-active' : ''}`}
              >
                <span>Report Summarizer</span>
              </NavLink>

              <NavLink 
                to="/discharge?tab=careplan" 
                className={({ isActive }) => `cf-sub-item ${isActive && location.search.includes('careplan') ? 'cf-sub-active' : ''}`}
              >
                <span>Care Plan Assistant</span>
              </NavLink>
            </div>
          )}
        </div>

        <NavLink 
          to="/analytics" 
          className={({ isActive }) => `cf-nav-item ${isActive ? 'cf-nav-active' : ''}`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </NavLink>

        <NavLink 
          to="/follow-ups" 
          className={({ isActive }) => `cf-nav-item ${isActive ? 'cf-nav-active' : ''}`}
        >
          <Bell className="w-4 h-4" />
          <span>Follow-ups</span>
        </NavLink>

        <NavLink 
          to="/settings" 
          className={({ isActive }) => `cf-nav-item ${isActive ? 'cf-nav-active' : ''}`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </NavLink>

      </nav>

    </aside>
  );
};

export default Sidebar;
