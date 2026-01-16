import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; 
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/cleartax">
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;