import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Stack, Button, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth'; 
import Footer from '../components/Footer';
import Logo from '../assets/logo.png';

const AppLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/'); 
  };

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