import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
    const [identifier, setIdentifier] = useState(''); // email or username
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/api/auth/login', {
                identifier: identifier,
                password: password
            }, { withCredentials: true });
            const { user, token } = response.data;

            login(user, token); 

            if (user.role_id === 1) {
                navigate('/regular-dashboard');
            } else if (user.role_id === 2) {
                navigate('/company-dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">Log In</Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <Typography color="error" variant="body2">{error}</Typography>}
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Log In</Button>
                </Box>
            </Box>
        </Container>
    );
}

export default LoginPage;
