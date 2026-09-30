import React, { useEffect, useState } from 'react';
import { 
  Users, TrendingUp, Clock, CheckCircle2, ChevronDown, 
  Download, Filter, Calendar, BarChart3, LineChart, Building2,
  Activity, ArrowUpRight, ArrowDownRight, ShieldCheck, Check,
  Share2, Zap, AlertCircle, PhoneCall, CalendarCheck, Stethoscope
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend 
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

const APPOINTMENTS_WEEKLY = [
  { day: 'Mon', scheduled: 14, attended: 13 },
  { day: 'Tue', scheduled: 16, attended: 15 },
  { day: 'Wed', scheduled: 12, attended: 11 },
  { day: 'Thu', scheduled: 18, attended: 17 },
  { day: 'Fri', scheduled: 15, attended: 13 },
  { day: 'Sat', scheduled: 8, attended: 7 }
];

const DEPT_COMPARISON_DATA = [
  { department: 'Cardiology', referrals: 24, completed: 21, avgDays: 4.2 },
  { department: 'Orthopedics', referrals: 19, completed: 16, avgDays: 5.1 },
  { department: 'Neurology', referrals: 15, completed: 13, avgDays: 6.4 },
  { department: 'General Med', referrals: 13, completed: 12, avgDays: 3.2 },
  { department: 'Pediatrics', referrals: 9, completed: 8, avgDays: 2.8 },
  { department: 'Oncology', referrals: 6, completed: 5, avgDays: 7.8 }
];

const REFERRAL_SOURCES = [
  { name: 'Apollo Community Clinic', location: 'South Hub (4.2 km)', count: 26, topDept: 'Cardiology', conversion: '88%', avgWait: '1.2 days' },
  { name: 'Fortis Primary Health Center', location: 'East District (7.8 km)', count: 21, topDept: 'Orthopedics', conversion: '81%', avgWait: '1.8 days' },
  { name: 'City Urgent Care Center', location: 'Central Metro (2.1 km)', count: 18, topDept: 'Neurology', conversion: '78%', avgWait: '0.8 days' },
  { name: 'CareFlow Outpatient Satellite', location: 'North Campus (5.5 km)', count: 14, topDept: 'General Medicine', conversion: '93%', avgWait: '1.1 days' },
  { name: 'Apex Diagnostic Hub', location: 'West Avenue (6.0 km)', count: 7, topDept: 'Pulmonology', conversion: '71%', avgWait: '2.4 days' }
];

const NETWORK_PARTNERS = [
  { id: 1, name: 'City General Hospital', type: 'Tertiary Care Partner', status: 'Online', latency: '12ms', transfersIn: 24, transfersOut: 14, acceptance: '98%' },
  { id: 2, name: 'Metro Super-Specialty Medical Center', type: 'Emergency Trauma Hub', status: 'Online', latency: '16ms', transfersIn: 18, transfersOut: 11, acceptance: '96%' },
  { id: 3, name: 'CareFlow Satellite Clinic North', type: 'Outpatient Triage Facility', status: 'Online', latency: '19ms', transfersIn: 12, transfersOut: 8, acceptance: '94%' },
  { id: 4, name: 'Apex Advanced Diagnostic Lab', type: 'Pathology & Radiology', status: 'Online', latency: '9ms', transfersIn: 8, transfersOut: 5, acceptance: '99%' }
];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [timeRange, setTimeRange] = useState('Last 30 Days');

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

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      reportTitle: `CareFlow Analytics Export - ${activeTab}`,
      generatedAt: new Date().toISOString(),
      timeRange,
      stats: stats || {},
      departmentBreakdown: DEPT_COMPARISON_DATA,
      referralsTrend: REFERRALS_OVER_TIME
    }, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `Careflow_${activeTab.toLowerCase()}_analytics.json`);
    dl.click();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in bg-[#f8fafc]">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight m-0">Analytics & Insights</h1>
          <p className="text-sm text-slate-500 mt-1 m-0">
            Key performance metrics and clinical trends for your hospital facility.
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-slate-200/90 hover:bg-slate-50 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs outline-none cursor-pointer"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Quarter">This Quarter</option>
              <option value="Year to Date">Year to Date</option>
            </select>
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Data</span>
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

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: OVERVIEW */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'Overview' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* 4 KPI Metric Stat Cards */}
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

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* LEFT CHART: Referrals Over Time */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 m-0">Referrals Over Time</h3>
                <span className="text-xs text-slate-400 font-medium">Trajectory & Inpatient Velocity</span>
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
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 100]} />
                    <Tooltip content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg">
                            <p className="font-semibold">{label}</p>
                            <p className="text-blue-300 font-bold">{payload[0].value} referrals</p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#analyticsGradient)" activeDot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RIGHT CHART: Department-wise Referrals */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900 m-0">Department-wise Referrals</h3>
              </div>

              <div className="flex flex-row items-center justify-center gap-6 my-auto">
                <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={DEPT_PIE_DATA} innerRadius={42} outerRadius={60} paddingAngle={3} dataKey="value">
                        {DEPT_PIE_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-extrabold text-slate-900 leading-none">86</span>
                    <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">TOTAL</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs flex-1 max-w-[170px]">
                  {DEPT_PIE_DATA.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 py-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-600 text-xs font-medium whitespace-nowrap truncate">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 text-xs tabular-nums text-right shrink-0">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Priority & Urgency Distribution */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 m-0">Referral Urgency & SLA Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-red-50/50 border border-red-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-red-900 block">Emergency Tier (18%)</span>
                  <span className="text-lg font-black text-red-700">1.2 hrs</span>
                  <span className="text-[10px] text-red-600 block mt-0.5">Avg response time (SLA &lt; 2 hrs)</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">99%</div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-900 block">Urgent Tier (42%)</span>
                  <span className="text-lg font-black text-amber-700">4.5 hrs</span>
                  <span className="text-[10px] text-amber-600 block mt-0.5">Avg response time (SLA &lt; 6 hrs)</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">94%</div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-900 block">Routine Tier (40%)</span>
                  <span className="text-lg font-black text-blue-700">12.0 hrs</span>
                  <span className="text-[10px] text-blue-600 block mt-0.5">Avg response time (SLA &lt; 24 hrs)</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">96%</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: REFERRALS */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'Referrals' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Conversion Funnel Banner */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 m-0">Patient Referral Lifecycle Funnel</h3>
                <p className="text-xs text-slate-500 mt-0.5">Retention and transition progression across all 86 registered referrals</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Overall Conversion: 74.4%
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">1. Created</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">86</span>
                <span className="text-[10px] text-slate-500">100% of pipeline</span>
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-center">
                <span className="text-[10px] uppercase font-bold text-indigo-500 block">2. Contacted</span>
                <span className="text-xl font-bold text-indigo-900 mt-1 block">74</span>
                <span className="text-[10px] text-indigo-600">86.0% reach rate</span>
              </div>
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                <span className="text-[10px] uppercase font-bold text-blue-500 block">3. Booked</span>
                <span className="text-xl font-bold text-blue-900 mt-1 block">68</span>
                <span className="text-[10px] text-blue-600">79.1% booked</span>
              </div>
              <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 text-center">
                <span className="text-[10px] uppercase font-bold text-teal-600 block">4. Visited</span>
                <span className="text-xl font-bold text-teal-900 mt-1 block">64</span>
                <span className="text-[10px] text-teal-700">74.4% attended</span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">5. Discharged</span>
                <span className="text-xl font-bold text-emerald-900 mt-1 block">58</span>
                <span className="text-[10px] text-emerald-700">67.4% care finished</span>
              </div>
            </div>
          </div>

          {/* Referral Sources Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 m-0">Top Inbound Referral Sources</h3>
                <p className="text-xs text-slate-500 mt-0.5">Primary care clinics and hospitals sending patients</p>
              </div>
              <span className="text-xs font-semibold text-slate-400 font-mono">5 Active Hubs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Referring Facility</th>
                    <th className="py-3 px-4">Patient Volume</th>
                    <th className="py-3 px-4">Primary Specialty</th>
                    <th className="py-3 px-4">Conversion Rate</th>
                    <th className="py-3 px-4">Avg Triage Speed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {REFERRAL_SOURCES.map((src, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 block">{src.name}</span>
                            <span className="text-[10px] text-slate-400">{src.location}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{src.count} patients</td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{src.topDept}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {src.conversion}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">{src.avgWait}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: APPOINTMENTS */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'Appointments' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* 4 Appointments KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block mb-1">Scheduled Slots</span>
                <span className="text-2xl font-bold text-slate-900">72</span>
                <span className="text-[10px] text-blue-600 block mt-0.5">This month across OPD</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block mb-1">Attendance Rate</span>
                <span className="text-2xl font-bold text-emerald-700">91.4%</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">+4.2% vs last month</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block mb-1">Reschedule Rate</span>
                <span className="text-2xl font-bold text-amber-700">5.8%</span>
                <span className="text-[10px] text-amber-600 block mt-0.5">Patient-requested adjustments</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block mb-1">No-Show Rate</span>
                <span className="text-2xl font-bold text-slate-800">2.8%</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Target &lt; 5.0%</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Weekly Attendance Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 m-0">Weekly Consultation Capacity vs Attendance</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Scheduled appointments vs confirmed patient check-ins</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={APPOINTMENTS_WEEKLY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 20]} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white text-xs rounded-lg p-2 shadow-lg">
                            <p className="font-bold">{label}</p>
                            <p className="text-blue-300">Scheduled: {payload[0].value}</p>
                            <p className="text-emerald-300">Attended: {payload[1].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="scheduled" name="Scheduled Slots" fill="#93c5fd" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="attended" name="Attended Visits" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Specialist Capacity Cards */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 m-0 border-b border-slate-100 pb-3">Specialist Slot Utilization</h3>
              <div className="space-y-3">
                {[
                  { name: 'Dr. Mehta', dept: 'Cardiology', rate: 94, slots: '32 / 34 slots' },
                  { name: 'Dr. Sarah Jenkins', dept: 'Neurology', rate: 88, slots: '28 / 32 slots' },
                  { name: 'Dr. R. Sharma', dept: 'Orthopedics', rate: 82, slots: '26 / 30 slots' },
                  { name: 'Dr. Ananya Iyer', dept: 'Pediatrics', rate: 75, slots: '21 / 28 slots' }
                ].map((doc, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-slate-800">{doc.name}</span>
                      <span className="font-bold text-xs text-blue-600">{doc.rate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${doc.rate}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{doc.dept}</span>
                      <span>{doc.slots}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: DEPARTMENTS */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'Departments' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Department Volume Comparison Chart */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 m-0">Department Volume & Case Completion</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Total inbound referrals vs completed specialist care</p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DEPT_COMPARISON_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="department" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 30]} />
                    <Tooltip content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white text-xs rounded-lg p-2 shadow-lg">
                            <p className="font-bold">{label}</p>
                            <p className="text-indigo-300">Total Referrals: {payload[0].value}</p>
                            <p className="text-emerald-300">Completed Cases: {payload[1].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="referrals" name="Inbound Referrals" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="completed" name="Completed Discharges" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Efficiency Summary */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 m-0 border-b border-slate-100 pb-3">Specialty Turnaround Time</h3>
              <div className="space-y-2.5">
                {DEPT_COMPARISON_DATA.map((dept, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{dept.department}</span>
                      <span className="text-[10px] text-slate-400">Completion: {Math.round((dept.completed / dept.referrals) * 100)}%</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-indigo-700">{dept.avgDays} Days</span>
                      <span className="text-[10px] text-slate-400 block">Avg Inpatient Stay</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 5: NETWORK */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'Network' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Network Header Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500 block mb-1">Connected Hospital Hubs</span>
              <span className="text-2xl font-bold text-slate-900">4 Facilities</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">100% telemetry online</span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500 block mb-1">Transfer Acceptance</span>
              <span className="text-2xl font-bold text-emerald-700">96.8%</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">Zero protocol rejections</span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500 block mb-1">Bed Allocation Speed</span>
              <span className="text-2xl font-bold text-blue-700">38 mins</span>
              <span className="text-[10px] text-blue-600 block mt-0.5">Door-to-bed average</span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-medium text-slate-500 block mb-1">Monthly Inter-Transfers</span>
              <span className="text-2xl font-bold text-slate-900">62 Cases</span>
              <span className="text-[10px] text-indigo-600 block mt-0.5">Inbound & Outbound</span>
            </div>
          </div>

          {/* Network Partner Facilities Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 m-0">Regional Health Network Telemetry</h3>
                <p className="text-xs text-slate-500 mt-0.5">Live connectivity, latency, and inter-hospital patient transfers</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Secure FHIR Tunnel Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Partner Facility</th>
                    <th className="py-3 px-4">Network Classification</th>
                    <th className="py-3 px-4">Latency & Status</th>
                    <th className="py-3 px-4">Inbound Transfers</th>
                    <th className="py-3 px-4">Outbound Transfers</th>
                    <th className="py-3 px-4">Acceptance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {NETWORK_PARTNERS.map(partner => (
                    <tr key={partner.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-bold text-slate-900">{partner.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{partner.type}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {partner.status} ({partner.latency})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{partner.transfersIn} patients</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{partner.transfersOut} patients</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">{partner.acceptance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
