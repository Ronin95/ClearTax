import React from 'react';
import './App.css';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Logo from './assets/logo.png';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { PieChart } from '@mui/x-charts/PieChart';

function createData(
  name: string,
  calories: number,
  fat: number,
  carbs: number,
  protein: number,
) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

function App() {
  return (
    <>
      <header className='app-header'>
        <div>
          <img src={Logo}
            className='logo'
            alt="ClearTax" />
        </div>
        <Stack spacing={2} direction="row">
          <Button variant="contained">Sign up</Button>
          <Button variant="outlined">Log in</Button>
        </Stack>
      </header>
      <main>
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
              <p>Live Table displaying how people are using their taxes.</p>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Dessert (100g serving)</TableCell>
                      <TableCell align="right">Calories</TableCell>
                      <TableCell align="right">Fat&nbsp;(g)</TableCell>
                      <TableCell align="right">Carbs&nbsp;(g)</TableCell>
                      <TableCell align="right">Protein&nbsp;(g)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow
                        key={row.name}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {row.name}
                        </TableCell>
                        <TableCell align="right">{row.calories}</TableCell>
                        <TableCell align="right">{row.fat}</TableCell>
                        <TableCell align="right">{row.carbs}</TableCell>
                        <TableCell align="right">{row.protein}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            
            <div className="feature-box">
              <p>What aspects have citizens supported the most.</p>
              <PieChart
                series={[
                  {
                    data: [
                      { id: 0, value: 10, label: 'Infrastructure' },
                      { id: 1, value: 15, label: 'Education' },
                      { id: 2, value: 20, label: 'Healthcare' },
                    ],
                  },
                ]}
                width={200}
                height={200}
              />
            </div>

            <div className="feature-box">
              <p>Examine where you can help further.</p>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Dessert (100g serving)</TableCell>
                      <TableCell align="right">Calories</TableCell>
                      <TableCell align="right">Fat&nbsp;(g)</TableCell>
                      <TableCell align="right">Carbs&nbsp;(g)</TableCell>
                      <TableCell align="right">Protein&nbsp;(g)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow
                        key={row.name}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {row.name}
                        </TableCell>
                        <TableCell align="right">{row.calories}</TableCell>
                        <TableCell align="right">{row.fat}</TableCell>
                        <TableCell align="right">{row.carbs}</TableCell>
                        <TableCell align="right">{row.protein}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Stack>
        </section>
      </main>
    </>
  );
}

export default App;
