import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../lib/api';
import { toast } from 'sonner';

const AuthContext = createContext(undefined);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCollabSession, setActiveCollabSession] = useState(() => {
    try {
      const item = window.localStorage.getItem('activeCollabSession');
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to read session from localStorage', error);
      return null;
    }
  });
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  const activeCollabSessionRef = useRef(activeCollabSession);

  useEffect(() => {
    activeCollabSessionRef.current = activeCollabSession;
  }, [activeCollabSession]);

  useEffect(() => {
    if (activeCollabSession) {
      localStorage.setItem('activeCollabSession', JSON.stringify(activeCollabSession));
    } else {
      localStorage.removeItem('activeCollabSession');
    }
  }, [activeCollabSession]);

  useEffect(() => {
    if (user) {
      const newSocket = io(SOCKET_URL, {
        withCredentials: true, 
      });
      setSocket(newSocket);

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        toast.error(`Collaboration service connection failed: ${err.message}`);
      });

      const handleSessionEnded = ({ reason }) => {
        if (!activeCollabSessionRef.current) return;

        toast.info(reason || 'The collaboration session has ended.');
        const previousSession = activeCollabSessionRef.current;
        localStorage.removeItem('activeCollabSession');
        setActiveCollabSession(null);
        if (previousSession) {
          navigate(`/problems/${previousSession.problemId}`);
        }
      };

      const handleSessionLeft = () => {
        toast.success("You have successfully left the session.");
        const previousSession = activeCollabSessionRef.current;
        localStorage.removeItem('activeCollabSession');
        setActiveCollabSession(null);
        if (previousSession) {
          navigate(`/problems/${previousSession.problemId}`);
        }
      };

      newSocket.on('collab-session-ended', handleSessionEnded);
      newSocket.on('session-left-successfully', handleSessionLeft);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, navigate]);

   useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data);
      } catch (error) {
        setUser(null);
        if (activeCollabSession) {
          localStorage.removeItem('activeCollabSession');
          setActiveCollabSession(null);
        }
      }
      setLoading(false);
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
      setSocket(null);
      setUser(null);
      localStorage.removeItem('activeCollabSession');
      setActiveCollabSession(null); 
      navigate('/login');
    }
  }, [navigate]);

  const startCollabSession = useCallback((roomId, problemId, isHost = false) => {
    if (socket) {
      const sessionData = { roomId, user, isHost, problemId };
      setActiveCollabSession(sessionData);
    } else {
      toast.error('Collaboration service is not connected. Please try again.');
    }
  }, [socket, user]);

  const endCollabSession = useCallback(() => {
    if (!activeCollabSession) return;
    if (socket) {
      socket.emit('end-session', { roomId: activeCollabSession.roomId });
    }
  }, [activeCollabSession, socket]);

  const leaveCollabSession = useCallback(() => {
    if (socket && activeCollabSession) {
      socket.emit('leave-session', { roomId: activeCollabSession.roomId });
    }
  }, [socket, activeCollabSession]);

  const value = useMemo(() => ({
    user,
    loading,
    socket,
    register,
    login,
    logout,
    activeCollabSession,
    startCollabSession,
    endCollabSession,
    leaveCollabSession,
  }), [user, loading, socket, activeCollabSession, register, login, logout, startCollabSession, endCollabSession, leaveCollabSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
