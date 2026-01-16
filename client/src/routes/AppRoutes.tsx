import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout
import AppLayout from '../layouts/AppLayout';

// Pages
import HomePage from '../pages/HomePage';
import SignupPage from '../pages/SignupPage';
import LoginPage from '../pages/LoginPage';
import SuccessPage from '../pages/SuccessPage';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsOfService from '../pages/TermsOfService';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="success" element={<SuccessPage />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="tos" element={<TermsOfService />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;