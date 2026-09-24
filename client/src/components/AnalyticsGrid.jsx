import { motion } from 'framer-motion';
import { 
  Users, 
  HeartPulse, 
  CalendarCheck, 
  UserMinus, 
  ArrowUpRight
} from 'lucide-react';
import './AnalyticsGrid.css';

const AnalyticsCard = ({ title, value, trend, icon: Icon, theme, delay }) => {
  const isPositive = !trend.startsWith('-');

  return (
    <motion.div 
      className={`glass-card ${theme}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
    >
      <div className="card-header">
        <div className="icon-box">
          <Icon size={24} />
        </div>
        <div className={`card-footer ${isPositive ? 'trend-up' : 'trend-down'}`}>
          <ArrowUpRight size={16} style={{ transform: isPositive ? 'none' : 'rotate(90deg)' }} />
          {trend}
        </div>
      </div>
      
      <div>
        <div className="card-title">{title}</div>
        <div className="card-value">{value}</div>
      </div>

      <div className="card-gradient-bg" style={{ 
        background: `radial-gradient(circle, var(--accent) 0%, transparent 70%)` 
      }} />
    </motion.div>
  );
};

const AnalyticsGrid = ({ stats }) => {
  const total = stats?.total ?? 0;
  const byStatus = stats?.byStatus ?? {};
  const booked = byStatus.BOOKED ?? 0;
  const visited = byStatus.VISITED ?? 0;
  const lost = byStatus.LOST ?? 0;
  const recoveryRate = total
    ? `${(((visited + booked) / total) * 100).toFixed(1)}%`
    : '0.0%';

  const cards = [
    {
      title: "Total Referrals",
      value: total.toLocaleString(),
      trend: "+0.0%",
      icon: Users,
      theme: "theme-blue",
      delay: 0.1
    },
    {
      title: "Recovery Rate",
      value: recoveryRate,
      trend: "+0.0%",
      icon: HeartPulse,
      theme: "theme-green",
      delay: 0.2
    },
    {
      title: "Total Revenue",
      value: `$${((visited + booked) * 15).toLocaleString()}k`,
      trend: "+12.5%",
      icon: CalendarCheck,
      theme: "theme-purple",
      delay: 0.3
    },
    {
      title: "Lost Referrals",
      value: lost.toLocaleString(),
      trend: "-0.0%",
      icon: UserMinus,
      theme: "theme-red",
      delay: 0.4
    }
  ];

  return (
    <div className="analytics-container">
      {cards.map((card, index) => (
        <AnalyticsCard key={index} {...card} />
      ))}
    </div>
  );
};

export default AnalyticsGrid;
