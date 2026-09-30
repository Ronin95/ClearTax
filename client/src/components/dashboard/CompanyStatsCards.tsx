import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import EuroIcon from '@mui/icons-material/Euro';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { ProjectData, User } from '../../types/dashboardTypes';

interface Props {
    user: User | null;
    portfolioProjects: ProjectData[];
    activeProjects: ProjectData[];
}

export default function CompanyStatsCards({ user, portfolioProjects, activeProjects }: Props) {
    const totalEarnings = Number(user?.available_amount || 0);
    const avgContractValue = portfolioProjects.length > 0 ? totalEarnings / portfolioProjects.length : 0;

    return (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <Card sx={{ bgcolor: '#2e7d32', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                    <EuroIcon sx={{ fontSize: 40 }} />
                    <Typography variant="h6">Total Earnings</Typography>
                    <Typography variant="h4">
                        € {totalEarnings.toLocaleString('de-AT')}
                    </Typography>
                </CardContent>
            </Card>
            
            <Card sx={{ bgcolor: '#1976d2', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 40 }} />
                    <Typography variant="h6">Completed Contracts</Typography>
                    <Typography variant="h4">
                        {portfolioProjects.length}
                    </Typography>
                </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderColor: '#1976d2' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                    <BuildIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h6">Active Contracts</Typography>
                    <Typography variant="h4">
                        {activeProjects.length}
                    </Typography>
                </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderColor: '#ed6c02' }}>
                <CardContent sx={{ textAlign: 'center', color: '#ed6c02' }}>
                    <QueryStatsIcon sx={{ fontSize: 40 }} />
                    <Typography variant="h6">Avg. Contract Value</Typography>
                    <Typography variant="h4">
                        € {avgContractValue.toLocaleString('de-AT', { maximumFractionDigits: 0 })}
                    </Typography>
                </CardContent>
            </Card>
        </section>
    );
}
