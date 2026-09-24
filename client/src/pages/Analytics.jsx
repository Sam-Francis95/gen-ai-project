import React, { useEffect, useState } from 'react';
import { 
  Users, TrendingUp, Clock, CheckCircle2, ChevronDown, 
  Download, Filter, Calendar, BarChart3, LineChart 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell 
} from 'recharts';
import { fetchReferrals, fetchReferralStats } from '../api/client';

const REFERRALS_OVER_TIME = [
  { date: 'Aug 28', count: 42 },
  { date: 'Aug 31', count: 48 },
  { date: 'Sep 05', count: 45 },
  { date: 'Sep 10', count: 58 },
  { date: 'Sep 15', count: 52 },
  { date: 'Sep 20', count: 68 },
  { date: 'Sep 24', count: 86 }
];

const DEPT_PIE_DATA = [
  { name: 'Cardiology', value: 28, color: '#2563eb' },
  { name: 'Orthopedics', value: 22, color: '#0d9488' },
  { name: 'Neurology', value: 18, color: '#f59e0b' },
  { name: 'General Medicine', value: 15, color: '#38bdf8' },
  { name: 'Others', value: 17, color: '#94a3b8' }
];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    Promise.all([
      fetchReferrals().catch(() => []),
      fetchReferralStats().catch(() => null)
    ]).then(([refs, s]) => {
      setReferrals(refs || []);
      setStats(s);
      setLoading(false);
    });
  }, []);

  const totalReferrals = stats?.total || 86;
  const completedVisits = stats?.byStatus?.VISITED || 64;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in bg-[#f8fafc]">
      
      {/* ── Page Header (Exactly matching Screen 6) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight m-0">Analytics & Insights</h1>
          <p className="text-sm text-slate-500 mt-1 m-0">
            Key performance metrics and trends for your facility.
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <button className="bg-white border border-slate-200/90 hover:bg-slate-50 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-1.5 cursor-pointer">
              <span>Last 30 Days</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ── Tabs Bar ── */}
      <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-xl text-xs font-medium w-fit">
        {[
          'Overview',
          'Referrals',
          'Appointments',
          'Departments',
          'Network'
        ].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-white text-blue-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── 4 KPI Metric Stat Cards Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Referrals */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-1">Total Referrals</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{totalReferrals}</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                +14%
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Conversion Rate */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-1">Conversion Rate</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">78%</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                +8%
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Avg. Response Time */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-1">Avg. Response Time</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">6 hrs</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                -12%
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Completed Visits */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-1">Completed Visits</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{completedVisits}</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                +22%
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* ── Bottom Charts Row: Referrals Over Time + Department-wise Referrals ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* LEFT CHART: Referrals Over Time (Area Chart) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 m-0">Referrals Over Time</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REFERRALS_OVER_TIME} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  domain={[0, 100]}
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
                  fill="url(#analyticsGradient)" 
                  activeDot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT CHART: Department-wise Referrals (Donut Chart) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 m-0">Department-wise Referrals</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 my-auto">
            {/* Donut Container with Center Label */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DEPT_PIE_DATA}
                    innerRadius={46}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {DEPT_PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-slate-900 leading-none">86</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Total</span>
              </div>
            </div>

            {/* Department Legend */}
            <div className="space-y-1.5 text-xs w-full sm:w-auto">
              {DEPT_PIE_DATA.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-600 text-[11px] font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800 text-[11px]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
