import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Mon', referrals: 45, income: 12.5 },
  { name: 'Tue', referrals: 52, income: 15.2 },
  { name: 'Wed', referrals: 38, income: 10.8 },
  { name: 'Thu', referrals: 65, income: 18.5 },
  { name: 'Fri', referrals: 48, income: 13.9 },
  { name: 'Sat', referrals: 24, income: 6.2 },
  { name: 'Sun', referrals: 18, income: 4.8 },
];

const ReferralChart = () => {
  return (
    <div style={{ 
      background: 'white', 
      padding: '1.5rem', 
      borderRadius: '1.25rem', 
      border: 'none',
      height: '340px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Patient Volume & Revenue Inflow</h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.25rem 0 0', fontWeight: '500' }}>Weekly performance metrics (Income in $k)</p>
        </div>
        <div style={{ background: '#f8fafc', padding: '0.35rem 0.75rem', borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', border: '1px solid #e2e8f0' }}>
          Last 7 Days
        </div>
      </div>
      
      <div style={{ width: '100%', height: '240px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorReferrals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
              tickFormatter={(value) => `$${value}k`}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                fontSize: '13px',
                fontWeight: '600'
              }}
            />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="referrals" 
              name="Volume"
              stroke="#4f46e5" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorReferrals)" 
            />
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="income" 
              name="Revenue"
              stroke="#10b981" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorIncome)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReferralChart;
