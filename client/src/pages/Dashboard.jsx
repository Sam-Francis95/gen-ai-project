import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, Calendar, Clock, TrendingUp, Timer, FileText, 
  ChevronDown, ExternalLink, ArrowUpRight, ArrowDownRight, 
  CheckCircle2, Building2, User, Sparkles, MoreVertical, Plus, Check 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell 
} from 'recharts';
import { fetchReferrals, fetchReferralStats } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import NewReferralModal from '../components/NewReferralModal';

const RANGE_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7days', label: 'Last 7 Days' },
  { id: '30days', label: 'Last 30 Days' },
  { id: 'month', label: 'This Month' },
  { id: 'all', label: 'All Time' },
];

const TREND_DATA_MAP = {
  today: [
    { day: '08:00', count: 3 },
    { day: '10:00', count: 7 },
    { day: '12:00', count: 12 },
    { day: '14:00', count: 18 },
    { day: '16:00', count: 21 },
    { day: '18:00', count: 24 },
  ],
  yesterday: [
    { day: '08:00', count: 2 },
    { day: '10:00', count: 5 },
    { day: '12:00', count: 10 },
    { day: '14:00', count: 14 },
    { day: '16:00', count: 18 },
    { day: '18:00', count: 20 },
  ],
  '7days': [
    { day: '18 Sep', count: 12 },
    { day: '19 Sep', count: 15 },
    { day: '20 Sep', count: 14 },
    { day: '21 Sep', count: 18 },
    { day: '22 Sep', count: 16 },
    { day: '23 Sep', count: 21 },
    { day: '24 Sep', count: 24 },
  ],
  '30days': [
    { day: 'Week 1', count: 52 },
    { day: 'Week 2', count: 68 },
    { day: 'Week 3', count: 81 },
    { day: 'Week 4', count: 94 },
  ],
  month: [
    { day: '1-7 Sep', count: 60 },
    { day: '8-14 Sep', count: 74 },
    { day: '15-21 Sep', count: 88 },
    { day: '22-28 Sep', count: 102 },
  ],
  all: [
    { day: 'May', count: 120 },
    { day: 'Jun', count: 165 },
    { day: 'Jul', count: 195 },
    { day: 'Aug', count: 230 },
    { day: 'Sep', count: 275 },
  ],
  custom: [
    { day: '09:00', count: 4 },
    { day: '11:00', count: 9 },
    { day: '13:00', count: 15 },
    { day: '15:00', count: 20 },
    { day: '17:00', count: 25 },
  ]
};

const DEPT_DATA = [
  { name: 'Cardiology', value: 28, color: '#2563eb' },
  { name: 'Orthopedics', value: 22, color: '#0d9488' },
  { name: 'Neurology', value: 18, color: '#f59e0b' },
  { name: 'General Medicine', value: 15, color: '#38bdf8' },
  { name: 'Others', value: 17, color: '#94a3b8' },
];

