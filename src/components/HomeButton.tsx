import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Fab, Tooltip, useTheme } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

const HomeButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // Anasayfa sayfasında buton gösterme
  if (location.pathname === '/') {
    return null;
  }

  return (
    <Tooltip title="Ana sayfaya dön" placement="right">
      <Fab
        color="primary"
        aria-label="Ana sayfaya dön"
        onClick={() => navigate('/')}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          left: { xs: 16, sm: 24 },
          zIndex: (t) => t.zIndex.modal + 2,
          background: `linear-gradient(145deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
          border: '1px solid rgba(255,255,255,0.55)',
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.45), 0 5px 0 ${theme.palette.primary.dark}, 0 11px 20px rgba(21,101,192,0.28)`,
          transition: 'all 200ms ease-in-out',
          '&:hover': {
            background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.45), 0 5px 0 ${theme.palette.primary.dark}, 0 14px 24px rgba(21,101,192,0.34)`,
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(3px)',
            boxShadow: `0 2px 0 ${theme.palette.primary.dark}, 0 5px 10px rgba(21,101,192,0.24)`,
          },
        }}
      >
        <HomeIcon />
      </Fab>
    </Tooltip>
  );
};

export default HomeButton;
