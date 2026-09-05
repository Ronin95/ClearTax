import React, { useEffect, useState } from 'react';
import { 
    Container, Typography, Card, CardContent, Button, Box,
    Tabs, Tab, Pagination, CircularProgress
} from "@mui/material";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PublicIcon from '@mui/icons-material/Public';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import axios from 'axios';
import { useJsApiLoader } from '@react-google-maps/api';

import { User, ProjectData, StatusOption, CompletionData } from '../types/dashboardTypes';
import CustomTabPanel, { a11yProps } from '../components/common/CustomTabPanel';
import TaxSyncModal from '../components/dashboard/TaxSyncModal';
import SolidarityModal from '../components/dashboard/SolidarityModal';
import ProjectFormModal from '../components/dashboard/ProjectFormModal';
import ProjectList from '../components/dashboard/ProjectList';
import ProjectFilterBar from '../components/dashboard/ProjectFilterBar';
import ProjectCompletionModal from '../components/dashboard/ProjectCompletionModal';
import dayjs from 'dayjs';
import UpdatesListModal from '../components/dashboard/UpdatesListModal';
import BidsListModal from '../components/dashboard/BidsListModal';

export default function RegularDashboard() {
    const [openCompletionModal, setOpenCompletionModal] = useState(false);
    const [isModalReadOnly, setIsModalReadOnly] = useState(false); // <-- NEW
    const [completingProjectId, setCompletingProjectId] = useState<string | null>(null);
    const [completionData, setCompletionData] = useState<CompletionData>({
        summary: '', finalCost: '', completionDate: null, maintenanceNotes: '', rating: 0, finalImages: [], finalFiles: []
    });

    const [debtStats, setDebtStats] = useState({ number_of_people: 0, amount_paid: 0 });
    const [solidarityInput, setSolidarityInput] = useState<string>('');
    const [isSubmittingDebt, setIsSubmittingDebt] = useState(false);

    const [user, setUser] = useState<User | null>(null);
    const [availableTax, setAvailableTax] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    
    const [openIncrease, setOpenIncrease] = useState(false);
    const [openSolidarity, setOpenSolidarity] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    
    const [isCheckingRis, setIsCheckingRis] = useState(false);
    const [risMessage, setRisMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [risAvailable, setRisAvailable] = useState<number | null>(null);
    
    const [projectData, setProjectData] = useState<ProjectData>({ 
        id: '', title: '', category: 'Infrastructure', description: '',
        images: [], files: [], address: '', contributionAmount: '', ownTaxes: false, status: 'Proposed'
    });

    const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [submittedProjects, setSubmittedProjects] = useState<ProjectData[]>([]);
    const [communityProjects, setCommunityProjects] = useState<ProjectData[]>([]);
    
    const [tabValue, setTabValue] = useState(0);
    const [myProjectsPage, setMyProjectsPage] = useState(1);
    const [communityProjectsPage, setCommunityProjectsPage] = useState(1);
    const PROJECTS_PER_PAGE = 5;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const [activeActionId, setActiveActionId] = useState<string | null>(null);
    const [openBidsModal, setOpenBidsModal] = useState(false);
    const [openUpdatesModal, setOpenUpdatesModal] = useState(false);

    useEffect(() => {
        setMyProjectsPage(1);
        setCommunityProjectsPage(1);
    }, [searchQuery, selectedStatus]);

    const handleStatusToggle = (status: string) => {
        setSelectedStatus(prev => prev === status ? null : status);
    };

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''
    });

    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/projects/statuses');
                setStatusOptions(response.data.statuses);
            } catch (err) { console.error("Failed to fetch statuses", err); }
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
            contributionAmount: p.contributionAmount || 0, 
            amount_raised: p.amount_raised || 0,
            target_funding: p.target_funding || 0,
            ownTaxes: p.creator_work === true,                          
            status: p.status || 'Proposed',
            created_at: p.created_at,
            approvalCount: p.approval_count || 0,
            hasApproved: p.has_approved || false
        }));
    };

    const fetchProjects = async () => {
        try {
            const [myRes, communityRes] = await Promise.all([
                axios.get('http://localhost:3001/api/projects', { withCredentials: true }),
                axios.get('http://localhost:3001/api/projects/community', { withCredentials: true })
            ]);
            const myProjectsFromDB = myRes.data.projects || myRes.data;
            if (Array.isArray(myProjectsFromDB)) setSubmittedProjects(formatProjects(myProjectsFromDB));
            const commProjectsFromDB = communityRes.data.projects || communityRes.data;
            if (Array.isArray(commProjectsFromDB)) setCommunityProjects(formatProjects(commProjectsFromDB));
        } catch (err) { console.error("Failed to fetch projects from backend", err); }
    };

    useEffect(() => { fetchProjects(); }, []);

    useEffect(() => {
        const fetchDebtStats = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/landingPage/debt-stats');
                setDebtStats({ number_of_people: res.data.number_of_people, amount_paid: res.data.amount_paid });
            } catch (err) { console.error("Error fetching debt stats", err); }
        };
        fetchDebtStats();
    }, []);

    const handleSolidaritySubmit = async () => {
        const amount = parseFloat(solidarityInput);
        if (isNaN(amount) || amount <= 0 || amount > availableTax) return;

        setIsSubmittingDebt(true);
        try {
            const response = await axios.post('http://localhost:3001/api/users/contribute-debt', { amount }, { withCredentials: true });
            setAvailableTax(parseFloat(response.data.newBalance));
            setDebtStats(prev => ({ number_of_people: prev.number_of_people + 1, amount_paid: prev.amount_paid + amount }));
            setOpenSolidarity(false);
            setSolidarityInput('');
            alert("Thank you for your contribution to the National Solidarity fund!");
        } catch (err) {
            console.error("Debt contribution failed", err);
            alert("Payment failed. Please ensure you have enough available tax.");
        } finally { setIsSubmittingDebt(false); }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/users/me', { withCredentials: true });
                setUser(response.data.user); 
                setAvailableTax(parseFloat(response.data.user.available_amount));
            } catch (err) { console.error("Failed to fetch balance", err); } 
            finally { setLoading(false); }
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
                setRisAvailable(rawAmount); 
                setRisMessage({ type: 'success', text: `RIS System found €${new Intl.NumberFormat('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }).format(rawAmount)} in unclaimed tax credits.` });
            } else {
                setRisMessage({ type: 'error', text: 'No recent tax payments found in the RIS system for your tax number.' });
            }
            setIsCheckingRis(false);
        }, 1200);
    };

    const handleSyncToDashboard = async () => {
        if (!risAvailable) return;
        try {
            const response = await axios.post('http://localhost:3001/api/users/sync-taxes', { amountToAdd: risAvailable }, { withCredentials: true });
            setAvailableTax(parseFloat(response.data.newBalance));
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
        setProjectData({ id: '', title: '', category: 'Infrastructure', description: '', images: [], files: [], address: '', contributionAmount: '', ownTaxes: false, status: 'Proposed' });
        setOpenCreate(true);
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

        const existingImages = projectData.images.filter(img => typeof img === 'string');
        const newImages = projectData.images.filter(img => img instanceof File);
        const existingFiles = projectData.files.filter(file => typeof file === 'string');
        const newFiles = projectData.files.filter(file => file instanceof File);

        formData.append('existingImages', JSON.stringify(existingImages));
        formData.append('existingFiles', JSON.stringify(existingFiles));
        newImages.forEach(img => formData.append('images', img));
        newFiles.forEach(file => formData.append('files', file));

        try {
            if (editingProjectId) {
                await axios.put(`http://localhost:3001/api/projects/${editingProjectId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true });
            } else {
                await axios.post('http://localhost:3001/api/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true });
            }
            await fetchProjects();
            setOpenCreate(false);
            setProjectData({ id: '', title: '', category: 'Infrastructure', description: '', images: [], files: [], address: '', contributionAmount: '', ownTaxes: false, status: 'Proposed' });
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
            await axios.delete(`http://localhost:3001/api/projects/${id}`, { withCredentials: true });
            setSubmittedProjects(prev => prev.filter(p => p.id !== id));
            const newTotalPages = Math.ceil((submittedProjects.length - 1) / PROJECTS_PER_PAGE);
            if (myProjectsPage > newTotalPages && newTotalPages > 0) setMyProjectsPage(newTotalPages);
        } catch (error) {
            console.error("Failed to delete project", error);
            alert("Failed to delete the project.");
        }
    };

    const handleApproveProject = async (id: string, comment: string, fundedAmount: number, files: File[]) => {
        try {
            const formData = new FormData();
            formData.append('comment', comment);
            formData.append('fundedAmount', fundedAmount.toString());
            files.forEach(file => formData.append('files', file));

            await axios.post(`http://localhost:3001/api/projects/${id}/approve`, formData, { 
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true 
            });
            await fetchProjects(); // Refresh the projects list
            
            // Re-fetch user data to instantly update the "Available Tax" balance!
            const userResponse = await axios.get('http://localhost:3001/api/users/me', { withCredentials: true });
            setAvailableTax(parseFloat(userResponse.data.user.available_amount));
        } catch (err: any) {
            console.error("Failed to approve project", err);
            // Throw so ProjectList knows it failed and can show the backend error message
            throw err; 
        }
    };

    const getStatusColor = (statusName: string) => {
        const foundStatus = statusOptions.find(s => s.name === statusName);
        return foundStatus ? foundStatus.color : 'default';
    };

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

    const getFilteredProjects = (projects: ProjectData[]) => {
        return projects.filter(p => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = p.title.toLowerCase().includes(searchLower) || 
                                  p.description.toLowerCase().includes(searchLower);
            const matchesStatus = selectedStatus ? p.status === selectedStatus : true;
            return matchesSearch && matchesStatus;
        });
    };

    const handleOpenComplete = (id: string) => {
        setCompletingProjectId(id);
        setCompletionData({ summary: '', finalCost: '', completionDate: null, maintenanceNotes: '', rating: 0, finalImages: [], finalFiles: [] });
        setOpenCompletionModal(true);
    };

    const handleCompleteProjectSubmit = async () => {
        if (!completingProjectId) return;
        
        const formData = new FormData();
        formData.append('summary', completionData.summary);
        formData.append('finalCost', completionData.finalCost);
        if (completionData.completionDate) {
            formData.append('completionDate', completionData.completionDate.toISOString()); // Send standard ISO string to backend
        }
        formData.append('maintenanceNotes', completionData.maintenanceNotes);
        formData.append('rating', completionData.rating.toString());
        
        completionData.finalImages.forEach(img => formData.append('finalImages', img));
        completionData.finalFiles.forEach(file => formData.append('finalFiles', file));

        try {
            await axios.post(`http://localhost:3001/api/projects/${completingProjectId}/complete`, formData, { 
                headers: { 'Content-Type': 'multipart/form-data' }, 
                withCredentials: true 
            });
            await fetchProjects(); // Refresh everything instantly!
            setOpenCompletionModal(false);
            setCompletingProjectId(null);
            alert("Project successfully completed and closed out!");
        } catch (error) {
            console.error('Project completion failed', error);
            alert("Failed to submit completion report.");
        }
    };

    const filteredMyProjects = getFilteredProjects(submittedProjects);
    const myTotalPages = Math.ceil(filteredMyProjects.length / PROJECTS_PER_PAGE);
    const displayedMyProjects = filteredMyProjects.slice((myProjectsPage - 1) * PROJECTS_PER_PAGE, myProjectsPage * PROJECTS_PER_PAGE);

    const filteredCommunityProjects = getFilteredProjects(communityProjects);
    const communityTotalPages = Math.ceil(filteredCommunityProjects.length / PROJECTS_PER_PAGE);
    const displayedCommunityProjects = filteredCommunityProjects.slice((communityProjectsPage - 1) * PROJECTS_PER_PAGE, communityProjectsPage * PROJECTS_PER_PAGE);

    const handleOpenCompletionModal = async (id: string, readOnly: boolean) => {
        try {
            const res = await axios.get(`http://localhost:3001/api/projects/${id}/completion`, { withCredentials: true });
            const data = res.data.completion;
            setCompletionData({
                summary: data.summary || '',
                finalCost: data.final_cost || '',
                completionDate: data.completion_date ? dayjs(data.completion_date) : null,
                maintenanceNotes: data.maintenance_notes || '',
                rating: data.rating || 0,
                finalImages: data.final_image_list || [],
                finalFiles: data.final_file_list || []
            });
            setCompletingProjectId(id);
            setIsModalReadOnly(readOnly);
            setOpenCompletionModal(true);
        } catch (err) {
            console.error("Failed to fetch completion data", err);
            alert("Failed to load the completion report. It might not exist.");
        }
    };

    const handleViewBids = (id: string) => { setActiveActionId(id); setOpenBidsModal(true); };
    const handleViewUpdates = (id: string) => { setActiveActionId(id); setOpenUpdatesModal(true); };
    
    const handleAcceptBid = async (bidId: string) => {
        if (!activeActionId) return;
        try {
            await axios.post(`http://localhost:3001/api/projects/${activeActionId}/accept-bid`, { bidId }, { withCredentials: true });
            alert("Bid accepted! The project is now In Progress.");
            setOpenBidsModal(false);
            fetchProjects(); // Refresh dashboard
        } catch (err) { alert("Failed to accept bid"); }
    };

    const handleVerifyCompletion = async (id: string) => {
        try {
            await axios.post(`http://localhost:3001/api/projects/${id}/verify-completion`, {}, { withCredentials: true });
            alert("You have officially signed off on the completion report! If enough users sign off, it will be fully Completed.");
            fetchProjects(); // Refresh dashboard
        } catch (err) { alert("Failed to verify"); }
    };

    return (
        <Container sx={{ py: 8 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">Taxpayer Dashboard</Typography>
                <Typography color="text.secondary">Welcome, {user?.username}. Manage your contributions and help build the future.</Typography>
            </Box>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <Card sx={{ bgcolor: 'primary.main', color: 'white', height: '100%' }}>
                    <CardContent>
                        <Box display="flex" alignItems="center" gap={1}>
                            <AccountBalanceWalletIcon />
                            <Typography variant="h6">Available Tax</Typography>
                        </Box>
                        <Typography variant="h3" sx={{ my: 2 }}>€ {availableTax.toLocaleString('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                    </CardContent>
                </Card>
                <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                        <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
                        <Typography variant="h6" sx={{ mt: 1 }}>Access your Tax money</Typography>
                    </CardContent>
                    <Box sx={{ p: 2 }}><Button variant="contained" fullWidth onClick={() => setOpenIncrease(true)}>Manage Tax Power</Button></Box>
                </Card>
                <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                        <PublicIcon color="error" sx={{ fontSize: 40 }} />
                        <Typography variant="h6" sx={{ mt: 1 }}>National Solidarity</Typography>
                    </CardContent>
                    <Box sx={{ p: 2 }}><Button variant="outlined" color="error" fullWidth onClick={() => setOpenSolidarity(true)}>Pay Off Country Debt</Button></Box>
                </Card>
                <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                        <AddCircleOutlineIcon color="action" sx={{ fontSize: 40 }} />
                        <Typography variant="h6" sx={{ mt: 1 }}>Create New Project</Typography>
                    </CardContent>
                    <Box sx={{ p: 2 }}><Button variant="outlined" fullWidth onClick={handleOpenCreateNew}>Create Project</Button></Box>
                </Card>
            </section>

            <section style={{ marginTop: '40px' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
                        <Tab label="My Proposed Projects" {...a11yProps(0)} />
                        <Tab label="Community Proposed Projects" {...a11yProps(1)} />
                    </Tabs>
                </Box>
                
                <ProjectFilterBar 
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedStatus={selectedStatus}
                    onStatusToggle={handleStatusToggle}
                    statusOptions={statusOptions}
                />
                
                <CustomTabPanel value={tabValue} index={0}>
                    <ProjectList 
                        projects={displayedMyProjects} 
                        showActions={true} 
                        onEdit={handleEditProject} 
                        onDelete={handleDeleteProject} 
                        onComplete={handleOpenComplete}
                        onViewCompletion={(id) => handleOpenCompletionModal(id, true)}
                        onEditCompletion={(id) => handleOpenCompletionModal(id, false)}
                        getStatusColor={getStatusColor} 
                        formatDate={formatDate}
                        onViewBids={handleViewBids}
                        onViewUpdates={handleViewUpdates}
                        onVerifyCompletion={handleVerifyCompletion}
                    />
                    {myTotalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination count={myTotalPages} page={myProjectsPage} onChange={(e, val) => setMyProjectsPage(val)} color="primary" size="large" />
                        </Box>
                    )}
                </CustomTabPanel>
                
                <CustomTabPanel value={tabValue} index={1}>
                    <ProjectList 
                        projects={displayedCommunityProjects} 
                        showActions={false} 
                        isCommunityTab={true} 
                        onApprove={handleApproveProject} 
                        onViewCompletion={(id) => handleOpenCompletionModal(id, true)}
                        getStatusColor={getStatusColor} 
                        formatDate={formatDate} 
                    />
                    {communityTotalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination count={communityTotalPages} page={communityProjectsPage} onChange={(e, val) => setCommunityProjectsPage(val)} color="primary" size="large" />
                        </Box>
                    )}
                </CustomTabPanel>
            </section>

            <TaxSyncModal 
                open={openIncrease} onClose={() => setOpenIncrease(false)} 
                user={user} isCheckingRis={isCheckingRis} risMessage={risMessage} 
                risAvailable={risAvailable} onRisCheck={handleRisCheck} onSync={handleSyncToDashboard} 
            />

            <SolidarityModal 
                open={openSolidarity} onClose={() => setOpenSolidarity(false)} 
                debtStats={debtStats} availableTax={availableTax} 
                solidarityInput={solidarityInput} setSolidarityInput={setSolidarityInput} 
                isSubmittingDebt={isSubmittingDebt} onSubmit={handleSolidaritySubmit} 
            />

            <ProjectFormModal 
                open={openCreate} onClose={() => setOpenCreate(false)} 
                projectData={projectData} setProjectData={setProjectData} 
                editingProjectId={editingProjectId} statusOptions={statusOptions} 
                availableTax={availableTax} currentContribution={currentContribution} 
                remainingTax={remainingTax} isLoaded={isLoaded} onSubmit={handleCreateProject} 
            />

            <ProjectCompletionModal 
                open={openCompletionModal} 
                onClose={() => setOpenCompletionModal(false)}
                completionData={completionData}
                setCompletionData={setCompletionData}
                onSubmit={handleCompleteProjectSubmit}
                readOnly={isModalReadOnly}
            />

            <BidsListModal open={openBidsModal} onClose={() => setOpenBidsModal(false)} projectId={activeActionId} onAcceptBid={handleAcceptBid} />
            <UpdatesListModal open={openUpdatesModal} onClose={() => setOpenUpdatesModal(false)} projectId={activeActionId} />
        </Container>
    );
}
