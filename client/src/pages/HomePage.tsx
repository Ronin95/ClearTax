import React, { useEffect, useState } from 'react';
import { Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import FaceIcon from '@mui/icons-material/Face';
import '../App.css';

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

function HomePage() {
  const [allContributions, setAllContributions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 1. Fetch data from backend
  useEffect(() => {
    fetch('/api/contributions/recent')
      .then(res => res.json())
      .then(data => {
        console.log("Fetched Data:", data); // Check console to verify keys
        setAllContributions(data);
      })
      .catch(err => console.error("Error fetching feed:", err));
  }, []);

  // 2. Change interval to 5000ms (5 seconds)
  useEffect(() => {
    if (allContributions.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % allContributions.length);
    }, 5000); 

    return () => clearInterval(interval);
  }, [allContributions]);

  // 3. Logic to grab 3 items
  const visibleContributions = [
    allContributions[currentIndex],
    allContributions[(currentIndex + 1) % allContributions.length],
    allContributions[(currentIndex + 2) % allContributions.length],
  ].filter(Boolean);

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
              <List sx={{ height: '300px', overflow: 'hidden' }}>
                {visibleContributions.map((item, index) => (
                  <ListItem 
                    key={`${item.username}-${index}`}
                    sx={{ transition: 'all 0.5s ease' }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        alt={item.username}
                        src={item.imageUrl}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${item.username} supported ${item.category}`}
                      secondary={`Amount: €${item.amount}`}
                    />
                  </ListItem>
                ))}
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
      </section>
    </>
  );
}

export default HomePage;