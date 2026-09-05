import { useEffect, useState } from 'react';
import { Container, Typography, Box, Tabs, Tab, CircularProgress, TextField, InputAdornment } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

import { User, ProjectData, CompletionData } from '../types/dashboardTypes';
import CustomTabPanel, { a11yProps } from '../components/common/CustomTabPanel';
import ProjectList from '../components/dashboard/ProjectList';
import BidModal from '../components/dashboard/BidModal';
import UpdateModal from '../components/dashboard/UpdateModal';
import ProjectCompletionModal from '../components/dashboard/ProjectCompletionModal';
import CompanyStatsCards from '../components/dashboard/CompanyStatsCards';

export default function CompanyDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    // The arrays containing all projects for each tab
    const [tenderProjects, setTenderProjects] = useState<ProjectData[]>([]);
    const [activeProjects, setActiveProjects] = useState<ProjectData[]>([]);
    const [portfolioProjects, setPortfolioProjects] = useState<ProjectData[]>([]);

    // The currently selected project for the Modals
    const [activeProject, setActiveProject] = useState<ProjectData | null>(null);

    // Modals state
    const [openBidModal, setOpenBidModal] = useState(false);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const [openCompletionModal, setOpenCompletionModal] = useState(false);
    
    const [completionData, setCompletionData] = useState<CompletionData>({
        summary: '', finalCost: '', completionDate: null, maintenanceNotes: '', rating: 0, finalImages: [], finalFiles: []
    });

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
            amount_raised: p.amount_raised || 0,
            target_funding: p.target_funding || 0,
            ownTaxes: p.creator_work === true,                          
            status: p.status || 'Proposed',
            created_at: p.created_at,
        }));
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

    const fetchDashboardData = async () => {
        try {
            const userRes = await axios.get('http://localhost:3001/api/users/me', { withCredentials: true });
            setUser(userRes.data.user);

            const tenderRes = await axios.get('http://localhost:3001/api/projects/tender-board', { withCredentials: true });
            setTenderProjects(formatProjects(tenderRes.data.projects));

            const myRes = await axios.get('http://localhost:3001/api/projects', { withCredentials: true });
            const allMyProjects = formatProjects(myRes.data.projects);
            
            setActiveProjects(allMyProjects.filter(p => p.status === 'In Progress' || p.status === 'Pending Completion'));
            setPortfolioProjects(allMyProjects.filter(p => p.status === 'Completed'));
        } catch (err) {
            console.error("Failed to load dashboard", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboardData(); }, []);

    // Action Handlers
    const handleBid = (id: string) => { 
        const proj = tenderProjects.find(p => p.id === id) || activeProjects.find(p => p.id === id);
        setActiveProject(proj || null); 
        setOpenBidModal(true); 
    };

    const handleUpdate = (id: string) => { 
        setActiveProject(activeProjects.find(p => p.id === id) || null); 
        setOpenUpdateModal(true); 
    };

    const handleComplete = (id: string) => {
        setActiveProject(activeProjects.find(p => p.id === id) || null);
        setCompletionData({ summary: '', finalCost: '', completionDate: null, maintenanceNotes: '', rating: 0, finalImages: [], finalFiles: [] });
        setOpenCompletionModal(true);
    };
    
    const handleBidSubmit = async (data: any) => {
        if (!activeProject?.id) return;
        const formData = new FormData();
        formData.append('estimatedCost', data.estimatedCost);
        formData.append('pitch', data.pitch);
        if (data.startDate) formData.append('startDate', data.startDate.toISOString());
        if (data.endDate) formData.append('endDate', data.endDate.toISOString());
        if (data.files) data.files.forEach((file: File) => formData.append('files', file));

        try {
            await axios.post(`http://localhost:3001/api/projects/${activeProject.id}/bids`, formData, { 
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true 
            });
            alert("Bid submitted successfully! Wait for the community to review it.");
            setOpenBidModal(false);
        } catch (err) { alert("Failed to submit bid."); }
    };

    const handleUpdateSubmit = async (data: any) => {
        if (!activeProject?.id) return;
        const formData = new FormData();
        formData.append('message', data.message);
        if (data.image) formData.append('image', data.image);
        try {
            await axios.post(`http://localhost:3001/api/projects/${activeProject.id}/updates`, formData, { 
                headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true 
            });
            alert("Update posted to the community!");
            setOpenUpdateModal(false);
        } catch (err) { alert("Failed to post update."); }
    };

    const handleCompleteProjectSubmit = async () => {
        if (!activeProject?.id) return;
        const formData = new FormData();
        formData.append('summary', completionData.summary);
        formData.append('finalCost', completionData.finalCost);
        if (completionData.completionDate) formData.append('completionDate', completionData.completionDate.toISOString());
        formData.append('maintenanceNotes', completionData.maintenanceNotes);
        formData.append('rating', completionData.rating.toString());
        completionData.finalImages.forEach(img => formData.append('finalImages', img));
        completionData.finalFiles.forEach(file => formData.append('finalFiles', file));

        try {
            await axios.post(`http://localhost:3001/api/projects/${activeProject.id}/complete`, formData, { 
                headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true 
            });
            alert("Completion Report sent! Awaiting community verification.");
            setOpenCompletionModal(false);
            fetchDashboardData();
        } catch (error) { alert("Failed to submit completion report."); }
    };

    if (loading) return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;

    const getFilteredProjects = (projects: ProjectData[]) => {
        return projects.filter(p => {
            const searchLower = searchQuery.toLowerCase();
            return p.title.toLowerCase().includes(searchLower) || p.description.toLowerCase().includes(searchLower);
        });
    };

    const displayedTender = getFilteredProjects(tenderProjects);
    const displayedActive = getFilteredProjects(activeProjects);
    const displayedPortfolio = getFilteredProjects(portfolioProjects);

    return (
        <Container sx={{ py: 8 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">Company Portal</Typography>
                <Typography color="text.secondary">Welcome, {user?.company_name || user?.username}. Browse tenders and manage active contracts.</Typography>
            </Box>

            <CompanyStatsCards portfolioProjects={portfolioProjects} activeProjects={activeProjects} />

            <section style={{ marginTop: '40px' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
                        <Tab label={`Tender Board (${displayedTender.length})`} {...a11yProps(0)} />
                        <Tab label={`Active Contracts (${displayedActive.length})`} {...a11yProps(1)} />
                        <Tab label={`Completed Portfolio (${displayedPortfolio.length})`} {...a11yProps(2)} />
                    </Tabs>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                    <TextField 
                        fullWidth 
                        variant="outlined" 
                        placeholder="Search projects by title or description..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />
                </Box>

                <CustomTabPanel value={tabValue} index={0}>
                    <ProjectList projects={displayedTender} showActions={false} onBid={handleBid} getStatusColor={() => 'info'} formatDate={formatDate} />
                </CustomTabPanel>
                
                <CustomTabPanel value={tabValue} index={1}>
                    <ProjectList projects={displayedActive} showActions={false} onUpdate={handleUpdate} onComplete={handleComplete} getStatusColor={() => 'warning'} formatDate={formatDate} />
                </CustomTabPanel>

                <CustomTabPanel value={tabValue} index={2}>
                    <ProjectList projects={displayedPortfolio} showActions={false} getStatusColor={() => 'success'} formatDate={formatDate} />
                </CustomTabPanel>
            </section>

            <BidModal open={openBidModal} onClose={() => setOpenBidModal(false)} onSubmit={handleBidSubmit} project={activeProject} />
            <UpdateModal open={openUpdateModal} onClose={() => setOpenUpdateModal(false)} onSubmit={handleUpdateSubmit} />
            
            <ProjectCompletionModal 
                open={openCompletionModal} onClose={() => setOpenCompletionModal(false)}
                completionData={completionData} setCompletionData={setCompletionData}
                onSubmit={handleCompleteProjectSubmit} readOnly={false}
            />
        </Container>
    );
}
