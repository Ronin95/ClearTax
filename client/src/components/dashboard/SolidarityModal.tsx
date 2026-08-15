import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Box, Typography, TextField, Alert, CircularProgress } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import { SolidarityModalProps } from '../../types/dashboardTypes';

export default function SolidarityModal({ open, onClose, debtStats, availableTax, solidarityInput, setSolidarityInput, isSubmittingDebt, onSubmit }: SolidarityModalProps) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Confirm National Contribution</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">Below you can see the current Austrian national debt:</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                        <iframe 
                            src="https://staatsschulden.at/widget?font=courier&amp;font_size=16&amp;background_color=f5f5f5&amp;caption_color=111111&amp;padding=5" 
                            style={{ border: 'none', overflow: 'hidden', width: '200px', height: '100px' }}
                            title="National Debt Widget"
                        ></iframe>
                    </Box>
                    <Alert severity="info" icon={<PublicIcon />}>
                        So far, <b>{debtStats.number_of_people}+ people</b> have paid <b>€ +{debtStats.amount_paid.toLocaleString('de-AT', { minimumFractionDigits: 2 })}</b> towards the national debt.
                    </Alert>
                    <Typography variant="body2">Your contribution will directly reduce the national debt.</Typography>
                    <TextField
                        label="Amount to Contribute" fullWidth type="number"
                        value={solidarityInput} onChange={(e) => setSolidarityInput(e.target.value)}
                        slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
                        error={parseFloat(solidarityInput) > availableTax}
                        helperText={parseFloat(solidarityInput) > availableTax ? "Exceeds available tax" : `Max: €${availableTax.toLocaleString('de-AT')}`}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose}>Go Back</Button>
                <Button variant="contained" color="error" onClick={onSubmit} disabled={!solidarityInput || parseFloat(solidarityInput) <= 0 || parseFloat(solidarityInput) > availableTax || isSubmittingDebt}>
                    {isSubmittingDebt ? <CircularProgress size={24} /> : "Yes, Execute Payment"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
