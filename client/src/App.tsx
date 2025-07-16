import React from 'react';
import './App.css';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Logo from './assets/logo.png';

function App() {
  return (
    <header className='app-header bstyle'>
      <div className=" bstyle">
        <img src={Logo}
          className='logo' 
          alt="ClearTax" 
        />
      </div>
      <Stack spacing={2} direction="row">
        <Button variant="contained">Sign up</Button>
        <Button variant="outlined">Log in</Button>
      </Stack>
    </header>
  );
}

export default App;
