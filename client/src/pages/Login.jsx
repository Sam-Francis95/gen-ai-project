import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Activity, Mail, Lock, Building2 } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';

export default function Login() {
  const { login, register, user, loading } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  
  const [formData, setFormData] = useState({
    hospitalName: '',
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mockHospitals = [
    { name: 'CareFlow Admin (Sender)', email: 'admin@careflow.ai' },
    { name: 'Apollo Care Center', email: 'apollo@careflow.ai' },
    { name: 'City General Hospital', email: 'city@careflow.ai' },
    { name: 'Metro Heart Institute', email: 'metro@careflow.ai' },
    { name: 'Sunshine Pediatric Care', email: 'sunshine@careflow.ai' },
    { name: 'Global Neuro Center', email: 'global@careflow.ai' }
  ];

  const handleQuickSelect = (e) => {
    const email = e.target.value;
    if (email) {
      setFormData(prev => ({ ...prev, email, password: 'demo1234' }));
    }
  };

  // If already logged in, redirect to dashboard
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let result;
    if (isRegister) {
      result = await register(formData.hospitalName, formData.email, formData.password);
    } else {
      result = await login(formData.email, formData.password);
    }
    
    if (result.success) {
      navigate('/');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        <div className="p-8 pb-6 border-b border-slate-100 bg-slate-50 flex flex-col items-center">
          <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
            <Activity className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CareFlow AI</h1>
          <p className="text-slate-500 text-sm mt-1 text-center">Revenue recovery & patient continuity platform</p>
        </div>

        <div className="p-8 pt-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 text-center">
            {isRegister ? 'Register Hospital' : 'Hospital Login'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Hospital Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-slate-50"
                    placeholder="CareFlow General Hospital"
                  />
                </div>
              </div>
            )}

            {!isRegister && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Quick Select Demo Hospital</label>
                <select 
                  onChange={handleQuickSelect}
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-slate-50 cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>-- Select a hospital to auto-fill --</option>
                  {mockHospitals.map(h => (
                    <option key={h.email} value={h.email}>{h.name} ({h.email})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-slate-50"
                  placeholder="admin@hospital.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-slate-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors mt-2"
            >
              {isSubmitting ? 'Processing...' : (isRegister ? 'Register' : 'Sign in')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            <p>Select a hospital from the dropdown or use demo credentials:</p>
            <p>admin@careflow.ai / demo1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}
