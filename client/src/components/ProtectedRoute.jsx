import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wrapper for routes that require authentication (or specific roles)
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent', width: '2rem', height: '2rem' }}></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page and preserve where the user was trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    // Redirect non-admins away from admin panel
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

