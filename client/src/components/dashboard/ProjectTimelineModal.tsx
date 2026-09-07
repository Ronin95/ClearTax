import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, TextField, Box, Typography, CircularProgress, Paper, Avatar } from '@mui/material';
import axios from 'axios';
import { Image } from 'mui-image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface Props {
    open: boolean;
    onClose: () => void;
    projectId: string | null;
}

export default function ProjectTimelineModal({ open, onClose, projectId }: Props) {
    const [updates, setUpdates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [pdf, setPdf] = useState<File | null>(null); // NEW PDF STATE
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open && projectId) {
            fetchUpdates();
        }
    }, [open, projectId]);

    const fetchUpdates = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:3001/api/projects/${projectId}/updates`, { withCredentials: true });
            setUpdates(res.data.updates);
        } catch (error) {
            console.error("Failed to fetch updates", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if ((!message.trim() && !image && !pdf) || !projectId) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('message', message);
            if (image) formData.append('image', image);
            if (pdf) formData.append('pdf', pdf); // ATTACH PDF

            await axios.post(`http://localhost:3001/api/projects/${projectId}/updates`, formData, { withCredentials: true });
            
            // Reset state
            setMessage(''); 
            setImage(null);
            setPdf(null);
            fetchUpdates(); // Refresh the list immediately!
        } catch (err) {
            console.error("Failed to post update", err);
            alert("Failed to post update");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Project Updates Timeline</DialogTitle>
            
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#f9f9f9', minHeight: 400 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>
                ) : updates.length === 0 ? (
                    <Typography color="text.secondary" align="center" sx={{ my: 'auto' }}>No updates posted yet. Be the first to start the timeline!</Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {updates.map((update, idx) => (
                            <Paper key={idx} sx={{ p: 2, display: 'flex', gap: 2 }}>
                                <Avatar>{update.sender_name?.charAt(0).toUpperCase() || 'U'}</Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {update.sender_name || 'User'} 
                                            <Typography component="span" variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
                                                ({update.sender_role || 'User'})
                                            </Typography>
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(update.created_at).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                                        {update.message}
                                    </Typography>
                                    
                                    {/* Display Image */}
                                    {update.image_url && (
                                        <Box sx={{ mt: 2, borderRadius: 1, overflow: 'hidden', width: '100%', maxWidth: 300 }}>
                                            <Image src={`http://localhost:3001/api/projects/file/cleartax-image-uploads/${update.image_url}`} duration={0} />
                                        </Box>
                                    )}
                                    
                                    {/* Display PDF Link */}
                                    {update.file_url && (
                                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <PictureAsPdfIcon color="error" fontSize="small" />
                                            <Typography variant="body2">
                                                <a 
                                                    href={`http://localhost:3001/api/projects/file/cleartax-file-uploads/${update.file_url}`} 
                                                    target="_blank" rel="noopener noreferrer"
                                                    style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}
                                                >
                                                    View attached document
                                                </a>
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                )}
            </DialogContent>
            
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle2" gutterBottom>Post a new update:</Typography>
                <TextField 
                    multiline rows={2} fullWidth size="small"
                    value={message} onChange={e => setMessage(e.target.value)} 
                    placeholder="Type a new update..."
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined" component="label" size="small">
                            {image ? image.name : "Attach Image"}
                            <input type="file" hidden accept="image/*" onChange={e => setImage(e.target.files ? e.target.files[0] : null)} />
                        </Button>
                        <Button variant="outlined" component="label" size="small" color="secondary">
                            {pdf ? pdf.name : "Upload PDF"}
                            <input type="file" hidden accept="application/pdf" onChange={e => setPdf(e.target.files ? e.target.files[0] : null)} />
                        </Button>
                    </Box>
                    <Box>
                        <Button onClick={onClose} color="inherit" sx={{ mr: 1 }}>Close</Button>
                        <Button 
                            onClick={handleSubmit} 
                            variant="contained" 
                            color="primary" 
                            disabled={submitting || (!message.trim() && !image && !pdf)}
                        >
                            {submitting ? 'Posting...' : 'Post Update'}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
}
