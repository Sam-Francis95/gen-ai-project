import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('careflow_token');
    if (token) {
      axios.get('http://localhost:5000/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setUser(res.data);
      }).catch(err => {
        console.error("Auth verification failed", err);
        localStorage.removeItem('careflow_token');
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('careflow_token', token);
      setUser(user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('careflow_token');
    setUser(null);
    window.location.href = '/login';
  };

  const register = async (hospitalName, email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/auth/register', { hospitalName, email, password });
      const { token, user } = res.data;
      localStorage.setItem('careflow_token', token);
      setUser(user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
