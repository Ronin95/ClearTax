import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const TermsOfService = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Fictional example of Terms of Service: "The Rules of Direct Democracy"</Typography>
        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6"><strong>1. Eligibility</strong></Typography>
          <Typography variant="body1">You must be a verified taxpayer within the participating districts (e.g., Ironworks District, Echo Valley).
          </Typography>
          <Typography variant="body1">Accounts are non-transferable. You cannot 'trade' or 'sell' your tax allocation power.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6"><strong>2. Nature of Allocation</strong></Typography>
          <Typography variant="body1">Binding Nature: ClearTax allocations are legally binding. Once a project reaches 100% funding via user tax-redirection, the municipal government is contractually obligated to begin construction within 90 days.
          </Typography>
          <Typography variant="body1">No Refunds: Tax funds allocated through the platform are considered "processed." Users cannot "un-fund" a project once the transaction is finalized on the blockchain/ledger.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6"><strong>3. Project Feasibility & Failure</strong></Typography>
          <Typography variant="body1">
            If a project becomes impossible (e.g., a "Glass Skywalk" is deemed structurally unsafe after funding), funds will be returned to the user's "Unallocated Pool" for re-distribution.
          </Typography>
        </Box>

        <Box>
          <Typography variant="h6"><strong>4. Prohibited Conduct</strong></Typography>
          <Typography variant="body1">
            Users may not use the "Community Comments" section to harass, coordinate "funding strikes," or manipulate project priority through botting.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsOfService;