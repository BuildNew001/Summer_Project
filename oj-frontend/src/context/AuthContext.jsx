import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'sonner';
import { io } from 'socket.io-client'; 

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error('Auth check failed:', error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []); 
  const register = useCallback(async (userData) => {
    try {
      await api.post('/api/auth/signup', userData);
      const { data } = await api.get('/api/auth/me');
      setUser(data);
      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
      throw error;
    }
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      await api.post('/api/auth/login', credentials);
      const { data } = await api.get('/api/auth/me');
      setUser(data);
      toast.success('Logged in successfully!');
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout', {});
      toast.info('Logged out successfully.');
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);
      toast.error('Logout failed on server, logging out locally.');
    } finally {
      setUser(null);
      navigate('/login');
    }
  }, [navigate]);

  const value = {
    user,
    setUser,
    loading,
    setLoading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;