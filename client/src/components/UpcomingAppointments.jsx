import { Calendar, Clock, ChevronRight } from 'lucide-react';

const defaultAppointments = [
  { id: 1, patient: 'Ravi Kumar', time: '10:00 AM', dept: 'Cardiology' },
  { id: 2, patient: 'Arun', time: '11:30 AM', dept: 'Orthopedics' },
  { id: 3, patient: 'Priya Sharma', time: '02:15 PM', dept: 'Neurology' },
];

const UpcomingAppointments = ({ appointments = defaultAppointments }) => {
  return (
    <div style={{ 
      background: 'white', 
      padding: '1.5rem', 
      borderRadius: '1.25rem', 
      border: '1px solid var(--border)',
      boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>Upcoming</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {appointments.length === 0 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            No upcoming appointments yet.
          </div>
        )}
        {appointments.map((appt) => (
          <div key={appt.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '0.75rem', background: '#f9fafb', border: '1px solid var(--border)' }}>
            <div style={{ background: 'white', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--primary)' }}>
              <Calendar size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>{appt.patient}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} /> {appt.time} • {appt.dept}
              </div>
            </div>
            <ChevronRight size={16} color="#98a2b3" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingAppointments;
