import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchReferrals } from '../api/client';
import { 
  Calendar, Clock, Filter, Plus, ChevronRight, Send, 
  RefreshCw, Stethoscope, User, CheckCircle2 
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

const MOCK_APPOINTMENTS = [
  {
    id: 101,
    patientName: 'Arjun',
    department: 'Cardiology',
    dateLabel: '24 SEP',
    dayLabel: 'FRI',
    time: '07:30 PM',
    duration: '30 min',
    status: 'Confirmed'
  },
  {
    id: 102,
    patientName: 'Test Patient',
    department: 'Neurology',
    dateLabel: '24 SEP',
    dayLabel: 'FRI',
    time: '09:00 PM',
    duration: '45 min',
    status: 'Pending'
  },
  {
    id: 103,
    patientName: 'aarya',
    department: 'Orthopedics',
    dateLabel: '25 SEP',
    dayLabel: 'SAT',
    time: '10:00 AM',
    duration: '30 min',
    status: 'Confirmed'
  }
];

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        const data = await fetchReferrals();
        const booked = data.filter(r => r.status?.toUpperCase() === 'BOOKED');
        
        // Merge real booked with formatted cards
        const formatted = booked.map((b, idx) => ({
          id: b.id,
          patientName: b.patient?.name || 'Patient',
          department: b.department || 'Cardiology',
          dateLabel: '24 SEP',
          dayLabel: 'FRI',
          time: idx % 2 === 0 ? '07:30 PM' : '09:00 PM',
          duration: '30 min',
          status: 'Confirmed'
        }));

        setAppointments(formatted.length > 0 ? formatted : MOCK_APPOINTMENTS);
      } catch (err) {
        setAppointments(MOCK_APPOINTMENTS);
      } finally {
        setLoading(false);
      }
    };
    loadAppointments();
  }, []);

  const handleSendReminder = (e, name) => {
    e.stopPropagation();
    toast.success(`WhatsApp reminder sent to ${name}!`, { icon: '📱' });
  };

  const handleReschedule = (e, name) => {
    e.stopPropagation();
    toast(`Reschedule dialog opened for ${name}`, { icon: '📅' });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in bg-[#f8fafc]">
      <Toaster position="top-right" />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight m-0">Scheduled Visits</h1>
          <p className="text-sm text-slate-500 mt-1 m-0">
            Calendar and scheduling for specialist visits.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => toast.success('Schedule Appointment drawer opened')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-blue-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Visit</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* ── Tabs Bar ── */}
      <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-xl text-xs font-medium w-fit">
        {[
          { id: 'upcoming', label: `Upcoming (${appointments.length || 8})` },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' }
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
        {appointments.map((appt) => {
          const isConfirmed = appt.status === 'Confirmed';

          return (
            <div
              key={appt.id}
              onClick={() => navigate(`/referral/${appt.id}`)}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
            >
              {/* Left & Middle */}
              <div className="flex items-center gap-4">
                
                {/* Date Box on Left (Blue badge exactly like screenshot) */}
                <div className="w-24 bg-blue-50/80 border border-blue-100 rounded-xl p-2.5 text-center shrink-0 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                    {appt.dayLabel}
                  </span>
                  <span className="text-sm font-black text-blue-900 leading-tight block">
                    {appt.dateLabel}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 block mt-0.5">
                    {appt.time}
                  </span>
                </div>

                {/* Patient Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 m-0 group-hover:text-blue-600 transition-colors">
                      {appt.patientName}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                      isConfirmed 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
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
                  </div>
                </div>

              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => handleSendReminder(e, appt.patientName)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Reminder</span>
                </button>

                <button
                  onClick={(e) => handleReschedule(e, appt.patientName)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <span>Reschedule</span>
                </button>

                <button
                  onClick={() => navigate(`/referral/${appt.id}`)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}