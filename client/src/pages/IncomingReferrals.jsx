import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Calendar, ChevronRight, CheckCircle2, 
  Search, Filter, ArrowRight, Activity 
} from 'lucide-react';

export default function IncomingReferrals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user?.email) return;

    axios.get(`http://localhost:5000/discharge/notifications?email=${user.email}`)
      .then(res => setTransfers(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  const filteredTransfers = transfers.filter(t => 
    !searchQuery || t.patient_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in bg-[#f8fafc]">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight m-0">Referred Patients</h1>
          <p className="text-sm text-slate-500 mt-1 m-0">
            Patients referred to {user?.hospitalName || 'CareFlow Demo Hospital'} from the CareFlow network.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200/90 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
            />
          </div>

          <button className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* ── Tabs Bar ── */}
      <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-xl text-xs font-medium w-fit">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'incoming'
              ? 'bg-white text-blue-600 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Incoming ({transfers.length})
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'outgoing'
              ? 'bg-white text-blue-600 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Outgoing
        </button>
      </div>

      {/* ── Main Content Area ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 md:p-8">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs font-medium">Loading network transfers...</div>
        ) : filteredTransfers.length === 0 ? (
          /* Empty State Exactly Matching Screen 4 in Image */
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center mb-4 text-slate-300">
              <Building2 className="w-10 h-10 stroke-1" />
            </div>
            <h3 className="text-base font-bold text-slate-800 m-0">No Incoming Transfers</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm m-0">
              Your facility hasn't received any external referrals yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransfers.map((item) => (
              <div 
                key={item.id}
                onClick={() => navigate(`/referral/${item.referral_id}`)}
                className="p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer bg-slate-50/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{item.patient_name || 'Patient'}</span>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      Network Referral
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 mt-2">
                  <strong className="text-slate-900 block mb-1">Shared AI Clinical Summary:</strong>
                  <p className="m-0 line-clamp-2">{item.ai_summary}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
