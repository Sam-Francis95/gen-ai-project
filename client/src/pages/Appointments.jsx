import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchReferrals, updateReferralStatus } from '../api/client';
import { 
  Calendar, Clock, Filter, Plus, ChevronRight, Send, 
  RefreshCw, Stethoscope, User, CheckCircle2, XCircle, 
  Search, X, Check, AlertCircle, Phone, FileText
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

const INITIAL_MOCK_APPOINTMENTS = [
  // Upcoming
  {
    id: 'mock-101',
    patientName: 'Arjun',
    department: 'Cardiology',
    doctor: 'Dr. Sarah Jenkins',
    dateLabel: '24 SEP',
    dayLabel: 'FRI',
    rawDate: '2026-09-24',
    time: '07:30 PM',
    duration: '30 min',
    status: 'Confirmed',
    category: 'upcoming',
    phone: '+91 98765 43210'
  },
  {
    id: 'mock-102',
    patientName: 'Test Patient',
    department: 'Neurology',
    doctor: 'Dr. Michael Chen',
    dateLabel: '24 SEP',
    dayLabel: 'FRI',
    rawDate: '2026-09-24',
    time: '09:00 PM',
    duration: '45 min',
    status: 'Pending',
    category: 'upcoming',
    phone: '+91 98450 12345'
  },
  {
    id: 'mock-103',
    patientName: 'aarya',
    department: 'Orthopedics',
    doctor: 'Dr. Rachel Adams',
    dateLabel: '25 SEP',
    dayLabel: 'SAT',
    rawDate: '2026-09-25',
    time: '10:00 AM',
    duration: '30 min',
    status: 'Confirmed',
    category: 'upcoming',
    phone: '+91 97123 45678'
  },
  // Completed
  {
    id: 'mock-201',
    patientName: 'Priya Sharma',
    department: 'Cardiology',
    doctor: 'Dr. Sarah Jenkins',
    dateLabel: '22 SEP',
    dayLabel: 'WED',
    rawDate: '2026-09-22',
    time: '02:00 PM',
    duration: '30 min',
    status: 'Completed',
    category: 'completed',
    phone: '+91 98111 22334'
  },
  {
    id: 'mock-202',
    patientName: 'Rahul Verma',
    department: 'General Medicine',
    doctor: 'Dr. Alex Taylor',
    dateLabel: '21 SEP',
    dayLabel: 'TUE',
    rawDate: '2026-09-21',
    time: '11:30 AM',
    duration: '45 min',
    status: 'Completed',
    category: 'completed',
    phone: '+91 98222 33445'
  },
  {
    id: 'mock-203',
    patientName: 'Anita Desai',
    department: 'Dermatology',
    doctor: 'Dr. Sunita Rao',
    dateLabel: '20 SEP',
    dayLabel: 'MON',
    rawDate: '2026-09-20',
    time: '04:00 PM',
    duration: '30 min',
    status: 'Completed',
    category: 'completed',
    phone: '+91 98333 44556'
  },
  // Cancelled
  {
    id: 'mock-301',
    patientName: 'Kiran Patel',
    department: 'Neurology',
    doctor: 'Dr. Michael Chen',
    dateLabel: '23 SEP',
    dayLabel: 'THU',
    rawDate: '2026-09-23',
    time: '03:00 PM',
    duration: '30 min',
    status: 'Cancelled',
    cancelReason: 'Patient requested cancellation',
    category: 'cancelled',
    phone: '+91 98444 55667'
  },
  {
    id: 'mock-302',
    patientName: 'Deepa Nair',
    department: 'Orthopedics',
    doctor: 'Dr. Rachel Adams',
    dateLabel: '19 SEP',
    dayLabel: 'SUN',
    rawDate: '2026-09-19',
    time: '10:30 AM',
    duration: '45 min',
    status: 'Cancelled',
    cancelReason: 'Doctor emergency conflict',
    category: 'cancelled',
    phone: '+91 98555 66778'
  }
];

export default function Appointments() {
  const [appointments, setAppointments] = useState(INITIAL_MOCK_APPOINTMENTS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);

  // Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [reschedulingAppt, setReschedulingAppt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('10:00 AM');

  // New Appointment Form state
  const [newForm, setNewForm] = useState({
    patientName: '',
    department: 'Cardiology',
    doctor: 'Dr. Sarah Jenkins',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    duration: '30 min',
    phone: ''
  });

  const navigate = useNavigate();

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await fetchReferrals();
      
      if (Array.isArray(data) && data.length > 0) {
        // Map backend referrals to appointment items
        const realMapped = data.map((b, idx) => {
          const st = String(b.status || '').toUpperCase();
          let category = 'upcoming';
          let statusLabel = 'Confirmed';

          if (st === 'VISITED') {
            category = 'completed';
            statusLabel = 'Completed';
          } else if (st === 'LOST') {
            category = 'cancelled';
            statusLabel = 'Cancelled';
          } else if (st === 'CREATED' || st === 'CONTACTED') {
            category = 'upcoming';
            statusLabel = 'Pending';
          }

          const refDate = b.createdAt ? new Date(b.createdAt) : new Date();
          const dayName = refDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
          const dateMonth = refDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase();

          return {
            id: b.id,
            isRealReferral: true,
            patientName: b.patient?.name || 'Patient',
            department: b.department || 'Cardiology',
            doctor: b.doctor || b.specialist || 'Dr. Specialist',
            dateLabel: dateMonth,
            dayLabel: dayName,
            rawDate: refDate.toISOString().split('T')[0],
            time: idx % 2 === 0 ? '07:30 PM' : '09:00 PM',
            duration: '30 min',
            status: statusLabel,
            category,
            phone: b.patient?.phone || ''
          };
        });

        // Merge backend items with mock items avoiding duplicate IDs
        const existingIds = new Set(realMapped.map(r => r.id));
        const combined = [
          ...realMapped,
          ...INITIAL_MOCK_APPOINTMENTS.filter(m => !existingIds.has(m.id))
        ];
        setAppointments(combined);
      } else {
        setAppointments(INITIAL_MOCK_APPOINTMENTS);
      }
    } catch (err) {
      console.error('Failed to load appointments from referrals', err);
      setAppointments(INITIAL_MOCK_APPOINTMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // Filtered lists per tab
  const upcomingList = useMemo(() => appointments.filter(a => a.category === 'upcoming'), [appointments]);
  const completedList = useMemo(() => appointments.filter(a => a.category === 'completed'), [appointments]);
  const cancelledList = useMemo(() => appointments.filter(a => a.category === 'cancelled'), [appointments]);

  // Current tab items matching search and department filter
  const displayedAppointments = useMemo(() => {
    let list = [];
    if (activeTab === 'upcoming') list = upcomingList;
    else if (activeTab === 'completed') list = completedList;
    else if (activeTab === 'cancelled') list = cancelledList;

    return list.filter(appt => {
      const matchSearch = appt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          appt.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (appt.doctor && appt.doctor.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchDept = deptFilter === 'ALL' || appt.department.toLowerCase() === deptFilter.toLowerCase();
      return matchSearch && matchDept;
    });
  }, [activeTab, upcomingList, completedList, cancelledList, searchQuery, deptFilter]);

  // Actions
  const handleMarkCompleted = async (e, appt) => {
    e.stopPropagation();
    try {
      if (appt.isRealReferral) {
        await updateReferralStatus(appt.id, { status: 'VISITED' });
      }
      setAppointments(prev => prev.map(a => 
        a.id === appt.id ? { ...a, category: 'completed', status: 'Completed' } : a
      ));
      toast.success(`Visit with ${appt.patientName} marked as Completed!`, { icon: '✅' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to mark appointment as completed');
    }
  };

  const handleCancelAppointment = async (e, appt) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to cancel the appointment for ${appt.patientName}?`)) {
      try {
        if (appt.isRealReferral) {
          await updateReferralStatus(appt.id, { status: 'LOST', note: 'Appointment cancelled by user' });
        }
        setAppointments(prev => prev.map(a => 
          a.id === appt.id ? { ...a, category: 'cancelled', status: 'Cancelled', cancelReason: 'Cancelled by staff' } : a
        ));
        toast.success(`Appointment for ${appt.patientName} cancelled.`);
      } catch (err) {
        console.error(err);
        toast.error('Failed to cancel appointment');
      }
    }
  };

  const handleReopenToUpcoming = async (e, appt) => {
    e.stopPropagation();
    try {
      if (appt.isRealReferral) {
        await updateReferralStatus(appt.id, { status: 'BOOKED' });
      }
      setAppointments(prev => prev.map(a => 
        a.id === appt.id ? { ...a, category: 'upcoming', status: 'Confirmed' } : a
      ));
      toast.success(`Appointment for ${appt.patientName} moved back to Upcoming!`, { icon: '🔄' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to restore appointment');
    }
  };

  const handleSendReminder = (e, appt) => {
    e.stopPropagation();
    const phone = appt.phone || '+91 98765 43210';
    toast.success(`WhatsApp reminder sent to ${appt.patientName} (${phone}) for ${appt.dateLabel} at ${appt.time}!`, {
      icon: '📱',
      duration: 4000
    });
  };

  const handleOpenReschedule = (e, appt) => {
    e.stopPropagation();
    setReschedulingAppt(appt);
    setRescheduleDate(appt.rawDate || new Date().toISOString().split('T')[0]);
    setRescheduleTime(appt.time || '10:00 AM');
  };

  const handleSaveReschedule = (e) => {
    e.preventDefault();
    if (!reschedulingAppt) return;

    const parts = rescheduleDate.split('-');
    let dateLabel = reschedulingAppt.dateLabel;
    let dayLabel = reschedulingAppt.dayLabel;

    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      dateLabel = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase();
    }

    setAppointments(prev => prev.map(a => {
      if (a.id === reschedulingAppt.id) {
        return {
          ...a,
          category: 'upcoming',
          status: 'Confirmed',
          rawDate: rescheduleDate,
          time: rescheduleTime,
          dateLabel,
          dayLabel
        };
      }
      return a;
    }));

    toast.success(`Appointment for ${reschedulingAppt.patientName} rescheduled to ${dateLabel} at ${rescheduleTime}!`, { icon: '📅' });
    setReschedulingAppt(null);
  };

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    if (!newForm.patientName) {
      toast.error('Please enter patient name');
      return;
    }

    const parts = newForm.date.split('-');
    let dateLabel = '26 SEP';
    let dayLabel = 'SUN';

    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      dateLabel = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase();
    }

    const newAppt = {
      id: `new-${Date.now()}`,
      patientName: newForm.patientName,
      department: newForm.department,
      doctor: newForm.doctor,
      dateLabel,
      dayLabel,
      rawDate: newForm.date,
      time: newForm.time,
      duration: newForm.duration,
      status: 'Confirmed',
      category: 'upcoming',
      phone: newForm.phone || '+91 99999 88888'
    };

    setAppointments(prev => [newAppt, ...prev]);
    toast.success(`Visit scheduled for ${newForm.patientName} on ${dateLabel}!`, { icon: '🎉' });
    setIsScheduleModalOpen(false);
    setActiveTab('upcoming');
    setNewForm({
      patientName: '',
      department: 'Cardiology',
      doctor: 'Dr. Sarah Jenkins',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      duration: '30 min',
      phone: ''
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      <Toaster position="top-right" />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight m-0">Scheduled Visits</h1>
          <p className="text-sm text-slate-500 mt-1 m-0">
            Calendar and scheduling for specialist visits and patient consultations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-blue-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Visit</span>
          </button>

          <button 
            onClick={() => setIsFilterBarOpen(!isFilterBarOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isFilterBarOpen 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700 shadow-2xs'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* ── Filter Bar (Collapsible) ── */}
      {isFilterBarOpen && (
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 animate-in fade-in duration-150">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search patient, doctor, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Dermatology">Dermatology</option>
            </select>
          </div>

          {(searchQuery || deptFilter !== 'ALL') && (
            <button
              onClick={() => { setSearchQuery(''); setDeptFilter('ALL'); }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* ── Tabs Bar ── */}
      <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-xl text-xs font-medium w-fit">
        {[
          { id: 'upcoming', label: `Upcoming (${upcomingList.length})` },
          { id: 'completed', label: `Completed (${completedList.length})` },
          { id: 'cancelled', label: `Cancelled (${cancelledList.length})` }
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

      {/* ── Appointment Cards List ── */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200/80">
            Loading appointments...
          </div>
        ) : displayedAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-700 m-0">No {activeTab} appointments found</h3>
              <p className="text-xs text-slate-400 mt-1 m-0">
                {activeTab === 'upcoming' 
                  ? 'There are currently no visits scheduled. Click "Schedule Visit" to book one.'
                  : `There are no appointments marked as ${activeTab}.`}
              </p>
            </div>
            {activeTab === 'upcoming' && (
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Schedule New Visit
              </button>
            )}
          </div>
        ) : (
          displayedAppointments.map((appt) => {
            const isConfirmed = appt.status === 'Confirmed';
            const isCompleted = appt.category === 'completed';
            const isCancelled = appt.category === 'cancelled';

            return (
              <div
                key={appt.id}
                onClick={() => {
                  if (appt.isRealReferral) navigate(`/referral/${appt.id}`);
                }}
                className={`bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  appt.isRealReferral ? 'cursor-pointer' : ''
                }`}
              >
                {/* Left & Middle */}
                <div className="flex items-center gap-4">
                  
                  {/* Date Box on Left */}
                  <div className={`w-24 rounded-xl p-2.5 text-center shrink-0 flex flex-col justify-center border ${
                    isCompleted 
                      ? 'bg-emerald-50/70 border-emerald-100 text-emerald-800'
                      : isCancelled
                        ? 'bg-rose-50/70 border-rose-100 text-rose-800'
                        : 'bg-blue-50/80 border-blue-100 text-blue-900'
                  }`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                      isCompleted ? 'text-emerald-600' : isCancelled ? 'text-rose-600' : 'text-blue-600'
                    }`}>
                      {appt.dayLabel}
                    </span>
                    <span className="text-sm font-black leading-tight block">
                      {appt.dateLabel}
                    </span>
                    <span className={`text-[10px] font-semibold block mt-0.5 ${
                      isCompleted ? 'text-emerald-700' : isCancelled ? 'text-rose-700' : 'text-blue-700'
                    }`}>
                      {appt.time}
                    </span>
                  </div>

                  {/* Patient Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 m-0 group-hover:text-blue-600 transition-colors">
                        {appt.patientName}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isCancelled
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : isConfirmed 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {appt.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {appt.duration}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                        <Stethoscope className="w-3.5 h-3.5 text-blue-500" /> {appt.department}
                      </span>
                      {appt.doctor && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-500">{appt.doctor}</span>
                        </>
                      )}
                      {appt.cancelReason && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-rose-600 font-medium italic">
                            Reason: {appt.cancelReason}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap" onClick={(e) => e.stopPropagation()}>
                  
                  {/* Actions for UPCOMING */}
                  {activeTab === 'upcoming' && (
                    <>
                      <button
                        onClick={(e) => handleSendReminder(e, appt)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title="Send WhatsApp Reminder"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Reminder</span>
                      </button>

                      <button
                        onClick={(e) => handleOpenReschedule(e, appt)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <RefreshCw className="w-3 h-3 text-slate-400" />
                        <span>Reschedule</span>
                      </button>

                      <button
                        onClick={(e) => handleMarkCompleted(e, appt)}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-colors cursor-pointer border border-emerald-200"
                        title="Mark as Completed"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => handleCancelAppointment(e, appt)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                        title="Cancel Appointment"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Actions for COMPLETED */}
                  {activeTab === 'completed' && (
                    <>
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mr-2">
                        <Check className="w-3.5 h-3.5" /> Visit Finished
                      </span>
                      <button
                        onClick={(e) => handleReopenToUpcoming(e, appt)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <RefreshCw className="w-3 h-3 text-slate-400" />
                        <span>Move to Upcoming</span>
                      </button>
                    </>
                  )}

                  {/* Actions for CANCELLED */}
                  {activeTab === 'cancelled' && (
                    <>
                      <button
                        onClick={(e) => handleOpenReschedule(e, appt)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Re-book Appointment</span>
                      </button>
                    </>
                  )}

                  {appt.isRealReferral && (
                    <button
                      onClick={() => navigate(`/referral/${appt.id}`)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                      title="View Referral Profile"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ── Schedule Visit Modal ── */}
      {isScheduleModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsScheduleModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-slate-800">Schedule Specialist Visit</h2>
                <p className="text-xs text-slate-500">Book an appointment for consultation</p>
              </div>
              <button 
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Patient Name *</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Maya Krishnan"
                  value={newForm.patientName}
                  onChange={(e) => setNewForm({ ...newForm, patientName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phone Number (for WhatsApp Reminder)</label>
                <input 
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={newForm.phone}
                  onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <select 
                    value={newForm.department}
                    onChange={(e) => setNewForm({ ...newForm, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Dermatology">Dermatology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Doctor / Specialist</label>
                  <input 
                    type="text"
                    value={newForm.doctor}
                    onChange={(e) => setNewForm({ ...newForm, doctor: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date</label>
                  <input 
                    required
                    type="date"
                    value={newForm.date}
                    onChange={(e) => setNewForm({ ...newForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Time</label>
                  <select 
                    value={newForm.time}
                    onChange={(e) => setNewForm({ ...newForm, time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                    <option value="07:30 PM">07:30 PM</option>
                    <option value="09:00 PM">09:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Reschedule Modal ── */}
      {reschedulingAppt && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setReschedulingAppt(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-slate-800">Reschedule Visit</h2>
                <p className="text-xs text-slate-500">{reschedulingAppt.patientName} • {reschedulingAppt.department}</p>
              </div>
              <button 
                onClick={() => setReschedulingAppt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReschedule} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">New Date</label>
                <input 
                  required
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">New Time</label>
                <select 
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                  <option value="07:30 PM">07:30 PM</option>
                  <option value="09:00 PM">09:00 PM</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReschedulingAppt(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors cursor-pointer"
                >
                  Update Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}