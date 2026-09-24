import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import ReferralDetails from './pages/ReferralDetails'
import ReferralsList from './pages/ReferralsList'
import Appointments from './pages/Appointments'
import Patients from './pages/Patients'
import Settings from './pages/Settings'
import DischargeAI from './pages/DischargeAI'
import Login from './pages/Login'
import Analytics from './pages/Analytics'
import FollowUps from './pages/FollowUps'
import IncomingReferrals from './pages/IncomingReferrals'
import { AuthProvider, useAuth } from './contexts/AuthContext'

import { AnimatePresence } from 'framer-motion'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="referrals" element={<ReferralsList />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="patients" element={<Patients />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="follow-ups" element={<FollowUps />} />
              <Route path="incoming" element={<IncomingReferrals />} />
              <Route path="settings" element={<Settings />} />
              <Route path="referral/:id" element={<ReferralDetails />} />
              <Route path="discharge" element={<DischargeAI />} />
              <Route path="*" element={<Dashboard />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  )
}

export default App
