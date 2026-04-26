import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'; // 1. Added useLocation
import { Stack, Button, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth'; 
import Footer from '../components/Footer';
import Logo from '../assets/logo.png';

const AppLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // 2. Initialize location hook

  const handleLogout = async () => {
    await logout();
    navigate('/'); 
  };

  // 3. Logic to determine where the "Profile" button should go
  const handleNavigationToggle = () => {
    if (location.pathname === '/') {
      // If on main page, go to the appropriate dashboard
      if (user?.role_id === 1) {
        navigate('/regular-dashboard');
      } else if (user?.role_id === 2) {
        navigate('/company-dashboard');
      }
    } else {
      // If on any other page (like a dashboard), go back to main
      navigate('/');
    }
  };

  // 4. Dynamic button text based on current route
  const dynamicButtonText = location.pathname === '/' ? "Go to profile" : "Go to main page";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className='app-header'>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src={Logo} className='logo' alt="ClearTax" />
        </Link>
        <Stack spacing={2} direction="row" alignItems="center">
          {isAuthenticated ? (
            <>
              <Typography variant="h6">Welcome, {user?.username}!</Typography>
              
              {/* 5. The Dynamic Navigation Button */}
              <Button 
                variant="outlined" 
                onClick={handleNavigationToggle}
                sx={{ color: 'black', borderColor: 'black', '&:hover': { borderColor: 'grey.300', bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                {dynamicButtonText}
              </Button>

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

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default AppLayout;
