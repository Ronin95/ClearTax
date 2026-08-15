import React, { useEffect, useState } from 'react';
import { 
    Container, Typography, Card, CardContent, Button, Box,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
    MenuItem, FormControl, InputLabel, Select, Stack, CircularProgress, Alert,
    Switch, FormControlLabel, FormGroup, IconButton, Tabs, Tab, Pagination
} from "@mui/material";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PublicIcon from '@mui/icons-material/Public';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import Chip from '@mui/material/Chip';
import axios from 'axios';
import { Image } from 'mui-image';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

// 1. Define the User interface
interface User {
    id: string;
    username: string;
    email: string;
    tax_number: string;
    available_amount: string;
    contributed_amount: string;
    role_id: number;
}

// 2. Define the Project Data Interface
interface ProjectData {
    id: string;
    title: string;
    category: string;
    description: string;
    images: any[]; 
    files: any[];  
    address: string;
    contributionAmount: string | number;
    ownTaxes: boolean;
    status: string;
    created_at?: string;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`project-tabpanel-${index}`}
            aria-labelledby={`project-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}
function a11yProps(index: number) {
    return {
        id: `project-tab-${index}`,
        'aria-controls': `project-tabpanel-${index}`,
    };
}

// Map settings
const mapContainerStyle = { width: '100%', height: '400px', borderRadius: '8px', marginTop: '16px' };
const defaultCenter = { lat: 48.2082, lng: 16.3738 }; // Default: Vienna, Austria

export default function RegularDashboard() {
    interface StatusOption {
        name: string;
        color: string;
    }

    const [debtStats, setDebtStats] = useState({ number_of_people: 0, amount_paid: 0 });
    const [solidarityInput, setSolidarityInput] = useState<string>('');
    const [isSubmittingDebt, setIsSubmittingDebt] = useState(false);

    const [user, setUser] = useState<User | null>(null);
    const [availableTax, setAvailableTax] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    
    // Dialog States
    const [openIncrease, setOpenIncrease] = useState(false);
    const [openSolidarity, setOpenSolidarity] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    
    // RIS Check States
    const [isCheckingRis, setIsCheckingRis] = useState(false);
    const [risMessage, setRisMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // 3. Updated Project Data State
    const [projectData, setProjectData] = useState<ProjectData>({ 
        id: '', title: '', category: 'Infrastructure', description: '',
        images: [], files: [], address: '', contributionAmount: '', ownTaxes: false, status: 'Proposed'
    });

    const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [submittedProjects, setSubmittedProjects] = useState<ProjectData[]>([]);
    const [communityProjects, setCommunityProjects] = useState<ProjectData[]>([]);
    const [risAvailable, setRisAvailable] = useState<number | null>(null);
    
    const [tabValue, setTabValue] = useState(0);
    const [myProjectsPage, setMyProjectsPage] = useState(1);
    const [communityProjectsPage, setCommunityProjectsPage] = useState(1);
    const PROJECTS_PER_PAGE = 5;

    // Google Maps API Loader
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''
    });

    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/projects/statuses');
                setStatusOptions(response.data.statuses);
            } catch (err) {
                console.error("Failed to fetch statuses", err);
            }
        };
        fetchStatuses();
    }, []);

    const formatProjects = (projectsFromDB: any[]) => {
        return projectsFromDB.map((p: any) => ({
            id: p.id,
            title: p.project_name || p.title || '',                     
            category: p.category_id === 2 ? 'Technology' : p.category_id === 3 ? 'Transportation' : 'Infrastructure',
            description: p.summar_desc || p.description || '',          
            images: p.image_list || p.images || [],                     
            files: p.file_list || p.files || [],                        
            address: (p.latitude && p.longitude) ? `${p.latitude}, ${p.longitude}` : '', 
            contributionAmount: p.amount_raised || p.contributionAmount || 0, 
            ownTaxes: p.creator_work === true,                          
            status: p.status || 'Proposed',
            created_at: p.created_at
        }));
    };
    const fetchProjects = async () => {
        try {
            const [myRes, communityRes] = await Promise.all([
                axios.get('http://localhost:3001/api/projects', { withCredentials: true }),
                axios.get('http://localhost:3001/api/projects/community', { withCredentials: true })
            ]);
            
            const myProjectsFromDB = myRes.data.projects || myRes.data;
            if (Array.isArray(myProjectsFromDB)) {
                setSubmittedProjects(formatProjects(myProjectsFromDB));
            }
            
            const commProjectsFromDB = communityRes.data.projects || communityRes.data;
            if (Array.isArray(commProjectsFromDB)) {
                setCommunityProjects(formatProjects(commProjectsFromDB));
            }
        } catch (err) {
            console.error("Failed to fetch projects from backend", err);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        const fetchDebtStats = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/landingPage/debt-stats');
                setDebtStats({
                    number_of_people: res.data.number_of_people,
                    amount_paid: res.data.amount_paid
                });
            } catch (err) {
                console.error("Error fetching debt stats", err);
            }
        };
        fetchDebtStats();
    }, []);

    const handleSolidaritySubmit = async () => {
        const amount = parseFloat(solidarityInput);
        if (isNaN(amount) || amount <= 0 || amount > availableTax) return;

        setIsSubmittingDebt(true);
        try {
            const response = await axios.post('http://localhost:3001/api/users/contribute-debt', 
                { amount }, 
                { withCredentials: true }
            );
            
            const newBalance = parseFloat(response.data.newBalance);
            setAvailableTax(newBalance);

            setDebtStats(prev => ({
                number_of_people: prev.number_of_people + 1,
                amount_paid: prev.amount_paid + amount
            }));

            setOpenSolidarity(false);
            setSolidarityInput('');
            alert("Thank you for your contribution to the National Solidarity fund!");
        } catch (err) {
            console.error("Debt contribution failed", err);
            alert("Payment failed. Please ensure you have enough available tax.");
        } finally {
            setIsSubmittingDebt(false);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/users/me', { withCredentials: true });
                
                setUser(response.data.user); 
                setAvailableTax(parseFloat(response.data.user.available_amount));
                
            } catch (err) {
                console.error("Failed to fetch balance", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleRisCheck = () => {
        setIsCheckingRis(true);
        setRisMessage(null);
        setRisAvailable(null);

        setTimeout(() => {
            const success = Math.random() > 0.2; 
            if (success) {
                const rawAmount = Math.random() * (5000 - 500) + 500;
                
                const displayAmount = new Intl.NumberFormat('de-AT', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2,
                    useGrouping: false 
                }).format(rawAmount);

                setRisAvailable(rawAmount); 
                setRisMessage({ 
                    type: 'success', 
                    text: `RIS System found €${displayAmount} in unclaimed tax credits.` 
                });
            } else {
                setRisMessage({ 
                    type: 'error', 
                    text: 'No recent tax payments found in the RIS system for your tax number.' 
                });
            }
            setIsCheckingRis(false);
        }, 1200);
    };

    const handleSyncToDashboard = async () => {
        if (!risAvailable) return;

        try {
            const response = await axios.post('http://localhost:3001/api/users/sync-taxes', {
                amountToAdd: risAvailable
            }, { withCredentials: true });

            const updatedBalance = parseFloat(response.data.newBalance);
            setAvailableTax(updatedBalance);
            
            setOpenIncrease(false);
            setRisAvailable(null);
            setRisMessage(null);
        } catch (err) {
            console.error("Sync failed", err);
            setRisMessage({ type: 'error', text: 'Database sync failed. The amount was not saved.' });
        }
    };

    if (loading) return (
        <Container sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Loading your dashboard...</Typography>
        </Container>
    );

    const currentContribution = Number(projectData.contributionAmount) || 0;
    const remainingTax = Math.max(0, availableTax - currentContribution);

    const handleOpenCreateNew = () => {
        setEditingProjectId(null);
        setProjectData({
            id: '', title: '', category: 'Infrastructure', description: '',
            images: [], files: [], address: '', contributionAmount: '', ownTaxes: false, status: 'Proposed'
        });
        setOpenCreate(true);
    };

    // UI HELPER: Remove an image
    const removeImage = (idxToRemove: number) => {
        setProjectData({
            ...projectData,
            images: projectData.images.filter((_, idx) => idx !== idxToRemove)
        });
    };

    // UI HELPER: Remove a file
    const removeFile = (idxToRemove: number) => {
        setProjectData({
            ...projectData,
            files: projectData.files.filter((_, idx) => idx !== idxToRemove)
        });
    };

    const handleCreateProject = async () => {
        const formData = new FormData();
        
        formData.append('title', projectData.title);
        formData.append('description', projectData.description);
        formData.append('contributionAmount', projectData.contributionAmount.toString());
        formData.append('ownTaxes', projectData.ownTaxes ? 'true' : 'false');
        
        const catMap: Record<string, number> = { 'Infrastructure': 1, 'Technology': 2, 'Transportation': 3 };
        formData.append('category_id', catMap[projectData.category]?.toString() || '1');
        formData.append('status', projectData.status);

        const parts = projectData.address.split(',');
        if (parts.length === 2) {
            formData.append('latitude', parts[0].trim());
            formData.append('longitude', parts[1].trim());
        }

        // Separate existing files (URLs/strings) from new uploads (Files)
        const existingImages = projectData.images.filter(img => typeof img === 'string');
        const newImages = projectData.images.filter(img => img instanceof File);
        
        const existingFiles = projectData.files.filter(file => typeof file === 'string');
        const newFiles = projectData.files.filter(file => file instanceof File);

        // Send existing files as a JSON string so backend knows what to keep
        formData.append('existingImages', JSON.stringify(existingImages));
        formData.append('existingFiles', JSON.stringify(existingFiles));

        // Append actual new File objects
        newImages.forEach(img => formData.append('images', img));
        newFiles.forEach(file => formData.append('files', file));

        try {
            if (editingProjectId) {
                // PUT Request for editing
                await axios.put(`http://localhost:3001/api/projects/${editingProjectId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true 
                });
            } else {
                // POST Request for creating
                await axios.post('http://localhost:3001/api/projects', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true 
                });
            }
            
            // Refetch perfectly from database to update UI safely
            await fetchProjects();
            
            setOpenCreate(false);
            setProjectData({
                id: '', title: '', category: 'Infrastructure', description: '',
                images: [], files: [], address: '', contributionAmount: '', ownTaxes: false, status: 'Proposed'
            });
            
        } catch (error) {
            console.error('Project save failed', error);
            alert("Failed to save project to the server.");
        }
    };

    const handleEditProject = (id: string) => {
        const projectToEdit = submittedProjects.find(p => p.id === id);
        if (projectToEdit) {
            setProjectData(projectToEdit);
            setEditingProjectId(id);
            setOpenCreate(true);
        }
    };

    const handleDeleteProject = async (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to completely delete this project?");
        if (!confirmDelete) return;

        try {
            // Tell backend to delete from postgres and clean up S3
            await axios.delete(`http://localhost:3001/api/projects/${id}`, { withCredentials: true });
            
            // Remove from UI instantly
            setSubmittedProjects(prev => prev.filter(p => p.id !== id));
            const newTotalPages = Math.ceil((submittedProjects.length - 1) / PROJECTS_PER_PAGE);
            if (myProjectsPage > newTotalPages && newTotalPages > 0) setMyProjectsPage(newTotalPages);
        } catch (error) {
            console.error("Failed to delete project", error);
            alert("Failed to delete the project.");
        }
    };

    const onMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat().toFixed(6);
            const lng = e.latLng.lng().toFixed(6);
            setProjectData({ ...projectData, address: `${lat}, ${lng}` });
        }
    };

    const getMarkerPosition = (address: string) => {
        if (!address) return null;
        const parts = address.split(',');
        if (parts.length === 2) {
            const lat = parseFloat(parts[0].trim());
            const lng = parseFloat(parts[1].trim());
            if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
        }
        return null;
    };
    const markerPos = getMarkerPosition(projectData.address);

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
        // 1. If it's a new file just selected from the computer
        if (file instanceof File) return file.name;
        
        // 2. If it's an existing file fetched from the database
        if (typeof file === 'string') {
            const underscoreIndex = file.indexOf('_');
            if (underscoreIndex !== -1) {
                // Return everything AFTER the first underscore (the original name)
                return file.substring(underscoreIndex + 1);
            }
            return file; // Fallback for any old files uploaded before this change
        }
        
        if (file && file.name) return file.name;
        return `Document_${idx + 1}.pdf`;
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };
    // --- PAGINATION CALCULATIONS ---
    const myTotalPages = Math.ceil(submittedProjects.length / PROJECTS_PER_PAGE);
    const displayedMyProjects = submittedProjects.slice(
        (myProjectsPage - 1) * PROJECTS_PER_PAGE, 
        myProjectsPage * PROJECTS_PER_PAGE
    );
    const communityTotalPages = Math.ceil(communityProjects.length / PROJECTS_PER_PAGE);
    const displayedCommunityProjects = communityProjects.slice(
        (communityProjectsPage - 1) * PROJECTS_PER_PAGE, 
        communityProjectsPage * PROJECTS_PER_PAGE
    );

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

    const getStatusColor = (statusName: string) => {
        const foundStatus = statusOptions.find(s => s.name === statusName);
        return foundStatus ? foundStatus.color : 'default';
    };

    return (
        <Container sx={{ py: 8 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">Taxpayer Dashboard</Typography>
                <Typography color="text.secondary">Welcome, {user?.username}. Manage your contributions and help build the future.</Typography>
            </Box>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <section>
                    <Card sx={{ bgcolor: 'primary.main', color: 'white', height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={1}>
                                <AccountBalanceWalletIcon />
                                <Typography variant="h6">Available Tax</Typography>
                            </Box>
                            <Typography variant="h3" sx={{ my: 2 }}>
                                € {availableTax.toLocaleString('de-AT', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </Typography>
                            <Typography variant="body2">Ready for investments</Typography>
                        </CardContent>
                    </Card>
                </section>

                <section>
                    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                            <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
                            <Typography variant="h6" sx={{ mt: 1 }}>Voluntary Increase</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Boost your project funding power.
                            </Typography>
                        </CardContent>
                        <Box sx={{ p: 2 }}>
                            <Button variant="contained" fullWidth onClick={() => setOpenIncrease(true)}>
                                Manage Tax Power
                            </Button>
                        </Box>
                    </Card>
                </section>

                <section>
                    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                            <PublicIcon color="error" sx={{ fontSize: 40 }} />
                            <Typography variant="h6" sx={{ mt: 1 }}>National Solidarity</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Direct funds toward the national debt.
                            </Typography>
                        </CardContent>
                        <Box sx={{ p: 2 }}>
                            <Button variant="outlined" color="error" fullWidth onClick={() => setOpenSolidarity(true)}>
                                Pay Off Country Debt
                            </Button>
                        </Box>
                    </Card>
                </section>

                <section>
                    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                            <AddCircleOutlineIcon color="action" sx={{ fontSize: 40 }} />
                            <Typography variant="h6" sx={{ mt: 1 }}>Create New Project</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Start a new initiative for the community.
                            </Typography>
                        </CardContent>
                        <Box sx={{ p: 2 }}>
                            <Button variant="outlined" fullWidth onClick={handleOpenCreateNew}>
                                Create Project
                            </Button>
                        </Box>
                    </Card>
                </section>
            </section>

            <section style={{ marginTop: '40px' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="project tabs">
                        <Tab label="My Proposed Projects" {...a11yProps(0)} />
                        <Tab label="Community Proposed Projects" {...a11yProps(1)} />
                    </Tabs>
                </Box>
                {/* TAB 1: My Proposed Projects */}
                <CustomTabPanel value={tabValue} index={0}>
                    {submittedProjects.length === 0 ? (
                        <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                            <CardContent sx={{ textAlign: 'center', py: 5 }}>
                                <Typography variant="body1" color="text.secondary">
                                    No projects created.
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <Stack spacing={3}>
                                {displayedMyProjects.map((proj) => (
                                    <Card key={proj.id} variant="outlined">
                                        <CardContent sx={{ position: 'relative' }}>
                                            
                                            {/* Action Buttons & Status Badge */}
                                            <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip 
                                                    label={proj.status} 
                                                    color={getStatusColor(proj.status) as any} 
                                                    size="small" 
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                                <IconButton size="small" onClick={() => handleEditProject(proj.id)} color="primary">
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleDeleteProject(proj.id)} color="error">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                            <Typography variant="h6" fontWeight="bold" sx={{ pr: 20 }}>{proj.title}</Typography>
                                            <Typography color="primary" variant="subtitle2" gutterBottom>{proj.category}</Typography>
                                            <Typography variant="body2" sx={{ mb: 2 }}>{proj.description}</Typography>
                                            
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
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Using Own Taxes:</strong> {proj.ownTaxes ? 'Yes' : 'No'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Created at date:</strong> {formatDate(proj.created_at)}
                                            </Typography>
                                            {/* Multi-Image Display */}
                                            {proj.images && proj.images.length > 0 && (
                                                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', mt: 3 }}>
                                                    {proj.images.map((img, idx) => (
                                                        <Box key={idx} sx={{ width: 250, height: 200, flexShrink: 0, overflow: 'hidden', borderRadius: 1 }}>
                                                            <Image src={getImageUrl(img)} fit="cover" duration={500} alt={`Project upload ${idx}`} />
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}
                                            {/* PDF Download Links */}
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
                            </Stack>
                            {/* PAGINATION CONTROLS */}
                            {myTotalPages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                    <Pagination 
                                        count={myTotalPages} 
                                        page={myProjectsPage} 
                                        onChange={(e, val) => setMyProjectsPage(val)} 
                                        color="primary" 
                                        size="large"
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </CustomTabPanel>
                {/* TAB 2: Community Proposed Projects */}
                <CustomTabPanel value={tabValue} index={1}>
                    {communityProjects.length === 0 ? (
                        <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                            <CardContent sx={{ textAlign: 'center', py: 5 }}>
                                <Typography variant="body1" color="text.secondary">
                                    No community projects available yet.
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <Stack spacing={3}>
                                {displayedCommunityProjects.map((proj) => (
                                    <Card key={proj.id} variant="outlined">
                                        <CardContent sx={{ position: 'relative' }}>
                                            
                                            {/* Status Badge */}
                                            <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip 
                                                    label={proj.status} 
                                                    color={getStatusColor(proj.status) as any} 
                                                    size="small" 
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            </Box>
                                            <Typography variant="h6" fontWeight="bold" sx={{ pr: 10 }}>{proj.title}</Typography>
                                            <Typography color="primary" variant="subtitle2" gutterBottom>{proj.category}</Typography>
                                            <Typography variant="body2" sx={{ mb: 2 }}>{proj.description}</Typography>
                                            
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
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Using Own Taxes:</strong> {proj.ownTaxes ? 'Yes' : 'No'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Created at date:</strong> {formatDate(proj.created_at)}
                                            </Typography>
                                            
                                            {/* Multi-Image Display */}
                                            {proj.images && proj.images.length > 0 && (
                                                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', mt: 3 }}>
                                                    {proj.images.map((img, idx) => (
                                                        <Box key={idx} sx={{ width: 250, height: 200, flexShrink: 0, overflow: 'hidden', borderRadius: 1 }}>
                                                            <Image src={getImageUrl(img)} fit="cover" duration={500} alt={`Project upload ${idx}`} />
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}
                                            
                                            {/* PDF Download Links */}
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
                            </Stack>
                            {/* PAGINATION CONTROLS */}
                            {communityTotalPages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                    <Pagination 
                                        count={communityTotalPages} 
                                        page={communityProjectsPage} 
                                        onChange={(e, val) => setCommunityProjectsPage(val)} 
                                        color="primary" 
                                        size="large"
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </CustomTabPanel>
            </section>

            {/* 1. Voluntary Increase Modal */}
            <Dialog open={openIncrease} onClose={() => setOpenIncrease(false)} fullWidth maxWidth="xs">
                <DialogTitle>Tax Management & Sync</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary">Your Verified Tax Number:</Typography>
                            <Typography variant="h6" letterSpacing={2}>{user?.tax_number}</Typography>
                        </Box>

                        <Button 
                            variant="outlined" 
                            startIcon={isCheckingRis ? <CircularProgress size={20} /> : <VerifiedUserIcon />}
                            onClick={handleRisCheck}
                            disabled={isCheckingRis}
                            fullWidth
                        >
                            {isCheckingRis ? 'Connecting to RIS...' : 'System Check with RIS'}
                        </Button>

                        {risMessage && (
                            <Alert severity={risMessage.type}>{risMessage.text}</Alert>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenIncrease(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSyncToDashboard} 
                        disabled={!risAvailable || isCheckingRis} 
                    >
                        Send to Dashboard
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 2. National Solidarity Modal */}
            <Dialog open={openSolidarity} onClose={() => setOpenSolidarity(false)} fullWidth maxWidth="xs">
                <DialogTitle>Confirm National Contribution</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Below you can see the current Austrian national debt:
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                            <iframe 
                                src="https://staatsschulden.at/widget?font=courier&amp;font_size=16&amp;background_color=f5f5f5&amp;caption_color=111111&amp;padding=5" 
                                style={{ border: 'none', overflow: 'hidden', width: '200px', height: '100px' }}
                                title="National Debt Widget"
                            ></iframe>
                        </Box>

                        <Alert severity="info" icon={<PublicIcon />}>
                            So far, <b>{debtStats.number_of_people}+ people</b> have paid <b>€ +{debtStats.amount_paid.toLocaleString('de-AT', { minimumFractionDigits: 2 })}</b> towards the national debt.
                        </Alert>

                        <Typography variant="body2">
                            Your contribution will directly reduce the national debt.
                        </Typography>

                        <TextField
                            label="Amount to Contribute"
                            fullWidth
                            type="number"
                            value={solidarityInput}
                            onChange={(e) => setSolidarityInput(e.target.value)}
                            slotProps={{
                                htmlInput: { step: "0.01", min: "0" }
                            }}
                            error={parseFloat(solidarityInput) > availableTax}
                            helperText={parseFloat(solidarityInput) > availableTax ? "Exceeds available tax" : `Max: €${availableTax.toLocaleString('de-AT')}`}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenSolidarity(false)}>Go Back</Button>
                    <Button 
                        variant="contained" 
                        color="error" 
                        onClick={handleSolidaritySubmit}
                        disabled={!solidarityInput || parseFloat(solidarityInput) <= 0 || parseFloat(solidarityInput) > availableTax || isSubmittingDebt}
                    >
                        {isSubmittingDebt ? <CircularProgress size={24} /> : "Yes, Execute Payment"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 3. Create / Edit Project Modal */}
            <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editingProjectId ? "Edit Community Project" : "Propose Community Project"}</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        
                        {/* NEW: Project Status Dropdown (ONLY visible when editing) */}
                        {editingProjectId && (
                            <FormControl fullWidth>
                                <InputLabel>Project Status</InputLabel>
                                <Select
                                    value={projectData.status}
                                    label="Project Status"
                                    onChange={(e) => setProjectData({...projectData, status: e.target.value as string})}
                                >
                                    {statusOptions.map((statusOption) => (
                                        <MenuItem key={statusOption.name} value={statusOption.name}>
                                            {statusOption.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                        <TextField 
                            label="Project Title" 
                            fullWidth 
                            value={projectData.title}
                            onChange={(e) => setProjectData({...projectData, title: e.target.value})}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={projectData.category}
                                label="Category"
                                onChange={(e) => setProjectData({...projectData, category: e.target.value})}
                            >
                                <MenuItem value="Infrastructure">Infrastructure</MenuItem>
                                <MenuItem value="Technology">Technology</MenuItem>
                                <MenuItem value="Transportation">Transportation</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField 
                            label="Summary Description" 
                            placeholder="Write a short overview of the project."
                            multiline 
                            rows={4} 
                            fullWidth 
                            value={projectData.description}
                            onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                        />

                        {/* Multi Image Upload Feature with Removals */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Images Upload</Typography>
                            <Button variant="outlined" component="label" sx={{ mb: 2 }}>
                                Add Images
                                <input 
                                    type="file" 
                                    hidden 
                                    multiple
                                    accept="image/*" 
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            const newImages = Array.from(e.target.files);
                                            setProjectData({ ...projectData, images: [...projectData.images, ...newImages] });
                                        }
                                    }} 
                                />
                            </Button>
                            
                            {projectData.images.length > 0 && (
                                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', p: 1 }}>
                                    {projectData.images.map((img, idx) => (
                                        <Box key={idx} sx={{ position: 'relative', height: 80, width: 80, flexShrink: 0, overflow: 'hidden', borderRadius: 1 }}>
                                            <img 
                                                src={getImageUrl(img)} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                alt={`Preview ${idx}`}
                                            />
                                            {/* X BUTTON TO REMOVE IMAGE */}
                                            <IconButton 
                                                size="small" 
                                                onClick={() => removeImage(idx)}
                                                sx={{ 
                                                    position: 'absolute', top: 2, right: 2, 
                                                    bgcolor: 'rgba(255,255,255,0.7)', 
                                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                                                    padding: '2px'
                                                }}
                                            >
                                                <CloseIcon sx={{ fontSize: 16 }} color="error" />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>

                        {/* Multi PDF File Upload Feature with Removals */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>PDF Upload</Typography>
                            <Button variant="outlined" component="label" sx={{ mb: 2 }}>
                                Add PDF Files
                                <input 
                                    type="file" 
                                    hidden 
                                    multiple
                                    accept="application/pdf" 
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            const newFiles = Array.from(e.target.files);
                                            setProjectData({ ...projectData, files: [...projectData.files, ...newFiles] });
                                        }
                                    }} 
                                />
                            </Button>
                            
                            {projectData.files.length > 0 && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {projectData.files.map((file, idx) => (
                                        <Box key={idx} display="flex" alignItems="center" gap={1}>
                                            <Typography variant="body2" color="primary" sx={{ flexGrow: 1 }}>
                                                📎 {getFileName(file, idx)}
                                            </Typography>
                                            {/* X BUTTON TO REMOVE FILE */}
                                            <IconButton size="small" onClick={() => removeFile(idx)} color="error" title="Remove PDF">
                                                <CloseIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>

                        {/* Interactive Google Map / Address */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Location Map / Address</Typography>
                            <TextField 
                                label="Project Coordinates from below selectable map" 
                                fullWidth 
                                value={projectData.address}
                                onChange={(e) => setProjectData({...projectData, address: e.target.value})}
                                helperText="Type an address or click anywhere on the map to drop a pin."
                            />
                            {isLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={markerPos || defaultCenter}
                                    zoom={12}
                                    onClick={onMapClick}
                                    options={{ streetViewControl: false }}
                                >
                                    {markerPos && <Marker position={markerPos} />}
                                </GoogleMap>
                            ) : (
                                <Box sx={{ width: '100%', height: '200px', bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, borderRadius: 1 }}>
                                    <CircularProgress />
                                </Box>
                            )}
                        </Box>

                        {/* Contribution Area */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                How much would you like to contribute to start this project?
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <TextField
                                    label="Amount"
                                    type="number"
                                    value={projectData.contributionAmount}
                                    onChange={(e) => setProjectData({...projectData, contributionAmount: e.target.value})}
                                    sx={{ width: '150px' }}
                                    error={currentContribution > availableTax}
                                />
                                <Typography variant="body2" color={currentContribution > availableTax ? "error" : "text.secondary"}>
                                    Total amount remaining:<br/> <b>€ {remainingTax.toLocaleString('de-AT', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}</b>
                                    {currentContribution > availableTax && <><br/>(Exceeds available tax)</>}
                                </Typography>
                            </Stack>
                        </Box>

                        {/* Will Contribute using Own Taxes Toggle */}
                        <FormGroup>
                            <FormControlLabel 
                                control={
                                    <Switch 
                                        checked={projectData.ownTaxes} 
                                        onChange={(e) => setProjectData({ ...projectData, ownTaxes: e.target.checked })} 
                                    />
                                } 
                                label="Will I work / contribute to this project with my own taxes?" 
                            />
                        </FormGroup>

                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenCreate(false)}>Discard</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleCreateProject} 
                        disabled={!projectData.title || currentContribution > availableTax}
                    >
                        {editingProjectId ? "Save Changes" : "Submit Proposal"}
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
}
