import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation(); 

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
       
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        
        const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
         console.warn(`Unauthorized access attempt to ${location.pathname} by user role: ${user.role}. Required: ${allowedRoles.join(', ')}`);

         return <Navigate to={dashboardPath} replace />;
    }

    return <Outlet />; 
};

export default ProtectedRoute;