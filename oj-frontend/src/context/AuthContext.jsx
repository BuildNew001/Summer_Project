import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To track initial auth check
  const navigate = useNavigate();
  const BASE_URL = 'http://localhost:5000';
  const checkAuth = async () => {
    try {
      setLoading(true);
      // API call to your backend to get current user status
      // Assuming your /me endpoint is also under /api/auth/
      const { data } = await axios.get(`${BASE_URL}/api/auth/me`, {
        withCredentials: true, // Important for sending cookies
      });
      setUser(data.user || data); // Adjust based on your backend response structure
    } catch (error) {
      setUser(null); // No user or error fetching status
    } finally {
      setLoading(false);
    }
  };

  // Call checkAuth when the AuthProvider mounts
  useEffect(() => {
    checkAuth();
  }, []);

  const register = async (userData) => {
    try {
      // API call to your backend's registration endpoint
      const { data } = await axios.post(`${BASE_URL}/api/auth/signup`, userData, {
        withCredentials: true,
      });
      setUser(data.user); // Assuming backend returns the user object
      toast.success('Account created successfully!');
      navigate('/'); // Redirect to home or dashboard after signup
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
      throw error; // Re-throw to be caught by the form
    }
  };

  const login = async (credentials) => {
    try {
      // API call to your backend's login endpoint
      const { data } = await axios.post(`${BASE_URL}/api/auth/login`, credentials, {
        withCredentials: true,
      });
      setUser(data.user); // Assuming backend returns the user object
      toast.success('Logged in successfully!');
      navigate('/'); // Redirect to home or dashboard after login
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      throw error; // Re-throw to be caught by the form
    }
  };

  const logout = async () => {
    try {
      // API call to your backend's logout endpoint
      // Assuming your /logout endpoint is also under /api/auth/
      await axios.post(`${BASE_URL}/api/auth/logout`, {}, {
        withCredentials: true,
      });
      setUser(null);
      toast.info('Logged out successfully.');
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Logout failed. Please try again.');
    setUser(null);
      navigate('/login');
    }
  };

  const value = {
    user,
    loading,
    checkAuth, 
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