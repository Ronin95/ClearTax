import React from 'react';
import { Box, TextField, Chip, Stack } from '@mui/material';
import { ProjectFilterBarProps } from '../../types/dashboardTypes';

export default function ProjectFilterBar({
    searchQuery, onSearchChange, selectedStatus, onStatusToggle, statusOptions
}: ProjectFilterBarProps) {
    return (
        <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { md: 'center' } }}>
            <TextField
                label="Search Projects"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                sx={{ minWidth: '300px' }}
                placeholder="Search by title or description..."
            />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {statusOptions.map((status) => (
                    <Chip
                        key={status.name}
                        label={status.name}
                        // Use the chip color if selected, otherwise keep it default/grayed out
                        color={selectedStatus === status.name ? (status.color as any) : 'default'}
                        variant={selectedStatus === status.name ? 'filled' : 'outlined'}
                        onClick={() => onStatusToggle(status.name)}
                        sx={{ 
                            fontWeight: selectedStatus === status.name ? 'bold' : 'normal',
                            transition: 'all 0.2s ease-in-out'
                        }}
                        clickable
                    />
                ))}
            </Stack>
        </Box>
    );
}
