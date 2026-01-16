import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Fictional example of Privacy Policy: "Your Data, Your Vote"</Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Last Updated: {new Date().toLocaleDateString()}
        </Typography>
        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom><strong>Data Collection & Usage</strong></Typography>
          <Typography variant="body1">
            <strong>Identity Verification:</strong> To ensure "one taxpayer, one vote," we collect government-issued IDs or Taxpayer Identification Numbers (TIN).
          </Typography>
          <Typography variant="body1">
            <strong>Financial Data:</strong> We access tax contribution records solely to determine your "Allocation Power." We do not store bank account login credentials.
          </Typography>
          <Typography variant="body1">
            <strong>Project Preferences:</strong> We track which projects you fund (e.g., Repairing Potholes on Silver Lining Boulevard) to provide real-time community impact updates.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom><strong>Anonymization Protocol</strong></Typography>
          <Typography variant="body1">
            <strong>The "Wall of Privacy":</strong> While your total tax contribution is verified, your specific project allocations are decoupled from your legal identity in our public-facing ledger. Community results are shown in aggregate to prevent "wealth-based" social profiling.
          </Typography>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom><strong>Data Retention</strong></Typography>
          <Typography variant="body1">
            Tax data is refreshed annually. Historical allocation data is kept for five years to provide you with your "Impact Heritage" dashboard.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;