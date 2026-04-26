import React, { useEffect, useState } from 'react';
import { 
    Container, Typography, Card, CardContent, Button, Box,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
    MenuItem, FormControl, InputLabel, Select, Stack, CircularProgress, Alert
} from "@mui/material";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PublicIcon from '@mui/icons-material/Public';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'; // New icon for RIS check
import axios from 'axios';

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

export default function RegularDashboard() {
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

    const [increasePct, setIncreasePct] = useState('5');
    const [projectData, setProjectData] = useState({ title: '', category: 'Infrastructure', description: '' });

    const [risAvailable, setRisAvailable] = useState<number | null>(null);
    const [manualAmount, setManualAmount] = useState<number | string>('');
    const [syncError, setSyncError] = useState<string | null>(null);

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
        setRisAvailable(null); // Reset found amount on new check

        setTimeout(() => {
            const success = Math.random() > 0.2; 
            if (success) {
                const rawAmount = Math.random() * (5000 - 500) + 500;
                
                // Format for display: "1234,55"
                const displayAmount = new Intl.NumberFormat('de-AT', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2,
                    useGrouping: false 
                }).format(rawAmount);

                setRisAvailable(rawAmount); // Store the raw number (e.g. 1234.55)
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
            
            console.log("Database successfully updated to:", updatedBalance);
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

    const handleIncreaseSubmit = async () => {
        const amountToUpload = Number(manualAmount);

        // Validation logic
        if (!risAvailable || amountToUpload > risAvailable) {
            setSyncError(`You cannot claim more than the €${risAvailable} found by RIS.`);
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/api/users/increase-available-tax',
                { amount: amountToUpload }, 
                { withCredentials: true }
            );

            // Update local availableTax state with the new balance from DB
            setAvailableTax(parseFloat(response.data.newBalance));
            setOpenIncrease(false);
            // Reset states for next time
            setRisAvailable(null);
            setManualAmount('');
        } catch (err) {
            setSyncError("Failed to save amount to database.");
        }
    };

    const handleCreateProject = () => {
        console.log("New Project Created:", projectData);
        setOpenCreate(false);
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
                            <Typography variant="body2">Ready for project allocation</Typography>
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
                            <Button variant="outlined" fullWidth onClick={() => setOpenCreate(true)}>
                                Create Project
                            </Button>
                        </Box>
                    </Card>
                </section>
            </section>

            {/* ================= MODALS (DIALOGS) ================= */}

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

                        {/* Note: Manual percentage increase section removed as per your focus on RIS sync */}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenIncrease(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSyncToDashboard} // Trigger the backend sync
                        disabled={!risAvailable || isCheckingRis} // Enabled only if money was found
                    >
                        Send to Dashboard
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 2. National Solidarity Modal */}
            <Dialog open={openSolidarity} onClose={() => setOpenSolidarity(false)}>
                <DialogTitle>Confirm National Contribution</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to allocate your available tax (€{availableTax}) to help pay off the National Debt? This action is non-reversible.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenSolidarity(false)}>Go Back</Button>
                    <Button variant="contained" color="error" onClick={() => setOpenSolidarity(false)}>
                        Yes, Execute Payment
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 3. Create Project Modal */}
            <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm">
                <DialogTitle>Propose Community Project</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField 
                            label="Project Title" 
                            fullWidth 
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
                                <MenuItem value="Environment">Environment</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField 
                            label="Detailed Description" 
                            multiline 
                            rows={4} 
                            fullWidth 
                            onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenCreate(false)}>Discard</Button>
                    <Button variant="contained" onClick={handleCreateProject}>Submit Proposal</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
}
