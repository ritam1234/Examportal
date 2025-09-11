// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import date picker localization
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'; // Or AdapterDateFns, etc.
import dayjs from 'dayjs'; // Make sure dayjs is installed

import App from './App';
import { AuthProvider } from './context/AuthContext';
import {theme} from './theme';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={dayjs.locale()}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <BrowserRouter>
            <CssBaseline />
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </LocalizationProvider>
  </React.StrictMode>
);