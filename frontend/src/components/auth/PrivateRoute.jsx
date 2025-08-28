import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRole }) => {
  const { userProfile } = useAuth();
  
  if (!userProfile) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && userProfile.role !== requiredRole && userProfile.role !== 'admin') {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

export default PrivateRoute;