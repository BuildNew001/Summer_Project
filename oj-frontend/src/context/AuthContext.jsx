import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();
  const BASE_URL = 'http://localhost:5000';

   useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/auth/me`, {
          withCredentials: true,
        });
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
      const { data } = await axios.post(`${BASE_URL}/api/auth/signup`, userData, {
        withCredentials: true,
      });
       setUser(data.user || data);
      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
      throw error; 
    }
  };

  const login = async (credentials) => {
    try {
      const { data } = await axios.post(`${BASE_URL}/api/auth/login`, credentials, {
        withCredentials: true,
      });
      setUser(data.user || data);
      toast.success('Logged in successfully!');
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      throw error; 
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
        withCredentials: true,
      });
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
