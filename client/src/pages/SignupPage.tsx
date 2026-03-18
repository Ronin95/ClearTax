import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Typography, Container, Box, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

function SignupPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roleId, setRoleId] = useState(1);
    const [companyName, setCompanyName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/register', {
                username, email, password, role_id: roleId, company_name: roleId === 2 ? companyName : null
            });

            const { user, token } = response.data;
            login(user, token); // This now matches

            navigate(user.role_id === 1 ? '/regular-dashboard' : '/company-dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h5">Create ClearTax Account</Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField margin="normal" required fullWidth label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <TextField margin="normal" required fullWidth label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <TextField margin="normal" required fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    
                    <FormControl component="fieldset" sx={{ mt: 2 }}>
                        <FormLabel>Register as:</FormLabel>
                        <RadioGroup row value={roleId} onChange={(e) => setRoleId(parseInt(e.target.value))}>
                            <FormControlLabel value={1} control={<Radio />} label="Regular Taxpayer" />
                            <FormControlLabel value={2} control={<Radio />} label="Company" />
                        </RadioGroup>
                    </FormControl>

                    {roleId === 2 && (
                        <TextField margin="normal" required fullWidth label="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    )}

                    {error && <Typography color="error">{error}</Typography>}
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>Sign Up</Button>
                </Box>
            </Box>
        </Container>
    );
}

export default SignupPage;
