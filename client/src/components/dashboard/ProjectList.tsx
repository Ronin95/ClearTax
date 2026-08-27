import { Card, CardContent, Typography, Box, Button, Stack, IconButton, Chip, LinearProgress } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Image } from 'mui-image';
import { ProjectListProps } from '../../types/dashboardTypes';
import ProjectApprovalModal from './ProjectApprovalModal';
import { useState } from 'react';

export default function ProjectList({ projects, showActions, isCommunityTab, onEdit, onDelete, onApprove, onComplete, onViewCompletion, onEditCompletion, onBid, onUpdate, onViewBids, onViewUpdates, onVerifyCompletion, getStatusColor, formatDate }: ProjectListProps) {
    const [approvalModalOpen, setApprovalModalOpen] = useState(false);
    const [selectedProjectForApproval, setSelectedProjectForApproval] = useState<any>(null);
    
    const getImageUrl = (img: any) => {
        if (img instanceof File) return URL.createObjectURL(img);
        if (typeof img === 'string') return `http://localhost:3001/api/projects/file/cleartax-image-uploads/${img}`;
        if (img && img.url) return img.url;
        return '';
    };

    const getFileUrl = (file: any) => {
        if (file instanceof File) return URL.createObjectURL(file);
        if (typeof file === 'string') return `http://localhost:3001/api/projects/file/cleartax-file-uploads/${file}`;
        if (file && file.url) return file.url;
        return '#';
    };

    const getFileName = (file: any, idx: number) => {
        if (file instanceof File) return file.name;
        if (typeof file === 'string') {
            const underscoreIndex = file.indexOf('_');
            if (underscoreIndex !== -1) return file.substring(underscoreIndex + 1);
            return file;
        }
        if (file && file.name) return file.name;
        return `Document_${idx + 1}.pdf`;
    };

    if (projects.length === 0) {
        return (
            <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                <CardContent sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="body1" color="text.secondary">
                        No projects available yet.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    const handleApproveSubmit = async (comment: string, fundedAmount: number, files: File[]) => {
        if (!selectedProjectForApproval) return;
        
        try {
            const formData = new FormData();
            formData.append('comment', comment);
            formData.append('fundedAmount', fundedAmount.toString());
            files.forEach(file => formData.append('files', file));
            const response = await fetch(`http://localhost:3001/api/projects/${selectedProjectForApproval.id}/approve`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                // This is where your specific pop-up message will show!
                alert(data.error); 
                return;
            }
            // Success! Close modal and refresh projects
            alert("Success!");
            setApprovalModalOpen(false);
            // refreshProjects(); // call whatever function you use to fetch projects again
        } catch (err) {
            console.error(err);
            alert("Network error");
        }
    };

    return (
        <Stack spacing={3}>
            {projects.map((proj) => (
                <Card key={proj.id} variant="outlined">
                    <CardContent sx={{ position: 'relative' }}>
                        
                        <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
                            
                                                        {/* --- FUND PROJECT BUTTON --- */}
                            {isCommunityTab && proj.status === 'Proposed' && (
                                <Button 
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={() => {
                                        setSelectedProjectForApproval(proj);
                                        setApprovalModalOpen(true);
                                    }}
                                >
                                    Fund Project
                                </Button>
                            )}

                            <Chip 
                                label={proj.status} 
                                color={getStatusColor(proj.status)} 
                                size="small" 
                                sx={{ fontWeight: 'bold' }}
                            />
                            {showActions && onEdit && onDelete && proj.status !== 'Completed' && (
                                <>
                                    <IconButton size="small" onClick={() => onEdit(proj.id)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => onDelete(proj.id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </>
                            )}
                            {/* --- COMPLETION BUTTON --- */}
                            {onComplete && proj.status === 'In Progress' && (
                                <Button 
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    onClick={() => onComplete(proj.id)}
                                >
                                    Mark as Completed
                                </Button>
                            )}
                            {/* --- VIEW PROPOSALS BUTTON (For Creators) --- */}
                            {onViewBids && proj.status === 'Approved' && (
                                <Button variant="outlined" color="primary" size="small" onClick={() => onViewBids(proj.id)}>
                                    View Proposals
                                </Button>
                            )}
                            
                            {/* --- VIEW TIMELINE BUTTON (Public) --- */}
                            {onViewUpdates && (proj.status === 'In Progress' || proj.status === 'Pending Completion' || proj.status === 'Completed') && (
                                <Button variant="outlined" color="info" size="small" onClick={() => onViewUpdates(proj.id)}>
                                    View Timeline
                                </Button>
                            )}

                            {/* --- VERIFY COMPLETION BUTTON (For Community) --- */}
                            {onVerifyCompletion && proj.status === 'Pending Completion' && (
                                <Button variant="contained" color="success" size="small" onClick={() => onVerifyCompletion(proj.id)}>
                                    Verify Work
                                </Button>
                            )}
                            {/* --- BID BUTTON (For Companies) --- */}
                            {onBid && proj.status === 'Approved' && (
                                <Button variant="contained" color="primary" size="small" onClick={() => onBid(proj.id)}>
                                    Submit Proposal
                                </Button>
                            )}
                            {/* --- PROGRESS UPDATE BUTTON (For Companies) --- */}
                            {onUpdate && proj.status === 'In Progress' && (
                                <Button variant="outlined" color="primary" size="small" onClick={() => onUpdate(proj.id)}>
                                    Post Update
                                </Button>
                            )}
                            {/* --- COMPLETED REPORT BUTTONS --- */}
                            {proj.status === 'Completed' && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {onViewCompletion && (
                                        <Button variant="outlined" color="primary" size="small" onClick={() => onViewCompletion(proj.id)}>
                                            View Report
                                        </Button>
                                    )}
                                    {/* {showActions && onEditCompletion && (
                                        <Button variant="contained" color="secondary" size="small" onClick={() => onEditCompletion(proj.id)}>
                                            Edit Report
                                        </Button>
                                    )} */}
                                </Box>
                            )}
                        </Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ pr: 30 }}>{proj.title}</Typography>
                        <Typography color="primary" variant="subtitle2" gutterBottom>{proj.category}</Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>{proj.description}</Typography>
                                                {/* --- FUNDING PROGRESS BAR --- */}
                        <Box sx={{ mt: 2, mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Funding Progress
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color="primary">
                                    €{Number(proj.amount_raised).toLocaleString('de-AT', { minimumFractionDigits: 2 })} / €{Number(proj.target_funding).toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                                </Typography>
                            </Box>
                            <LinearProgress 
                                variant="determinate" 
                                value={Math.min((Number(proj.amount_raised) / Number(proj.target_funding)) * 100, 100)} 
                                sx={{ height: 8, borderRadius: 4 }} 
                            />
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Location:</strong> {proj.address || 'Not specified'}
                            </Typography>
                            {proj.address && (
                                <Button
                                    size="small" variant="text" color="primary"
                                    endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(proj.address)}`}
                                    target="_blank" rel="noopener noreferrer"
                                    sx={{ p: 0, minWidth: 'auto', textTransform: 'none', fontWeight: 'bold' }}
                                >
                                    View on Maps
                                </Button>
                            )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Contribution:</strong> €{Number(proj.contributionAmount).toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                        </Typography>
                        {/* <Typography variant="body2" color="text.secondary">
                            <strong>Using Own Taxes:</strong> {proj.ownTaxes ? 'Yes' : 'No'}
                        </Typography> */}
                        <Typography variant="body2" color="text.secondary">
                            <strong>Created at date:</strong> {formatDate(proj.created_at)}
                        </Typography>
                        
                        {proj.images && proj.images.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', mt: 3 }}>
                                {proj.images.map((img, idx) => (
                                    <Box key={idx} sx={{ width: 250, height: 200, flexShrink: 0, overflow: 'hidden', borderRadius: 1 }}>
                                        <Image src={getImageUrl(img)} fit="cover" duration={500} alt={`Project upload ${idx}`} />
                                    </Box>
                                ))}
                            </Box>
                        )}
                        
                        {proj.files && proj.files.length > 0 && (
                            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Attached PDF Documents:</Typography>
                                <Stack spacing={1}>
                                    {proj.files.map((file, idx) => (
                                        <Typography key={idx} variant="body2">
                                            <a 
                                                href={getFileUrl(file)} download={getFileName(file, idx)} 
                                                style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }} 
                                                target="_blank" rel="noopener noreferrer"
                                            >
                                                📎 Download {getFileName(file, idx)}
                                            </a>
                                        </Typography>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            ))}
            <ProjectApprovalModal 
                open={approvalModalOpen} 
                onClose={() => setApprovalModalOpen(false)} 
                project={selectedProjectForApproval} 
                onApproveSubmit={handleApproveSubmit} 
            />
        </Stack>
    );
}
