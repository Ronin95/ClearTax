import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import EuroIcon from '@mui/icons-material/Euro';
import BuildIcon from '@mui/icons-material/Build';
import { ProjectData } from '../../types/dashboardTypes';

interface Props {
    portfolioProjects: ProjectData[];
    activeProjects: ProjectData[];
}

export default function CompanyStatsCards({ portfolioProjects, activeProjects }: Props) {
    return (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <Card sx={{ bgcolor: '#2e7d32', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                    <EuroIcon sx={{ fontSize: 40 }} />
                    <Typography variant="h6">Total Revenue</Typography>
                    <Typography variant="h4">
                        € {portfolioProjects.reduce((sum, p) => sum + Number(p.amount_raised || 0), 0).toLocaleString('de-AT')}
                    </Typography>
                </CardContent>
            </Card>
            <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                    <BuildIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h6">Active Pipeline</Typography>
                    <Typography variant="h4">
                        € {activeProjects.reduce((sum, p) => sum + Number(p.amount_raised || 0), 0).toLocaleString('de-AT')}
                    </Typography>
                </CardContent>
            </Card>
        </section>
    );
}
