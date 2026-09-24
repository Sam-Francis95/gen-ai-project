import { motion } from 'framer-motion';
import { 
  Check, 
  PlusCircle, 
  MessageSquare, 
  Bell, 
  CalendarCheck, 
  UserCheck 
} from 'lucide-react';
import './ReferralTimeline.css';

const steps = [
  {
    id: 1,
    title: 'Referral Created',
    description: 'Patient referral has been logged in the system',
    icon: <PlusCircle size={16} />,
    time: '09:00 AM'
  },
  {
    id: 2,
    title: 'WhatsApp Sent',
    description: 'Initial contact made via WhatsApp message',
    icon: <MessageSquare size={16} />,
    time: '10:30 AM'
  },
  {
    id: 3,
    title: 'Reminder Sent',
    description: 'Follow-up reminder for appointment booking',
    icon: <Bell size={16} />,
    time: 'Yesterday'
  },
  {
    id: 4,
    title: 'Appointment Booked',
    description: 'Patient confirmed appointment for Cardiology',
    icon: <CalendarCheck size={16} />,
    time: 'Today'
  },
  {
    id: 5,
    title: 'Patient Visited',
    description: 'Consultation completed successfully',
    icon: <UserCheck size={16} />,
    time: 'Just now'
  }
];

const ReferralTimeline = ({ currentStep = 4, patientName = 'Patient' }) => {
  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h2>Referral Journey</h2>
        <p>Tracking progress for {patientName}</p>
      </div>

      <div className="timeline-steps">
        {/* Animated Background Line */}
        <div className="timeline-line">
          <motion.div 
            className="timeline-line-progress"
            initial={{ height: 0 }}
            animate={{ height: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        </div>

        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isPending = step.id > currentStep;

          return (
            <motion.div 
              key={step.id} 
              className="timeline-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`step-indicator ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                {isCompleted ? <Check size={18} /> : step.icon}
              </div>
              
              <div className="step-content">
                <span className="step-title" style={{ color: isPending ? '#94a3b8' : 'inherit' }}>
                  {step.title}
                </span>
                <p className="step-description">
                  {step.description}
                </p>
                {(!isPending || isActive) && (
                  <span className="step-time">{step.time}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ReferralTimeline;
