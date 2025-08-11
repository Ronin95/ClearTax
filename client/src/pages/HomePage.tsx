// client/src/pages/HomePage.tsx

import React from 'react';
import { Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import FaceIcon from '@mui/icons-material/Face';
import '../App.css';

// Helper functions specific to this page
function createData(todo: string, areaOfInvestment: string) {
  return { todo, areaOfInvestment };
}

const rows = [
  createData('Pothole has to be filled.', 'Infrastructure'),
  createData('Invest in chinese high-speed trains and bring them to Austria.', 'Technology'),
  createData('We need more busses passing through in this village.', 'Transportation'),
  createData('Replace broken swings and slides at Stadtpark Kinder playground', 'Infrastructure'),
  createData('Build covered bike lanes connecting Linz suburbs to downtown', 'Transportation'),
];

function generate(element: React.ReactElement<unknown>) {
  return [0, 1, 2].map((value) =>
    React.cloneElement(element, { key: value })
  );
}

// The component for your home page content
function HomePage() {
  const [dense] = React.useState(false);
  const [secondary] = React.useState(false);

  // Note: The <header> is no longer here. It's in the main App.tsx layout.
  return (
    <>
      <section className="hero-image">
        <Stack spacing={2} direction="column">
            <Typography className="hero-title" variant="h2" gutterBottom>
                Welcome to ClearTax
            </Typography>
            <Typography className="hero-subtitle" variant="h3" gutterBottom>
                ClearTax gives you control over how your tax money helps society. 
                Don't rely on politicians to represent your interests - it's your money, 
                you should decide how it's used and benefit society through your own actions!
            </Typography>
        </Stack>
      </section>

      <section className="features-container">
        <Stack spacing={2} direction="row">
            <div className="feature-box">
              <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
                Live List displaying how people are using their taxes.
              </Typography>
              <List dense={dense}>
              {generate(
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <FaceIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="has supported"
                    secondary={secondary ? 'Secondary text' : null}
                  />
                </ListItem>,
              )}
            </List>
            </div>
            
            <div className="feature-box">
              <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
                What aspects have citizens supported the most.
              </Typography>
              <PieChart
                series={[
                  {
                    data: [
                      { id: 0, value: 10, label: 'Infrastructure' },
                      { id: 1, value: 15, label: 'Technology' },
                      { id: 2, value: 20, label: 'Transportation' },
                    ],
                  },
                ]}
                width={200}
                height={200}
              />
            </div>

            <div className="feature-box">
              <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
                Examine where you can help further.
              </Typography>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell>To Do</TableCell>
                      <TableCell align="right">Area of Investment</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow
                        key={row.todo}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {row.todo}
                        </TableCell>
                        <TableCell align="right">
                          {row.areaOfInvestment}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
        </Stack>
      </section>

      <section className='reviews'>
        <Avatar>H</Avatar>
        <Stack spacing={2} direction="column">
            <Typography className="hero-title" variant="h2" gutterBottom>
                Welcome to ClearTax
            </Typography>
            <Typography className="hero-subtitle" variant="h3" gutterBottom>
                ClearTax gives you control over how your tax money helps society. 
                Don't rely on politicians to represent your interests - it's your money, 
                you should decide how it's used and benefit society through your own actions!
            </Typography>
        </Stack>
      </section>
    </>
  );
}

export default HomePage;
