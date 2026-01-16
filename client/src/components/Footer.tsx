import React from 'react';
import { Box, Typography, Container, Link as MuiLink, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'grey.200' }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} ClearTax.
          </Typography>
          <Stack direction="row" spacing={3}>
            <MuiLink component={RouterLink} to="/privacy" color="inherit" underline="hover">
              Privacy Policy
            </MuiLink>
            <MuiLink component={RouterLink} to="/tos" color="inherit" underline="hover">
              Terms of Service
            </MuiLink>
            <MuiLink href="mailto:support@cleartax.gov" color="inherit" underline="hover">
              Contact Us
            </MuiLink>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;