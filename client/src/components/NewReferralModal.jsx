import { useState } from 'react';
import { X } from 'lucide-react';
import { createReferral } from '../api/client';

const NewReferralModal = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    department: 'Cardiology',
    specialist: '',
    notes: '',
    priority: 'normal'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createReferral(formData);
      onCreated();
    } catch (err) {
      alert('Failed to create referral');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'white', padding: '2rem', borderRadius: '1rem',
        width: '100%', maxWidth: '400px', position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <X size={20} color="#64748b" />
        </button>
        
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>New Referral</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Patient Name</label>
            <input 
              required
              type="text" 
              value={formData.patientName}
              onChange={(e) => setFormData({...formData, patientName: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Phone</label>
            <input 
              required
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Department</label>
              <select 
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
              >
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Priority</label>
              <select 
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Specialist (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Dr. Smith"
              value={formData.specialist}
              onChange={(e) => setFormData({...formData, specialist: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Notes</label>
            <textarea 
              rows={2}
              placeholder="Medical context or special instructions..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxSizing: 'border-box', resize: 'none' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Creating...' : 'Create Referral'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewReferralModal;