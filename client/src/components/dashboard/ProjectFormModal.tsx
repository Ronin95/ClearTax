import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Box, Typography, TextField, MenuItem, FormControl, InputLabel, Select, Switch, FormControlLabel, FormGroup, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { ProjectFormModalProps } from '../../types/dashboardTypes';

const mapContainerStyle = { width: '100%', height: '400px', borderRadius: '8px', marginTop: '16px' };
const defaultCenter = { lat: 48.2082, lng: 16.3738 };

export default function ProjectFormModal({
    open, onClose, projectData, setProjectData, editingProjectId, statusOptions, availableTax, currentContribution, remainingTax, isLoaded, onSubmit
}: ProjectFormModalProps) {
    
    const removeImage = (idxToRemove: number) => setProjectData({ ...projectData, images: projectData.images.filter((_, idx) => idx !== idxToRemove) });
    const removeFile = (idxToRemove: number) => setProjectData({ ...projectData, files: projectData.files.filter((_, idx) => idx !== idxToRemove) });
    
    const onMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) setProjectData({ ...projectData, address: `${e.latLng.lat().toFixed(6)}, ${e.latLng.lng().toFixed(6)}` });
    };

    const getMarkerPosition = (address: string) => {
        if (!address) return null;
        const parts = address.split(',');
        if (parts.length === 2) {
            const lat = parseFloat(parts[0].trim()); const lng = parseFloat(parts[1].trim());
            if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
        }
        return null;
    };

    const getImageUrl = (img: any) => {
        if (img instanceof File) return URL.createObjectURL(img);
        if (typeof img === 'string') return `http://localhost:3001/api/projects/file/cleartax-image-uploads/${img}`;
        if (img && img.url) return img.url; return '';
    };

    const getFileName = (file: any, idx: number) => {
        if (file instanceof File) return file.name;
        if (typeof file === 'string') {
            const underscoreIndex = file.indexOf('_');
            if (underscoreIndex !== -1) return file.substring(underscoreIndex + 1);
            return file;
        }
        if (file && file.name) return file.name; return `Document_${idx + 1}.pdf`;
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{editingProjectId ? "Edit Community Project" : "Propose Community Project"}</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    {editingProjectId && (
                        <FormControl fullWidth>
                            <InputLabel>Project Status</InputLabel>
                            <Select value={projectData.status} label="Project Status" onChange={(e) => setProjectData({...projectData, status: e.target.value as string})}>
                                {statusOptions.map((opt) => (<MenuItem key={opt.name} value={opt.name}>{opt.name}</MenuItem>))}
                            </Select>
                        </FormControl>
                    )}
                    <TextField label="Project Title" fullWidth value={projectData.title} onChange={(e) => setProjectData({...projectData, title: e.target.value})} />
                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select value={projectData.category} label="Category" onChange={(e) => setProjectData({...projectData, category: e.target.value})}>
                            <MenuItem value="Infrastructure">Infrastructure</MenuItem>
                            <MenuItem value="Technology">Technology</MenuItem>
                            <MenuItem value="Transportation">Transportation</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField label="Summary Description" placeholder="Write a short overview of the project." multiline rows={4} fullWidth value={projectData.description} onChange={(e) => setProjectData({...projectData, description: e.target.value})} />

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Images Upload</Typography>
                        <Button variant="outlined" component="label" sx={{ mb: 2 }}>
                            Add Images
                            <input type="file" hidden multiple accept="image/*" onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) setProjectData({ ...projectData, images: [...projectData.images, ...Array.from(e.target.files)] });
                            }} />
                        </Button>
                        {projectData.images.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', p: 1 }}>
                                {projectData.images.map((img, idx) => (
                                    <Box key={idx} sx={{ position: 'relative', height: 80, width: 80, flexShrink: 0, overflow: 'hidden', borderRadius: 1 }}>
                                        <img src={getImageUrl(img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`Preview ${idx}`} />
                                        <IconButton size="small" onClick={() => removeImage(idx)} sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.7)', padding: '2px' }}><CloseIcon sx={{ fontSize: 16 }} color="error" /></IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>PDF Upload</Typography>
                        <Button variant="outlined" component="label" sx={{ mb: 2 }}>
                            Add PDF Files
                            <input type="file" hidden multiple accept="application/pdf" onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) setProjectData({ ...projectData, files: [...projectData.files, ...Array.from(e.target.files)] });
                            }} />
                        </Button>
                        {projectData.files.length > 0 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {projectData.files.map((file, idx) => (
                                    <Box key={idx} display="flex" alignItems="center" gap={1}>
                                        <Typography variant="body2" color="primary" sx={{ flexGrow: 1 }}>📎 {getFileName(file, idx)}</Typography>
                                        <IconButton size="small" onClick={() => removeFile(idx)} color="error"><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Location Map / Address</Typography>
                        <TextField label="Project Coordinates" fullWidth value={projectData.address} onChange={(e) => setProjectData({...projectData, address: e.target.value})} />
                        {isLoaded ? (
                            <GoogleMap mapContainerStyle={mapContainerStyle} center={getMarkerPosition(projectData.address) || defaultCenter} zoom={12} onClick={onMapClick} options={{ streetViewControl: false }}>
                                {getMarkerPosition(projectData.address) && <Marker position={getMarkerPosition(projectData.address)!} />}
                            </GoogleMap>
                        ) : (<Box sx={{ width: '100%', height: '200px', bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, borderRadius: 1 }}><CircularProgress /></Box>)}
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>How much would you like to contribute?</Typography>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <TextField label="Amount" type="number" value={projectData.contributionAmount} onChange={(e) => setProjectData({...projectData, contributionAmount: e.target.value})} sx={{ width: '150px' }} error={currentContribution > availableTax} />
                            <Typography variant="body2" color={currentContribution > availableTax ? "error" : "text.secondary"}>
                                Total amount remaining:<br/> <b>€ {remainingTax.toLocaleString('de-AT', { minimumFractionDigits: 2 })}</b>
                            </Typography>
                        </Stack>
                    </Box>

                    <FormGroup>
                        <FormControlLabel control={<Switch checked={projectData.ownTaxes} onChange={(e) => setProjectData({ ...projectData, ownTaxes: e.target.checked })} />} label="Will I contribute to this project with my own taxes?" />
                    </FormGroup>

                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose}>Discard</Button>
                <Button variant="contained" onClick={onSubmit} disabled={!projectData.title || currentContribution > availableTax}>
                    {editingProjectId ? "Save Changes" : "Submit Proposal"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
