import React from 'react';
import { Typography, Container, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

function SuccessPage() {
  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          marginTop: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography component="h1" variant="h4" gutterBottom>
          Login/Signup Successful!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Welcome back to ClearTax.
        </Typography>
      </Box>
    </Container>
  );
}

export default SuccessPage;
