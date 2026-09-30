import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchReferrals, updateReferralStatus, deleteReferral } from '../api/client';
import { 
  Search, Filter, MoreVertical, Plus, Users, Eye, 
  Edit3, Trash2, PhoneCall, CalendarCheck, CheckCircle2, 
  XCircle, ExternalLink, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import NewReferralModal from '../components/NewReferralModal';
import EditReferralModal from '../components/EditReferralModal';

export default function ReferralsList() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Action Menu & Edit Modal state
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingReferral, setEditingReferral] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const navigate = useNavigate();
  const menuRef = useRef(null);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const data = await fetchReferrals();
      setReferrals(data || []);
    } catch (err) {
      console.error("Failed to load referrals", err);
      toast.error("Failed to load referrals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    if (activeMenuId !== null) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [activeMenuId]);

  const handleQuickStatusChange = async (refId, newStatus) => {
    try {
      await updateReferralStatus(refId, { status: newStatus });
      toast.success(`Referral marked as ${newStatus}`);
      setActiveMenuId(null);
      loadReferrals();
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (refId, patientName) => {
    setActiveMenuId(null);
    if (window.confirm(`Are you sure you want to delete the referral for ${patientName}?`)) {
      try {
        await deleteReferral(refId);
        toast.success("Referral deleted successfully");
        loadReferrals();
      } catch (err) {
        console.error("Failed to delete referral", err);
        toast.error("Failed to delete referral");
      }
    }
  };

  const handleOpenEdit = (ref) => {
    setActiveMenuId(null);
    setEditingReferral(ref);
    setIsEditModalOpen(true);
  };

  const counts = useMemo(() => {
    const map = { ALL: referrals.length, PENDING: 0, VISITED: 0, LOST: 0, CREATED: 0, CONTACTED: 0 };
    referrals.forEach(r => {
      const s = String(r.status || 'CREATED').toUpperCase();
      if (s === 'CREATED' || s === 'CONTACTED') map.PENDING++;
      if (map[s] !== undefined) map[s]++;
    });
    return map;
  }, [referrals]);

  const filteredReferrals = referrals.filter(r => {
    const patientName = r.patient?.name || '';
    const department = r.department || '';
    const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          department.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PENDING') return r.status === 'CREATED' || r.status === 'CONTACTED';
    return String(r.status || 'CREATED').toUpperCase() === activeTab;
  });

  const getStatusBadge = (status) => {
    switch (String(status || 'CREATED').toUpperCase()) {
      case 'VISITED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'LOST':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'CONTACTED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'BOOKED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getAvatarBg = (name) => {
    const colors = ['bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700', 'bg-purple-100 text-purple-700', 'bg-teal-100 text-teal-700', 'bg-amber-100 text-amber-700'];
    const idx = (name || 'P').charCodeAt(0) % colors.length;
    return colors[idx];
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight m-0">Referrals Hub</h1>
          <p className="text-sm text-slate-500 mt-1 m-0">
            Manage and track all patient referrals across departments.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-blue-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Referral</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* ── Filter Tabs Bar ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-xl text-xs font-medium">
          {[
            { id: 'ALL', label: `All (${counts.ALL})` },
            { id: 'PENDING', label: `Pending (${counts.PENDING})` },
            { id: 'VISITED', label: 'Visited' },
            { id: 'LOST', label: 'Lost' },
            { id: 'CREATED', label: 'Created' },
            { id: 'CONTACTED', label: 'Contacted' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient or dept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200/90 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
          />
        </div>
      </div>

      {/* ── Referrals Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-visible">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-5">Patient</th>
                <th className="py-3 px-5">Department</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Priority</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">Loading referrals...</td>
                </tr>
              ) : filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">No referrals found matching your criteria.</td>
                </tr>
              ) : (
                filteredReferrals.map((ref, index) => {
                  const pName = ref.patient?.name || 'Unknown Patient';
                  const initial = pName.charAt(0).toUpperCase();
                  const avatarColor = getAvatarBg(pName);
                  const isUrgent = ref.priority?.toLowerCase() === 'urgent';
                  const dateStr = ref.createdAt ? new Date(ref.createdAt).toLocaleDateString() : '11/5/2026';
                  const isMenuOpen = activeMenuId === ref.id;
                  const isNearBottom = index >= filteredReferrals.length - 2 && filteredReferrals.length > 3;

                  return (
                    <tr 
                      key={ref.id} 
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/referral/${ref.id}`)}
                    >
                      {/* Patient */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${avatarColor}`}>
                            {initial}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {pName}
                            </span>
                            {ref.patient?.phone && (
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{ref.patient.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-5 text-slate-700 font-medium">
                        <div>{ref.department || 'General Medicine'}</div>
                        {(ref.doctor || ref.specialist) && (
                          <div className="text-[11px] text-slate-400">{ref.doctor || ref.specialist}</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(ref.status)}`}>
                          {String(ref.status || 'CREATED').toUpperCase()}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          isUrgent ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isUrgent ? 'Urgent' : 'Normal'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right relative">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/referral/${ref.id}`)}
                            className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="View Referral Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <div className="relative" ref={isMenuOpen ? menuRef : null}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(isMenuOpen ? null : ref.id);
                              }}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isMenuOpen 
                                  ? 'bg-blue-100 text-blue-600 shadow-2xs' 
                                  : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                              }`}
                              title="Actions Menu"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                              <div 
                                className={`absolute right-0 ${
                                  isNearBottom ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                } w-52 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-50 text-left`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Manage Referral
                                </div>

                                <button
                                  onClick={() => handleOpenEdit(ref)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer text-left font-medium"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Edit Details</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    navigate(`/referral/${ref.id}`);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                                  <span>View Profile</span>
                                </button>

                                <div className="my-1 border-t border-slate-100" />

                                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Quick Status
                                </div>

                                <button
                                  onClick={() => handleQuickStatusChange(ref.id, 'CONTACTED')}
                                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-pointer text-left"
                                >
                                  <PhoneCall className="w-3.5 h-3.5 text-purple-500" />
                                  <span>Mark Contacted</span>
                                </button>

                                <button
                                  onClick={() => handleQuickStatusChange(ref.id, 'BOOKED')}
                                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer text-left"
                                >
                                  <CalendarCheck className="w-3.5 h-3.5 text-indigo-500" />
                                  <span>Confirm Booked</span>
                                </button>

                                <button
                                  onClick={() => handleQuickStatusChange(ref.id, 'VISITED')}
                                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer text-left"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Mark Visited</span>
                                </button>

                                <button
                                  onClick={() => handleQuickStatusChange(ref.id, 'LOST')}
                                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
                                >
                                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Mark Lost</span>
                                </button>

                                <div className="my-1 border-t border-slate-100" />

                                <button
                                  onClick={() => handleDelete(ref.id, pName)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left font-medium"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Delete Referral</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Referral Modal */}
      {isModalOpen && (
        <NewReferralModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            loadReferrals();
          }}
        />
      )}

      {/* Edit Referral Modal */}
      {isEditModalOpen && editingReferral && (
        <EditReferralModal
          isOpen={isEditModalOpen}
          referral={editingReferral}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingReferral(null);
          }}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setEditingReferral(null);
            loadReferrals();
          }}
        />
      )}

    </div>
  );
}