import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const AdminOrSetterRoute = () => {
  const { user } = useAuth();
  const allowedRoles = ['admin', 'setter'];

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminOrSetterRoute;