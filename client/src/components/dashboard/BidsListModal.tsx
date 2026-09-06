import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Card, CardContent, CircularProgress } from '@mui/material';
import axios from 'axios';

interface Props {
    open: boolean; onClose: () => void;
    projectId: string | null; onAcceptBid: (bidId: string) => void;
}

export default function BidsListModal({ open, onClose, projectId, onAcceptBid }: Props) {
    const [bids, setBids] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && projectId) {
            setLoading(true);
            axios.get(`http://localhost:3001/api/projects/${projectId}/bids`, { withCredentials: true })
                .then(res => setBids(res.data.bids))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [open, projectId]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Company Proposals</DialogTitle>
            <DialogContent dividers>
                {loading ? <CircularProgress /> : bids.length === 0 ? <Typography>No bids received yet.</Typography> : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {bids.map(bid => (
                            <Card key={bid.id} variant="outlined" sx={{ bgcolor: bid.status === 'Accepted' ? '#e8f5e9' : 'white' }}>
                                <CardContent>
                                    <Typography variant="h6">{bid.company_name}</Typography>
                                    <Typography variant="body2" color="text.secondary">Est. Cost: €{Number(bid.estimated_cost).toLocaleString('de-AT')}</Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}><strong>Pitch:</strong> {bid.pitch}</Typography>
                                    {bid.file_list && bid.file_list.length > 0 && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="body2" fontWeight="bold">Attached Files:</Typography>
                                            {bid.file_list.map((file: string, idx: number) => (
                                                <Typography key={idx} variant="body2">
                                                    <a href={`http://localhost:3001/api/projects/file/cleartax-file-uploads/${file}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none' }}>
                                                        📎 View Document {idx + 1}
                                                    </a>
                                                </Typography>
                                            ))}
                                        </Box>
                                    )}
                                    
                                    {(bid.status === 'Pending' || !bid.status) && (
                                        <Button variant="contained" color="primary" size="small" sx={{ mt: 2 }} onClick={() => onAcceptBid(bid.id)}>
                                            Accept Proposal
                                        </Button>
                                    )}
                                    {bid.status === 'Accepted' && <Typography color="success.main" sx={{ mt: 2, fontWeight: 'bold' }}>Winner!</Typography>}
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
