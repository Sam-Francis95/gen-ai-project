import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchReferrals } from '../api/client';
import { Search, User, Phone, MapPin, Activity, FileText, Users } from 'lucide-react';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const referrals = await fetchReferrals();
        const patientMap = new Map();
        referrals.forEach(ref => {
          if (!ref.patient) return;
          const pid = ref.patient.id;
          if (!patientMap.has(pid)) {
            patientMap.set(pid, { ...ref.patient, referrals: [] });
          }
          patientMap.get(pid).referrals.push(ref);
        });
        setPatients(Array.from(patientMap.values()));
      } catch (err) {
        console.error("Failed to load patients", err);
      } finally {
        setLoading(false);
      }
    };
    loadPatients();
  }, []);

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone?.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Dynamic Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 text-white pt-10 pb-24 px-4 md:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-200 mb-6 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <Users className="w-4 h-4" /> Patient Directory
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-white drop-shadow-sm">Patient Records</h1>
              <p className="text-indigo-200 font-medium flex items-center gap-2">
                Master record of all registered patients across the network.
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-sm font-medium bg-white/10 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/10 shadow-xl">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" />
                <input 
                  type="text" 
                  placeholder="Search patients by name or phone..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-300 outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/20 transition-all w-[300px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {loading ? (
            <div className="col-span-full py-20 text-center text-slate-500 font-medium">Loading database...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-16 text-center">
              <User size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No patients found matching your search.</p>
            </div>
          ) : (
            filteredPatients.map(patient => (
              <div key={patient.id} onClick={() => navigate(`/referral/${patient.referrals[0]?.id}`)} className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 flex flex-col gap-6 cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                    {patient.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">{patient.name}</h3>
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1">
                      <Phone size={14} className="text-slate-400" /> {patient.phone}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">History</div>
                    <div className="flex items-center gap-2 text-slate-800 font-semibold">
                      <FileText size={16} className="text-blue-500" /> 
                      {patient.referrals?.length} Referral{patient.referrals?.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Status</div>
                    <div className="flex items-center gap-2 text-slate-800 font-semibold">
                      <Activity size={16} className="text-emerald-500" /> Active
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Patients;