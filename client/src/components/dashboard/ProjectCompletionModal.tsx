import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, Rating, IconButton, CircularProgress, Paper, Avatar } from '@mui/material';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Props } from '../../types/dashboardTypes';

export default function ProjectCompletionModal({ open, onClose, completionData, setCompletionData, onSubmit, readOnly = false, project }: Props) {
    const [updates, setUpdates] = useState<any[]>([]);
    const [loadingUpdates, setLoadingUpdates] = useState(false);

    useEffect(() => {
        if (open && readOnly && project?.id) {
            setLoadingUpdates(true);
            axios.get(`http://localhost:3001/api/projects/${project.id}/updates`, { withCredentials: true })
                .then(res => setUpdates(res.data.updates || []))
                .catch(err => console.error("Failed to fetch timeline history", err))
                .finally(() => setLoadingUpdates(false));
        }
    }, [open, readOnly, project?.id]);
    
    const getImageUrl = (img: any) => {
        if (img instanceof File) return URL.createObjectURL(img);
        if (typeof img === 'string') return `http://localhost:3001/api/projects/file/cleartax-image-uploads/${img}`;
        return '';
    };
    const getFileUrl = (file: any) => {
        if (file instanceof File) return URL.createObjectURL(file);
        if (typeof file === 'string') return `http://localhost:3001/api/projects/file/cleartax-file-uploads/${file}`;
        return '#';
    };
    const getFileName = (file: any, idx: number) => {
        if (file instanceof File) return file.name;
        if (typeof file === 'string') {
            const underscoreIndex = file.indexOf('_');
            if (underscoreIndex !== -1) return file.substring(underscoreIndex + 1);
            return file;
        }
        return `Final_Document_${idx + 1}.pdf`;
    };
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setCompletionData({ ...completionData, finalImages: [...completionData.finalImages, ...Array.from(e.target.files)] });
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setCompletionData({ ...completionData, finalFiles: [...completionData.finalFiles, ...Array.from(e.target.files)] });
    };
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {readOnly ? "Final Completion Report" : "Complete Project"}
                <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {!readOnly && (
                        <Typography variant="body2" color="text.secondary">
                            Please provide the final details for this project to close it out. This information will be fully transparent to the community.
                        </Typography>
                    )}
                    <TextField 
                        label="Completion Summary" multiline rows={3} fullWidth 
                        value={completionData.summary} 
                        onChange={e => setCompletionData({...completionData, summary: e.target.value})} 
                        disabled={readOnly}
                    />
                    <TextField 
                        label="Final Cost (€)" type="number" fullWidth 
                        value={completionData.finalCost} 
                        onChange={e => setCompletionData({...completionData, finalCost: e.target.value})} 
                        disabled={readOnly}
                        error={!readOnly && !!project && parseFloat(completionData.finalCost || '0') > parseFloat(project.amount_raised?.toString() || '0')}
                        helperText={!readOnly && !!project && parseFloat(completionData.finalCost || '0') > parseFloat(project.amount_raised?.toString() || '0') 
                            ? `Final cost cannot exceed the total raised funds (€${project.amount_raised}). Please Request Additional Funding via the timeline first.`
                            : ''}
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={['DatePicker']}>
                            <DatePicker 
                                label="Actual Completion Date" 
                                value={completionData.completionDate}
                                onChange={(newValue) => setCompletionData({...completionData, completionDate: newValue})}
                                disabled={readOnly}
                                format="DD.MM.YYYY"
                            />
                        </DemoContainer>
                    </LocalizationProvider>
                    <TextField 
                        label="Maintenance / Next Steps (Optional)" multiline rows={2} fullWidth 
                        value={completionData.maintenanceNotes} 
                        onChange={e => setCompletionData({...completionData, maintenanceNotes: e.target.value})} 
                        disabled={readOnly}
                    />
                    <Box>
                        <Typography component="legend" color="text.secondary" variant="body2" sx={{ mb: 1 }}>Quality / Satisfaction Rating</Typography>
                        <Rating
                            value={completionData.rating}
                            onChange={(event, newValue) => {
                                setCompletionData({...completionData, rating: newValue || 0});
                            }}
                            size="large"
                            readOnly={readOnly}
                        />
                    </Box>

                    {completionData.finalImages.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2">Final Images</Typography>
                            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', mt: 1 }}>
                                {completionData.finalImages.map((img, idx) => (
                                    <Box key={idx} sx={{ width: 120, height: 100, flexShrink: 0, overflow: 'hidden', borderRadius: 1 }}>
                                        <img src={getImageUrl(img)} alt={`Final upload ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                    {completionData.finalFiles.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2">Final Documents</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                                {completionData.finalFiles.map((file, idx) => (
                                    <Typography key={idx} variant="body2">
                                        <a href={getFileUrl(file)} download={getFileName(file, idx)} style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }} target="_blank" rel="noopener noreferrer">
                                            View {getFileName(file, idx)}
                                        </a>
                                    </Typography>
                                ))}
                            </Box>
                        </Box>
                    )}
                    {/* Only show upload buttons if NOT read-only */}
                    {!readOnly && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button variant="outlined" component="label">
                                Upload Images
                                <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
                            </Button>
                            <Button variant="outlined" component="label">
                                Upload PDFs
                                <input type="file" hidden multiple accept="application/pdf" onChange={handleFileChange} />
                            </Button>
                        </Box>
                    )}

                    {/* --- READ ONLY FINANCIALS & TIMELINE --- */}
                    {readOnly && project && (
                        <Box sx={{ mt: 4, borderTop: '2px solid #eee', pt: 3 }}>
                            <Typography variant="h6" color="primary" gutterBottom>Project History & Financials</Typography>
                            
                            <Paper sx={{ p: 2, mb: 3, bgcolor: '#f1f8e9', border: '1px solid #c5e1a5' }}>
                                <Typography variant="subtitle2" gutterBottom>Financial Breakdown</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Total Raised from Community:</Typography>
                                    <Typography variant="body2" fontWeight="bold">€{project.amount_raised}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Final Cost of Execution:</Typography>
                                    <Typography variant="body2" fontWeight="bold" color="error">- €{completionData.finalCost}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px dashed #c5e1a5' }}>
                                    <Typography variant="body2" fontWeight="bold">Total Leftover (Sent to National Debt):</Typography>
                                    <Typography variant="body2" fontWeight="bold" color="success.main">
                                        €{Math.max(0, Number(project.amount_raised || 0) - Number(completionData.finalCost || 0)).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Paper>

                            <Typography variant="subtitle2" gutterBottom>Official Timeline Log</Typography>
                            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {loadingUpdates ? (
                                    <Box display="flex" justifyContent="center" py={3}><CircularProgress size={24} /></Box>
                                ) : updates.length === 0 ? (
                                    <Typography color="text.secondary" align="center" variant="body2">No timeline updates were posted during this project.</Typography>
                                ) : (
                                    updates.map((update, idx) => (
                                        <Paper key={idx} sx={{ p: 1.5, display: 'flex', gap: 1.5, borderLeft: '4px solid #1976d2' }}>
                                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.9rem' }}>{update.sender_name?.charAt(0).toUpperCase() || 'U'}</Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                    <Typography variant="subtitle2" fontSize="0.85rem" fontWeight="bold">
                                                        {update.sender_name || 'User'} 
                                                        <Typography component="span" variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
                                                            ({update.sender_role || 'User'})
                                                        </Typography>
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(update.created_at).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" fontSize="0.85rem" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                                                    {update.message}
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    ))
                                )}
                            </Box>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color={readOnly ? "primary" : "inherit"}>
                    {readOnly ? "Close Report" : "Cancel"}
                </Button>
                {!readOnly && (
                    <Button 
                        onClick={onSubmit} 
                        variant="contained" 
                        color="success"
                        disabled={!!project && parseFloat(completionData.finalCost || '0') > parseFloat(project.amount_raised?.toString() || '0')}
                    >
                        Submit Completion Report
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
