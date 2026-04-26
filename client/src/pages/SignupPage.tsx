import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Typography, Container, Box, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

function SignupPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [taxNumber, setTaxNumber] = useState('');
    const [roleId, setRoleId] = useState(1);
    const [companyName, setCompanyName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:3001/api/auth/register', {
                username,
                email,
                password,
                tax_number: taxNumber, // Make sure this state matches your input
                role_id: roleId,       // Use the state from your Radio buttons
                company_name: roleId === 2 ? companyName : null
            }, { withCredentials: true });

            const { user, token } = response.data;

            // 1. Update Auth State
            login(user, token);

            // 2. Fix Navigation: Route based on role_id
            if (user.role_id === 1) {
                navigate('/regular-dashboard');
            } else if (user.role_id === 2) {
                navigate('/company-dashboard');
            }

        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h5">Create ClearTax Account</Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField 
                        margin="normal" required fullWidth label="Username" 
                        value={username} onChange={(e) => setUsername(e.target.value)} 
                    />
                    <TextField 
                        margin="normal" required fullWidth label="Email Address" 
                        value={email} onChange={(e) => setEmail(e.target.value)} 
                    />
                    
                    <TextField 
                        margin="normal" 
                        required 
                        fullWidth 
                        label="Tax Number (9 digits)" 
                        value={taxNumber} 
                        onChange={(e) => setTaxNumber(e.target.value)}
                        slotProps={{
                            htmlInput: { 
                                maxLength: 9,
                                type: 'text',
                                inputMode: 'numeric',
                            }
                        }}
                        placeholder="e.g. 012345678"
                        helperText="Used for identity verification"
                    />

                    <TextField 
                        margin="normal" required fullWidth label="Password" type="password" 
                        value={password} onChange={(e) => setPassword(e.target.value)} 
                    />
                    
                    <FormControl component="fieldset" sx={{ mt: 2 }}>
                        <FormLabel>Register as:</FormLabel>
                        <RadioGroup row value={roleId} onChange={(e) => setRoleId(parseInt(e.target.value))}>
                            <FormControlLabel value={1} control={<Radio />} label="Regular Taxpayer" />
                            <FormControlLabel value={2} control={<Radio />} label="Company" />
                        </RadioGroup>
                    </FormControl>

                    {roleId === 2 && (
                        <TextField 
                            margin="normal" required fullWidth label="Company Name" 
                            value={companyName} onChange={(e) => setCompanyName(e.target.value)} 
                        />
                    )}

                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}
                    
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                        Sign Up
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default SignupPage;
