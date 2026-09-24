import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, Calendar, Clock, XCircle } from 'lucide-react';
import { updateReferralStatus } from '../api/client';
import './WhatsAppCard.css';

const WhatsAppCard = ({ patientName = 'Ravi Kumar', department = 'Cardiology', referralId, currentStatus, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const status = currentStatus; // controlled

  const handleAction = async (action) => {
    let nextStatus = '';
    if (action === 'BOOKED') nextStatus = 'BOOKED';
    if (action === 'RESCHEDULED') nextStatus = 'CONTACTED';
    if (action === 'IGNORED') nextStatus = 'LOST';
    
    if (referralId && nextStatus) {
      setLoading(true);
      try {
        await updateReferralStatus(referralId, { status: nextStatus, note: `Patient selected ${action} via WhatsApp` });
        if (onStatusChange) onStatusChange();
      } catch (err) {
        alert('Failed to update status.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="whatsapp-container">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="whatsapp-bubble">
          <p className="message-text">
            Hello {patientName}, You have been referred to <strong>{department}</strong> at CareFlow Hospital. Please choose an action below to proceed.
          </p>
          <div className="message-meta">
            10:45 AM 
            <CheckCheck size={14} color="#53bdeb" />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {(status === 'CREATED' || status === 'CONTACTED') && (
          <motion.div 
            className="whatsapp-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
          >
            <button 
              className="whatsapp-btn primary"
              disabled={loading}
              onClick={() => handleAction('BOOKED')}
            >
              <Calendar size={18} />
              Book Appointment
            </button>
            <button 
              className="whatsapp-btn"
              disabled={loading}
              onClick={() => handleAction('RESCHEDULED')}
            >
              <Clock size={18} />
              Contact Staff
            </button>
            <button 
              className="whatsapp-btn"
              disabled={loading}
              style={{ color: '#ea4335' }}
              onClick={() => handleAction('IGNORED')}
            >
              <XCircle size={18} />
              Not Interested
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {status !== 'CREATED' && status !== 'CONTACTED' && (
        <motion.div 
          className="status-indicator"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {status === 'BOOKED' && "✓ Appointment Booking Initiated"}
          {status === 'VISITED' && "✓ Patient has Visited"}
          {status === 'LOST' && "✕ Referral Marked as Lost/Ignored"}
        </motion.div>
      )}
    </div>
  );
};

export default WhatsAppCard;
