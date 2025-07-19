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
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import FaceIcon from '@mui/icons-material/Face';

function createData(
  todo: string,
  areaOfInvestment: string
) {
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
    React.cloneElement(element, {
      key: value,
    }),
  );
}

function App() {
  const [dense] = React.useState(false);
  const [secondary] = React.useState(false);

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
      </main>
    </>
  );
}

export default App;
