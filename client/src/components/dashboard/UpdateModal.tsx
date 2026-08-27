import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { message: string, image: File | null }) => void;
}

export default function UpdateModal({ open, onClose, onSubmit }: Props) {
    const [message, setMessage] = useState('');
    const [image, setImage] = useState<File | null>(null);

    const handleSubmit = () => {
        onSubmit({ message, image });
        setMessage(''); setImage(null);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Post Milestone Update</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField 
                        label="Progress Update Message" multiline rows={4} fullWidth 
                        value={message} onChange={e => setMessage(e.target.value)} 
                        placeholder="E.g., Groundbreaking started today! The concrete is pouring..."
                    />
                    <Box>
                        <Typography variant="subtitle2">Attach a Photo (Optional)</Typography>
                        <Button variant="outlined" component="label" sx={{ mt: 1 }}>
                            Upload Image
                            <input type="file" hidden accept="image/*" onChange={e => setImage(e.target.files ? e.target.files[0] : null)} />
                        </Button>
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            {image ? image.name : 'No image selected'}
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">Post Update</Button>
            </DialogActions>
        </Dialog>
    );
}
