import { Container, Typography } from "@mui/material";

export default function RegularDashboard() {
    return (
        <Container sx={{ py: 8 }}>
            <Typography variant="h4">Taxpayer Dashboard</Typography>
            <Typography>Here you can track your tax allocations and vote on community projects.</Typography>
        </Container>
    );
}
