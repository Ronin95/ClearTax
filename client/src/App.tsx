import React from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet, useNavigate } from 'react-router-dom';
import './App.css';

// Import the AuthProvider and useAuth hook
import { AuthProvider } from './context/AuthContext'; 
import { useAuth } from './hooks/useAuth'; 

// Import your page components
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import SuccessPage from './pages/SuccessPage';

// Import Material UI components
import { Stack, Button, Typography } from '@mui/material';
import Logo from './assets/logo.png';

function AppLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/'); 
  };

  return (
    <>
      <header className='app-header'>
        <div>
          <img src={Logo} className='logo' alt="ClearTax" />
        </div>
        <Stack spacing={2} direction="row" alignItems="center">
          {isAuthenticated ? (
            <>
              <Typography variant="h6" component="p">
                Welcome, {user?.username}!
              </Typography>
              <Button variant="contained" onClick={handleLogout}>Log Out</Button>
            </>
          ) : (
            <>
              <Button variant="contained" component={Link} to="/signup">Sign up</Button>
              <Button variant="outlined" component={Link} to="/login">Log in</Button>
            </>
          )}
        </Stack>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}

function App() {
  return (
    // Wrap the entire app in the AuthProvider
    <AuthProvider>
      <BrowserRouter basename="/cleartax">
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="success" element={<SuccessPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
