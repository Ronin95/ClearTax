import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ProjectData } from '../../types/dashboardTypes';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { estimatedCost: string, pitch: string, startDate: any, endDate: any, files: File[] }) => void;
    project: ProjectData | null;
}

export default function BidModal({ open, onClose, onSubmit, project }: Props) {
    const [estimatedCost, setEstimatedCost] = useState('');
    const [pitch, setPitch] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [files, setFiles] = useState<File[]>([]);

    const handleSubmit = () => {
        onSubmit({ estimatedCost, pitch, startDate, endDate, files });
        setEstimatedCost(''); setPitch(''); setStartDate(null); setEndDate(null); setFiles([]);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Submit a Project Proposal</DialogTitle>
            <DialogContent dividers>
                
                {/* --- NEW: PROJECT DATA HEADER --- */}
                {project && (
                    <Box sx={{ mb: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>{project.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{project.description}</Typography>
                        
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Location:</strong> {project.address || 'Not specified'}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Funding Raised:</strong> € {Number(project.amount_raised || 0).toLocaleString('de-AT', { minimumFractionDigits: 2 })} out of € {Number(project.target_funding || 0).toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Created on:</strong> {formatDate(project.created_at)}
                        </Typography>
                    </Box>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField 
                        label="Estimated Cost (€)" type="number" fullWidth 
                        value={estimatedCost} onChange={e => setEstimatedCost(e.target.value)} 
                    />
                    <TextField 
                        label="Why are you the best company for this job? (Pitch)" multiline rows={4} fullWidth 
                        value={pitch} onChange={e => setPitch(e.target.value)} 
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={['DatePicker', 'DatePicker']}>
                            <DatePicker label="Start Date" value={startDate} onChange={setStartDate as any} format="DD-MM-YYYY" />
                            <DatePicker label="End Date" value={endDate} onChange={setEndDate as any} format="DD-MM-YYYY" />
                        </DemoContainer>
                    </LocalizationProvider>
                    <Box>
                        <Typography variant="subtitle2">Attach PDF Proposal (Optional)</Typography>
                        <Button variant="outlined" component="label" sx={{ mt: 1 }}>
                            Upload PDFs
                            <input type="file" hidden multiple accept="application/pdf" onChange={e => setFiles(Array.from(e.target.files || []))} />
                        </Button>
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            {files.length} file(s) selected
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">Submit Bid</Button>
            </DialogActions>
        </Dialog>
    );
}
