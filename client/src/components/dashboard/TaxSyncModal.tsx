import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Box, Typography, CircularProgress, Alert } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { TaxSyncModalProps } from '../../types/dashboardTypes';

export default function TaxSyncModal({ open, onClose, user, isCheckingRis, risMessage, risAvailable, onRisCheck, onSync }: TaxSyncModalProps) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Tax Management & Sync</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">Your Verified Tax Number:</Typography>
                        <Typography variant="h6" letterSpacing={2}>{user?.tax_number}</Typography>
                    </Box>

                    <Button 
                        variant="outlined" 
                        startIcon={isCheckingRis ? <CircularProgress size={20} /> : <VerifiedUserIcon />}
                        onClick={onRisCheck}
                        disabled={isCheckingRis}
                        fullWidth
                    >
                        {isCheckingRis ? 'Connecting to RIS...' : 'System Check with RIS'}
                    </Button>

                    {risMessage && (
                        <Alert severity={risMessage.type}>{risMessage.text}</Alert>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={onSync} disabled={!risAvailable || isCheckingRis}>
                    Send to Dashboard
                </Button>
            </DialogActions>
        </Dialog>
    );
}
