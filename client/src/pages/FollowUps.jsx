import React, { useEffect, useState } from 'react';
import { fetchReferrals, updateReferralStatus } from '../api/client';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Activity, MapPin, Building2, ArrowRight, CheckCircle2, User, Building, Clock, ChevronRight, X } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

const API_URL = 'http://localhost:5000';

export default function FollowUps() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [transferHistories, setTransferHistories] = useState({});
  const [loading, setLoading] = useState(true);

  // Modal State
  const [referModalOpen, setReferModalOpen] = useState(false);
  const [activeReferral, setActiveReferral] = useState(null);

  const mockHospitals = [
    { name: 'Apollo Care Center', email: 'apollo@careflow.ai', specialty: 'General & Trauma', distance: '1.2 km' },
    { name: 'City General Hospital', email: 'city@careflow.ai', specialty: 'Multi-specialty', distance: '2.5 km' },
    { name: 'Metro Heart Institute', email: 'metro@careflow.ai', specialty: 'Cardiology', distance: '3.1 km' },
    { name: 'Sunshine Pediatric Care', email: 'sunshine@careflow.ai', specialty: 'Pediatrics', distance: '4.8 km' },
    { name: 'Global Neuro Center', email: 'global@careflow.ai', specialty: 'Neurology', distance: '5.6 km' }
  ];

  useEffect(() => {
    let isActive = true;
    const loadData = async () => {
      try {
        const refs = await fetchReferrals();
        if (!isActive) return;
        setReferrals(refs);

        // Fetch transfer history for each referral
        const histories = {};
        await Promise.all(refs.map(async (r) => {
          try {
            const res = await axios.get(`${API_URL}/discharge/transfer-history/${r.id}`);
            histories[r.id] = res.data;
          } catch {
            histories[r.id] = [];
          }
        }));

        if (isActive) {
          setTransferHistories(histories);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (isActive) setLoading(false);
      }
    };
    loadData();
    return () => { isActive = false; };
  }, []);

  const handleDischarge = async (id) => {
    try {
      await updateReferralStatus(id, { status: 'VISITED' });
      toast.success("Patient successfully discharged and marked complete!");
      setReferrals(prev => prev.map(r => r.id === id ? { ...r, status: 'VISITED' } : r));
    } catch {
      toast.error("Failed to mark as complete.");
    }
  };

  const openReferModal = (ref) => {
    setActiveReferral(ref);
    setReferModalOpen(true);
  };

  const executeTransfer = async (targetEmail, hospitalName) => {
    if (!activeReferral) return;
    try {
      await axios.post(`${API_URL}/discharge/transfer`, {
        targetHospitalEmail: targetEmail,
        referralId: activeReferral.id,
        patientName: activeReferral.patient?.name || 'Unknown Patient',
        aiSummary: "Patient transferred via Master Tracking Hub.",
        senderHospitalName: user?.hospitalName || 'CareFlow Network'
      });
      toast.success(`Referral sent to ${hospitalName}!`);
      setReferModalOpen(false);

      // Optimistically update history
      const newTransfer = {
        sender_hospital_name: user?.hospitalName || 'CareFlow Network',
        target_hospital_email: targetEmail,
        created_at: new Date().toISOString(),
        ai_summary: "Patient transferred via Master Tracking Hub."
      };
      
      setTransferHistories(prev => ({
        ...prev,
        [activeReferral.id]: [...(prev[activeReferral.id] || []), newTransfer]
      }));

    } catch {
      toast.error(`Failed to transfer to ${hospitalName}`);
    }
  };

  const filteredReferrals = referrals.filter(ref => {
    if (user?.role === 'admin' || user?.email === 'admin@careflow.ai') return true;
    
    const history = transferHistories[ref.id] || [];
    
    // If patient hasn't been transferred yet, they are not in the network flow. Hide them.
    if (history.length === 0) return false;

    // If patient has been transferred, only show to hospitals involved in the chain (sender or receiver)
    return history.some(t => 
      t.target_hospital_email === user?.email || 
      t.sender_hospital_name === user?.hospitalName
    );
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <Toaster position="top-right" />
      
      {/* Dynamic Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 text-white pt-10 pb-24 px-4 md:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-200 mb-6 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <Activity className="w-4 h-4" /> Patient Tracker
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-white drop-shadow-sm">Master Patient Flow</h1>
              <p className="text-indigo-200 font-medium flex items-center gap-2">
                Track patient journeys across facilities, refer out, and discharge.
              </p>
            </div>
            {user?.role === 'admin' && (
               <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                 <User className="w-4 h-4" /> Admin View: All Patients
               </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-14">
        {loading ? (
          <div className="bg-white p-12 text-center text-slate-500 rounded-3xl shadow-xl border border-slate-200 font-medium">Loading network data...</div>
        ) : filteredReferrals.length === 0 ? (
          <div className="bg-white p-16 text-center text-slate-500 rounded-3xl shadow-xl border border-slate-200">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Referred Patients</h3>
            <p className="text-slate-500">Your hospital is not currently involved in any active patient transfers.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredReferrals.map((ref) => {
              const patientName = ref.patient?.name || 'Unknown Patient';
              const status = ref.status?.toUpperCase() || 'CREATED';
              const history = transferHistories[ref.id] || [];

              return (
                <div key={ref.id} className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row">
                  
                  {/* Left Column: Patient Info & Actions */}
                  <div className="p-6 md:p-8 md:w-1/3 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl border border-indigo-200 shadow-sm">
                          {patientName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{patientName}</h3>
                          <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-md ${
                            status === 'VISITED' || status === 'LOST' 
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}>
                            Status: {status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-slate-600 space-y-2 mb-6">
                        <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> Created: {new Date(ref.createdAt).toLocaleDateString()}</p>
                        <p className="flex items-center gap-2"><Building className="w-4 h-4 text-slate-400" /> Dept: {ref.department || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {status !== 'VISITED' && status !== 'LOST' && (
                        <>
                          <button 
                            onClick={() => openReferModal(ref)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-colors"
                          >
                            Refer to Hospital
                          </button>
                          <button 
                            onClick={() => handleDischarge(ref.id)}
                            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold py-2.5 rounded-xl transition-colors"
                          >
                            Discharge / Mark Complete
                          </button>
                        </>
                      )}
                      {(status === 'VISITED' || status === 'LOST') && (
                        <div className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold py-2.5 rounded-xl text-center flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-5 h-5" /> Patient Discharged
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Transfer Flow */}
                  <div className="p-6 md:p-8 md:w-2/3">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Transfer Flow (Hosp A → Hosp B)
                    </h4>
                    
                    {history.length === 0 ? (
                      <div className="h-full min-h-[150px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                        <Building2 className="w-8 h-8 mb-2 opacity-50" />
                        <p>No transfer history for this patient.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {history.map((transfer, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                            <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xs">
                              {idx + 1}
                            </div>
                            <div className="flex-1 flex flex-wrap items-center gap-3">
                              <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700">
                                {transfer.sender_hospital_name}
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-400" />
                              <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-sm font-bold text-blue-700">
                                {transfer.target_hospital_email.split('@')[0].toUpperCase()} Facility
                              </div>
                            </div>
                            <div className="hidden lg:block text-xs text-slate-400 text-right shrink-0">
                              {new Date(transfer.created_at).toLocaleDateString()}<br/>
                              {new Date(transfer.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Refer to Hospital Modal */}
      {referModalOpen && activeReferral && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-slate-900 to-blue-900 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5" /> Refer {activeReferral.patient?.name} to Facility
              </h3>
              <button onClick={() => setReferModalOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 bg-slate-50">
              <p className="text-sm font-medium text-slate-600 mb-4">Select a network hospital to transfer this patient. The receiving facility will get a notification instantly.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockHospitals.map((h, i) => (
                  <div key={i} className="bg-white border border-slate-200 p-4 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group" onClick={() => executeTransfer(h.email, h.name)}>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-blue-600 mb-1">{h.name}</h4>
                      <p className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-3">{h.specialty}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1"><MapPin className="w-3 h-3"/> {h.distance}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end">
              <button onClick={() => setReferModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
