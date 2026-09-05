import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
    open: boolean;
    onClose: () => void;
    project: any;
    onApproveSubmit: (comment: string, fundedAmount: number, files: File[]) => void;
}

export default function ProjectApprovalModal({ open, onClose, project, onApproveSubmit }: Props) {
    const [comment, setComment] = useState('');
    const [fundedAmount, setFundedAmount] = useState<number>(0);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // Reset state every time the modal opens!
    useEffect(() => {
        if (open) {
            setComment('');
            setFundedAmount(0);
            setSelectedFiles([]);
        }
    }, [open, project]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = () => {
        onApproveSubmit(comment, fundedAmount, selectedFiles);
    };

    if (!project) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Approve Project
                <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h6">{project.title || project.project_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        By approving this project, you agree that it is beneficial for the community. You can also provide feedback and contribute funding!
                    </Typography>

                    <TextField 
                        label="Suggestions / Comments" 
                        multiline rows={3} fullWidth 
                        value={comment} 
                        onChange={e => setComment(e.target.value)} 
                    />

                    <TextField 
                        label="Funding Contribution (€)" 
                        type="number" fullWidth 
                        value={fundedAmount} 
                        onChange={e => setFundedAmount(Number(e.target.value))}
                        slotProps={{
                            htmlInput: { min: 0 }
                        }}
                    />

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Attach Files (Optional)</Typography>
                        <Button variant="outlined" component="label">
                            Upload Documents
                            <input type="file" hidden multiple accept="application/pdf" onChange={handleFileChange} />
                        </Button>
                        {selectedFiles.length > 0 && (
                            <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                                {selectedFiles.length} file(s) selected
                            </Typography>
                        )}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Approve & Fund
                </Button>
            </DialogActions>
        </Dialog>
    );
}
