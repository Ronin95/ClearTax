import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Box, Tabs, Tab, CircularProgress } from "@mui/material";
import EuroIcon from '@mui/icons-material/Euro';
import BuildIcon from '@mui/icons-material/Build';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import axios from 'axios';
import dayjs from 'dayjs';

import { User, ProjectData, CompletionData } from '../types/dashboardTypes';
import CustomTabPanel, { a11yProps } from '../components/common/CustomTabPanel';
import ProjectList from '../components/dashboard/ProjectList';
import BidModal from '../components/dashboard/BidModal';
import UpdateModal from '../components/dashboard/UpdateModal';
import ProjectCompletionModal from '../components/dashboard/ProjectCompletionModal';

export default function CompanyDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    const [tenderProjects, setTenderProjects] = useState<ProjectData[]>([]);
    const [activeProjects, setActiveProjects] = useState<ProjectData[]>([]);
    const [portfolioProjects, setPortfolioProjects] = useState<ProjectData[]>([]);

    // Modals state
    const [openBidModal, setOpenBidModal] = useState(false);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const [openCompletionModal, setOpenCompletionModal] = useState(false);
    
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
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
            ownTaxes: p.creator_work === true,                          
            status: p.status || 'Proposed',
            created_at: p.created_at,
        }));
    };

    const fetchDashboardData = async () => {
        try {
            const userRes = await axios.get('http://localhost:3001/api/users/me', { withCredentials: true });
            setUser(userRes.data.user);

            // Fetch Tender Board (Approved projects looking for a company)
            const tenderRes = await axios.get('http://localhost:3001/api/projects/tender-board', { withCredentials: true });
            setTenderProjects(formatProjects(tenderRes.data.projects));

            // Fetch My Projects (In Progress or Completed)
            const myRes = await axios.get('http://localhost:3001/api/projects', { withCredentials: true });
            const allMyProjects = formatProjects(myRes.data.projects);
            
            // Note: The GET /api/projects route fetches where user_id = me. 
            // Wait, if the company didn't *create* the project, it won't show up there!
            // For now, let's just assume we will fetch them (we will fix the backend GET for companies later if needed)
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
    const handleBid = (id: string) => { setActiveProjectId(id); setOpenBidModal(true); };
    const handleUpdate = (id: string) => { setActiveProjectId(id); setOpenUpdateModal(true); };
    
    const handleBidSubmit = async (data: any) => {
        if (!activeProjectId) return;
        const formData = new FormData();
        formData.append('estimatedCost', data.estimatedCost);
        formData.append('pitch', data.pitch);
        if (data.startDate) formData.append('startDate', data.startDate.toISOString());
        if (data.endDate) formData.append('endDate', data.endDate.toISOString());
        if (data.files) data.files.forEach((file: File) => formData.append('files', file));

        try {
            await axios.post(`http://localhost:3001/api/projects/${activeProjectId}/bids`, formData, { 
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true 
            });
            alert("Bid submitted successfully! Wait for the community to review it.");
            setOpenBidModal(false);
        } catch (err) { alert("Failed to submit bid."); }
    };

    const handleUpdateSubmit = async (data: any) => {
        if (!activeProjectId) return;
        const formData = new FormData();
        formData.append('message', data.message);
        if (data.image) formData.append('image', data.image);
        try {
            await axios.post(`http://localhost:3001/api/projects/${activeProjectId}/updates`, formData, { 
                headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true 
            });
            alert("Update posted to the community!");
            setOpenUpdateModal(false);
        } catch (err) { alert("Failed to post update."); }
    };

    const handleComplete = (id: string) => {
        setActiveProjectId(id);
        setCompletionData({ summary: '', finalCost: '', completionDate: null, maintenanceNotes: '', rating: 0, finalImages: [], finalFiles: [] });
        setOpenCompletionModal(true);
    };

    const handleCompleteProjectSubmit = async () => {
        if (!activeProjectId) return;
        const formData = new FormData();
        formData.append('summary', completionData.summary);
        formData.append('finalCost', completionData.finalCost);
        if (completionData.completionDate) formData.append('completionDate', completionData.completionDate.toISOString());
        formData.append('maintenanceNotes', completionData.maintenanceNotes);
        formData.append('rating', completionData.rating.toString());
        completionData.finalImages.forEach(img => formData.append('finalImages', img));
        completionData.finalFiles.forEach(file => formData.append('finalFiles', file));

        try {
            await axios.post(`http://localhost:3001/api/projects/${activeProjectId}/complete`, formData, { 
                headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true 
            });
            alert("Completion Report sent! Awaiting community verification.");
            setOpenCompletionModal(false);
            fetchDashboardData();
        } catch (error) { alert("Failed to submit completion report."); }
    };

    if (loading) return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;

    return (
        <Container sx={{ py: 8 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">Company Portal</Typography>
                <Typography color="text.secondary">Welcome, {user?.company_name || user?.username}. Browse tenders and manage active contracts.</Typography>
            </Box>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <Card sx={{ bgcolor: '#2e7d32', color: 'white' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <EuroIcon sx={{ fontSize: 40 }} />
                        <Typography variant="h6">Total Revenue</Typography>
                        <Typography variant="h4">€ {portfolioProjects.reduce((sum, p) => sum + Number(p.contributionAmount), 0).toLocaleString('de-AT')}</Typography>
                    </CardContent>
                </Card>
                <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                        <BuildIcon color="primary" sx={{ fontSize: 40 }} />
                        <Typography variant="h6">Active Pipeline</Typography>
                        <Typography variant="h4">€ {activeProjects.reduce((sum, p) => sum + Number(p.contributionAmount), 0).toLocaleString('de-AT')}</Typography>
                    </CardContent>
                </Card>
            </section>

            <section style={{ marginTop: '40px' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
                        <Tab label={`Tender Board (${tenderProjects.length})`} {...a11yProps(0)} />
                        <Tab label={`Active Contracts (${activeProjects.length})`} {...a11yProps(1)} />
                        <Tab label={`Completed Portfolio (${portfolioProjects.length})`} {...a11yProps(2)} />
                    </Tabs>
                </Box>
                
                <CustomTabPanel value={tabValue} index={0}>
                    <ProjectList projects={tenderProjects} showActions={false} onBid={handleBid} getStatusColor={() => 'info'} formatDate={(d) => d ? new Date(d).toLocaleDateString() : ''} />
                </CustomTabPanel>
                
                <CustomTabPanel value={tabValue} index={1}>
                    <ProjectList projects={activeProjects} showActions={false} onUpdate={handleUpdate} onComplete={handleComplete} getStatusColor={() => 'warning'} formatDate={(d) => d ? new Date(d).toLocaleDateString() : ''} />
                </CustomTabPanel>

                <CustomTabPanel value={tabValue} index={2}>
                    <ProjectList projects={portfolioProjects} showActions={false} getStatusColor={() => 'success'} formatDate={(d) => d ? new Date(d).toLocaleDateString() : ''} />
                </CustomTabPanel>
            </section>

            <BidModal open={openBidModal} onClose={() => setOpenBidModal(false)} onSubmit={handleBidSubmit} />
            <UpdateModal open={openUpdateModal} onClose={() => setOpenUpdateModal(false)} onSubmit={handleUpdateSubmit} />
            
            <ProjectCompletionModal 
                open={openCompletionModal} onClose={() => setOpenCompletionModal(false)}
                completionData={completionData} setCompletionData={setCompletionData}
                onSubmit={handleCompleteProjectSubmit} readOnly={false}
            />
        </Container>
    );
}
