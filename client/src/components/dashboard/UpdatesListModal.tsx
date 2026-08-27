import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Card, CardContent, CircularProgress } from '@mui/material';
import axios from 'axios';
import { Image } from 'mui-image';

interface Props { open: boolean; onClose: () => void; projectId: string | null; }

export default function UpdatesListModal({ open, onClose, projectId }: Props) {
    const [updates, setUpdates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && projectId) {
            setLoading(true);
            axios.get(`http://localhost:3001/api/projects/${projectId}/updates`, { withCredentials: true })
                .then(res => setUpdates(res.data.updates))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [open, projectId]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Project Progress Timeline</DialogTitle>
            <DialogContent dividers>
                {loading ? <CircularProgress /> : updates.length === 0 ? <Typography>No updates posted yet.</Typography> : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {updates.map(update => (
                            <Card key={update.id} variant="outlined">
                                <CardContent>
                                    <Typography variant="caption" color="text.secondary">{new Date(update.created_at).toLocaleString()}</Typography>
                                    <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>{update.message}</Typography>
                                    {update.image_url && (
                                        <Box sx={{ height: 200, overflow: 'hidden', borderRadius: 1 }}>
                                            <Image src={`http://localhost:3001/api/projects/file/cleartax-image-uploads/${update.image_url}`} fit="cover" />
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </DialogContent>
            <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
        </Dialog>
    );
}
