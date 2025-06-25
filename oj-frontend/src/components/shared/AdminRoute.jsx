import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const AdminRoute = () => {
  const { user: authUser } = useAuth();

  // Note: This component should be nested inside a ProtectedRoute, so authUser should exist.
  // The check for role is the primary purpose here.
  if (authUser?.role !== 'admin') {
    toast.error("Access Denied: You don't have permission to view this page.");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;