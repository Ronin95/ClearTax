import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, Rating, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Props } from '../../types/dashboardTypes';

export default function ProjectCompletionModal({ open, onClose, completionData, setCompletionData, onSubmit, readOnly = false }: Props) {
    
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
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={['DatePicker']}>
                            <DatePicker 
                                label="Actual Completion Date" 
                                value={completionData.completionDate}
                                onChange={(newValue) => setCompletionData({...completionData, completionDate: newValue})}
                                disabled={readOnly}
                                format="DD-MM-YYYY"
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
                                            📎 Download {getFileName(file, idx)}
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
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color={readOnly ? "primary" : "inherit"}>
                    {readOnly ? "Close Report" : "Cancel"}
                </Button>
                {!readOnly && (
                    <Button onClick={onSubmit} variant="contained" color="success">
                        Submit Completion Report
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
