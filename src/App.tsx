import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import WelcomeScreen from './components/WelcomeScreen';
import OrderScreen from './components/OrderScreen';
import AdminPanel from './components/AdminPanel';
import VirtualKeyboard from './components/VirtualKeyboard';
import HomeButton from './components/HomeButton';
import { OrderProvider } from './context/OrderContext';
import { TrackingProvider } from './context/TrackingContext';
import TrackingLayout from './components/tracking/TrackingLayout';
import PlatformPanelPage from './pages/tracking/PlatformPanelPage';
import OrderTrackingPage from './pages/tracking/OrderTrackingPage';
import CourierTrackingPage from './pages/tracking/CourierTrackingPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#ffa000',
      light: '#ffb74d',
      dark: '#f57f17',
      contrastText: '#000',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
      contrastText: '#fff',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#fff',
    },
    warning: {
      main: '#f57f17',
      light: '#fbc02d',
      dark: '#e65100',
      contrastText: '#000',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#bdbdbd',
    },
  },
  spacing: 8,
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: 'clamp(1.5rem, 5vw, 3rem)',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.35,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      textTransform: 'none',
      fontSize: '0.95rem',
      fontWeight: 600,
      letterSpacing: '0.3px',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
          padding: '10px 16px',
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
          },
        },
        sizeSmall: {
          padding: '6px 12px',
          fontSize: '0.875rem',
        },
        sizeLarge: {
          padding: '12px 24px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'all 200ms ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          backgroundImage: 'none',
          border: '1px solid rgba(15, 23, 42, 0.07)',
          boxShadow: '0 8px 24px rgba(15,23,42,0.07)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(115deg, #ffffff 0%, #f4f9ff 100%)',
          color: '#172033',
          borderBottom: '1px solid rgba(25,118,210,0.10)',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '72px !important',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 58,
          padding: '6px',
        },
        indicator: {
          display: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: '10px',
          fontWeight: 700,
          '&.Mui-selected': {
            color: '#1565c0',
            backgroundColor: '#eaf4ff',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 800,
          color: '#475467',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e4e7ec',
        },
        root: {
          borderBottom: '1px solid #eaecf0',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          backgroundColor: '#fff',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        'html, body, #root': {
          height: '100%',
          width: '100%',
        },
        html: {
          WebkitTextSizeAdjust: '100%',
          textSizeAdjust: '100%',
        },
        body: {
          overflowX: 'hidden',
          WebkitTapHighlightColor: 'transparent',
          overscrollBehaviorY: 'contain',
        },
        '*': {
          boxSizing: 'border-box',
        },
        // Dokunmatik yazarkasa ekranlarında yanlışlıkla metin seçimini engelle
        'button, [role="button"]': {
          WebkitUserSelect: 'none',
          userSelect: 'none',
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <OrderProvider>
        <TrackingProvider>
          <Router>
            <HomeButton />
            <VirtualKeyboard />
            <Routes>
              <Route path="/" element={<WelcomeScreen />} />
              <Route path="/order" element={<OrderScreen />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/tracking" element={<TrackingLayout />}>
                <Route index element={<Navigate to="panel/getir" replace />} />
                <Route path="panel/:panelId" element={<PlatformPanelPage />} />
                <Route path="siparis-takip" element={<OrderTrackingPage />} />
                <Route path="kurye-takip" element={<CourierTrackingPage />} />
              </Route>
            </Routes>
          </Router>
        </TrackingProvider>
      </OrderProvider>
    </ThemeProvider>
  );
}

export default App; 