const RECENT_ACTIVITIES = [
  {
    id: 1,
    icon: Users,
    iconBg: 'bg-blue-50 text-blue-600',
    title: 'New referral received - Cardiology',
    time: '2 min ago',
    tag: 'New',
    tagBg: 'bg-blue-100 text-blue-700'
  },
  {
    id: 2,
    icon: Calendar,
    iconBg: 'bg-indigo-50 text-indigo-600',
    title: 'Appointment scheduled for Arjun',
    time: '10 min ago'
  },
  {
    id: 3,
    icon: Sparkles,
    iconBg: 'bg-purple-50 text-purple-600',
    title: 'AI discharge summary generated',
    time: '25 min ago',
    tag: 'AI',
    tagBg: 'bg-purple-100 text-purple-700'
  },
  {
    id: 4,
    icon: CheckCircle2,
    iconBg: 'bg-emerald-50 text-emerald-600',
    title: 'Patient Test 1 marked as discharged',
    time: '1 hour ago'
  },
  {
    id: 5,
    icon: Building2,
    iconBg: 'bg-teal-50 text-teal-600',
    title: 'Network transfer request from City Hospital',
    time: '2 hours ago'
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Interactive Date & Range Filter state
  const [timeFilter, setTimeFilter] = useState('today');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isRangeDropdownOpen, setIsRangeDropdownOpen] = useState(false);
  const [isChartRangeDropdownOpen, setIsChartRangeDropdownOpen] = useState(false);

  const rangeDropdownRef = useRef(null);
  const chartRangeDropdownRef = useRef(null);
  const dateInputRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rangeDropdownRef.current && !rangeDropdownRef.current.contains(e.target)) {
        setIsRangeDropdownOpen(false);
      }
      if (chartRangeDropdownRef.current && !chartRangeDropdownRef.current.contains(e.target)) {
        setIsChartRangeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [refData, statData] = await Promise.all([
          fetchReferrals({ limit: 50 }).catch(() => []),
          fetchReferralStats().catch(() => null)
        ]);
        setReferrals(refData || []);
        setStats(statData);
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalPatients = useMemo(() => {
    return referrals.length > 0 ? (120 + referrals.length) : 124;
  }, [referrals]);

  // Format date display label
  const formattedDisplayDate = useMemo(() => {
    if (timeFilter === 'custom' && selectedDate) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      }
    }
    if (timeFilter === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      return y.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }
    if (timeFilter === '7days') return 'Past 7 Days';
    if (timeFilter === '30days') return 'Past 30 Days';
    if (timeFilter === 'month') return 'This Month';
    if (timeFilter === 'all') return 'All Time';

    // Default 'today'
    const today = new Date();
    return today.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }, [timeFilter, selectedDate]);

  const activeRangeLabel = useMemo(() => {
    if (timeFilter === 'custom') return 'Custom Date';
    return RANGE_OPTIONS.find(o => o.id === timeFilter)?.label || 'Today';
  }, [timeFilter]);

  const currentTrendData = useMemo(() => {
    return TREND_DATA_MAP[timeFilter] || TREND_DATA_MAP['7days'];
  }, [timeFilter]);

  const handleOpenDatePicker = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setTimeFilter('custom');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in bg-[#f8fafc]">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight m-0">
            Welcome back, {user?.hospitalName || 'CareFlow Demo Hospital'}
          </h1>
          <p className="text-sm text-slate-500 mt-1 m-0">
            Here's what's happening at your facility today.
          </p>
        </div>

        {/* Date and Time Filters */}
        <div className="flex items-center gap-2.5">
          {/* Clickable Date Picker Pill */}
          <div className="relative">
            <button 
              onClick={handleOpenDatePicker}
              className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-1.5 text-xs text-slate-700 font-medium shadow-2xs flex items-center gap-2 cursor-pointer transition-all hover:border-slate-300"
              title="Click to select a date"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>{formattedDisplayDate}</span>
            </button>
            <input 
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="absolute opacity-0 pointer-events-none w-0 h-0"
            />
          </div>

          {/* Interactive Range Filter Dropdown */}
          <div className="relative" ref={rangeDropdownRef}>
            <button 
              onClick={() => setIsRangeDropdownOpen(!isRangeDropdownOpen)}
              className="bg-white border border-slate-200/90 hover:bg-slate-50 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all hover:border-slate-300"
            >
              <span>{activeRangeLabel}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${isRangeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isRangeDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Range
                </div>
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setTimeFilter(opt.id);
                      setIsRangeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors cursor-pointer text-left ${
                      timeFilter === opt.id 
                        ? 'bg-blue-50 text-blue-600 font-bold' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {timeFilter === opt.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    setIsRangeDropdownOpen(false);
                    handleOpenDatePicker();
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                >
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Custom Date...
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 6 KPI Metric Stat Cards Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
        
        {/* Card 1: Active Patients */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Active Patients</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{totalPatients}</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                +12%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 m-0">Currently under care</p>
          </div>
        </div>

        {/* Card 2: Pending Referrals */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Pending Referrals</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{stats?.pending || 6}</span>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                +50%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 m-0">Awaiting review</p>
          </div>
        </div>

        {/* Card 3: Today's Appointments */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Appointments</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{stats?.booked || 18}</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                +20%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 m-0">Scheduled visits</p>
          </div>
        </div>

        {/* Card 4: Patients Awaiting Action */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Patients Awaiting Action</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">4</span>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                +33%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 m-0">Need attention</p>
          </div>
        </div>

        {/* Card 5: Referral Conversion Rate */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Referral Conversion Rate</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">78%</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                +5%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 m-0">Referrals to appointments</p>
          </div>
        </div>

        {/* Card 6: Avg. Referral Response Time */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Avg. Referral Response Time</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">6 hrs</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                -25%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 m-0">From referral to first action</p>
          </div>
        </div>

      </div>

      {/* ── Middle Row: Referral Trends + Department Donut + Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* LEFT CHART: Referral Trends (Area Chart) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 m-0">Referral Trends</h3>
            
            {/* Chart Range Filter */}
            <div className="relative" ref={chartRangeDropdownRef}>
              <button 
                onClick={() => setIsChartRangeDropdownOpen(!isChartRangeDropdownOpen)}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl px-2.5 py-1 text-xs text-slate-600 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{activeRangeLabel}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isChartRangeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isChartRangeDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1 z-40 text-left">
                  {RANGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setTimeFilter(opt.id);
                        setIsChartRangeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors cursor-pointer text-left ${
                        timeFilter === opt.id 
                          ? 'bg-blue-50 text-blue-600 font-bold' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {timeFilter === opt.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  domain={[0, 'dataMax + 5']}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg">
                          <p className="font-semibold">{label}</p>
                          <p className="text-blue-300 font-bold">{payload[0].value} referrals</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#trendGradient)" 
                  activeDot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MIDDLE CHART: Referrals by Department (Donut Chart) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 m-0">Referrals by Department</h3>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="w-32 h-32 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DEPT_DATA}
                    innerRadius={36}
                    outerRadius={52}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {DEPT_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white text-xs rounded-lg px-2 py-1 shadow-md">
                            <span className="font-bold">{payload[0].name}: </span>
                            <span>{payload[0].value}%</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-slate-800">100%</span>
                <span className="text-[9px] text-slate-400">Total</span>
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-1.5 pl-1">
              {DEPT_DATA.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 py-0.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-600 text-xs font-medium truncate" title={item.name}>{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800 text-xs tabular-nums text-right shrink-0 min-w-[32px]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT CARD: Recent Activity */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 m-0">Recent Activity</h3>
            <Link to="/referrals" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All
            </Link>
          </div>

          <div className="space-y-3.5 my-auto">
            {RECENT_ACTIVITIES.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-lg ${act.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 m-0 leading-snug">{act.title}</p>
                      <span className="text-[10px] text-slate-400">{act.time}</span>
                    </div>
                  </div>

                  {act.tag && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${act.tagBg} shrink-0`}>
                      {act.tag}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* New Referral Modal */}
      {isModalOpen && (
        <NewReferralModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
          }}
        />
      )}

    </div>
  );
}
