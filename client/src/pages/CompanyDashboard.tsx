import { Container, Typography } from "@mui/material";

export default function CompanyDashboard() {
    return (
        <Container sx={{ py: 8 }}>
            <Typography variant="h4">Company Provider Dashboard</Typography>
            <Typography>View open community problems and submit proposals for infrastructure or technology solutions.</Typography>
        </Container>
    );
}