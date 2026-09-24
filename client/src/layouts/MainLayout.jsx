import { useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './MainLayout.css';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Topbar from '../components/Topbar';

const MainLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifiedIds, setNotifiedIds] = useState(new Set());
  const notifiedIdsRef = useRef(notifiedIds);

  useEffect(() => {
    notifiedIdsRef.current = notifiedIds;
  }, [notifiedIds]);

  useEffect(() => {
    if (!user?.email) return;
    
    const checkNotifications = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/discharge/notifications?email=${user.email}`);
        const unread = res.data;
        
        const currentNotified = new Set(notifiedIdsRef.current);
        let hasNew = false;

        unread.forEach(notification => {
          if (!currentNotified.has(notification.id)) {
            currentNotified.add(notification.id);
            hasNew = true;
            
            const Msg = ({ closeToast }) => (
              <div onClick={() => {
                closeToast();
                navigate(`/referral/${notification.referral_id}`);
              }} style={{ cursor: 'pointer' }}>
                <b style={{ display: 'block', marginBottom: '4px' }}>🚨 Incoming Referral Alert</b>
                <span style={{ fontSize: '14px' }}>
                  New transfer for <b>{notification.patient_name}</b> has arrived at your facility. Click to view.
                </span>
              </div>
            );

            toast.info(<Msg />, {
              position: "top-right",
              autoClose: false,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            });
          }
        });

        if (hasNew) {
          setNotifiedIds(currentNotified);
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 5000);
    return () => clearInterval(interval);
  }, [user?.email, navigate]);

  return (
    <div className="main-layout">
      <ToastContainer />
      <Sidebar />
      <div className="content-wrapper">
        <Topbar />
        <main className="main-content-body">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ width: '100%' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
