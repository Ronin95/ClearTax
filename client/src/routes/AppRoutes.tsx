import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layout
import AppLayout from '../layouts/AppLayout';

// Pages
import HomePage from '../pages/HomePage';
import SignupPage from '../pages/SignupPage';
import LoginPage from '../pages/LoginPage';
import SuccessPage from '../pages/SuccessPage';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsOfService from '../pages/TermsOfService';
import RegularDashboard from '../pages/RegularDashboard';
import CompanyDashboard from '../pages/CompanyDashboard';

// A simple wrapper to protect routes based on login status and role
const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: number }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role_id !== allowedRole) {
    // Redirect to their correct dashboard if they try to access the wrong one
    return <Navigate to={user?.role_id === 2 ? "/company-dashboard" : "/regular-dashboard"} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="tos" element={<TermsOfService />} />
        <Route path="success" element={<SuccessPage />} />

        <Route 
          path="regular-dashboard" 
          element={
            <ProtectedRoute allowedRole={1}>
              <RegularDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="company-dashboard" 
          element={
            <ProtectedRoute allowedRole={2}>
              <CompanyDashboard />
            </ProtectedRoute>
          } 
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
