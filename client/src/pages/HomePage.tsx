import React, { useEffect, useState } from 'react';
import { Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import FaceIcon from '@mui/icons-material/Face';
import axios from 'axios';
import '../App.css';

function HomePage() {
  const [allContributions, setAllContributions] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [openProblems, setOpenProblems] = useState<any[]>([]); 
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    axios.get('/api/landingPage/contributions')
      .then(res => {
        setAllContributions(res.data);
      })
      .catch(err => console.error("Error fetching feed:", err));

    axios.get('/api/landingPage/pieChart')
      .then(res => {
        setPieData(res.data);
      })
      .catch(err => console.error("Error fetching pie chart data:", err));

    axios.get('/api/landingPage/openProblems')
      .then(res => {
        setOpenProblems(res.data);
      })
      .catch(err => console.error("Error fetching open problems:", err));
  }, []);

  useEffect(() => {
    if (allContributions.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % allContributions.length);
    }, 5000); 

    return () => clearInterval(interval);
  }, [allContributions]);

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
                Direct Democracy for the Modern Taxpayer. <br/> ClearTax bridges the gap between your wallet and your community. Allocate your tax funds directly to Infrastructure, Technology, or Transportation projects. Stop wondering where your money goes and start seeing the results of your choices in real-time.
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
                      <Avatar alt={item.username}>
                        <FaceIcon />
                      </Avatar>
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
                    data: pieData,
                  },
                ]}
                width={400}
                height={200}
              />
            </div>

            <div className="feature-box">
              <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
                Examine where you can help further.
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                <Table stickyHeader sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell>To Do</TableCell>
                      <TableCell align="right">Area of Investment</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {openProblems.map((problem, index) => (
                      <TableRow
                        key={index}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {problem.todo}
                        </TableCell>
                        <TableCell align="right">
                          {problem.areaOfInvestment}
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