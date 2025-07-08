import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'sonner';

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
        console.log('Active session found.');
      } catch (error) {
        console.log('No active session found.');
        setUser(null); 
      }
      setLoading(false);
    };
    checkAuthStatus();
  }, []);


  const register = async (userData) => {
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
  };

  const login = async (credentials) => {
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
  };

  const logout = async () => {
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
  };

  const value = {
    user,
    loading,
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
