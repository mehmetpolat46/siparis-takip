import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import trLocale from 'date-fns/locale/tr';
import { format, parseISO } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import { PANELS, Panel } from '../../types/tracking';
import { useTracking } from '../../context/TrackingContext';
import ThreeDIcon from '../ThreeDIcon';

const DRAWER_WIDTH = 260;

const panelIcons: Record<Panel, React.ReactNode> = {
  getir: <ThreeDIcon size={30} color="#5D3EBC"><StorefrontIcon /></ThreeDIcon>,
  sepeti: <ThreeDIcon size={30} color="#FA0050"><ShoppingBasketIcon /></ThreeDIcon>,
  trendyol: <ThreeDIcon size={30} color="#F27A1A"><LocalMallIcon /></ThreeDIcon>,
  migros: <ThreeDIcon size={30} color="#E30613"><StorefrontIcon /></ThreeDIcon>,
  telefon: <ThreeDIcon size={30} color="#2E7D32"><PhoneInTalkIcon /></ThreeDIcon>,
};

const TrackingLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const { selectedDate, setSelectedDate, getWaitingCourierCount } = useTracking();
  const waitingCount = getWaitingCourierCount(selectedDate);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(format(date, 'yyyy-MM-dd'));
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const drawerContent = (
    <Box sx={{ pt: 1 }}>
      <Typography
        variant="subtitle1"
        sx={{ px: 2, py: 1.5, fontWeight: 700, color: 'primary.main' }}
      >
        Sipariş & Kurye Takip
      </Typography>

      <Typography variant="caption" sx={{ px: 2, color: 'text.secondary', display: 'block', mb: 1 }}>
        Paneller
      </Typography>
      <List dense disablePadding>
        {PANELS.map((panel) => (
          <ListItemButton
            key={panel.id}
            selected={isActive(`/tracking/panel/${panel.id}`)}
            onClick={() => {
              navigate(`/tracking/panel/${panel.id}`);
              setMobileOpen(false);
            }}
            sx={{
              mx: 1,
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: `${panel.bgColor}22`,
                borderLeft: `3px solid ${panel.bgColor}`,
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 42 }}>
              {panelIcons[panel.id]}
            </ListItemIcon>
            <ListItemText
              primary={panel.label}
              primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
            />
          </ListItemButton>
        ))}
      </List>

      <Typography
        variant="caption"
        sx={{ px: 2, color: 'text.secondary', display: 'block', mt: 2, mb: 1 }}
      >
        Takip
      </Typography>
      <List dense disablePadding>
        <ListItemButton
          selected={isActive('/tracking/siparis-takip')}
          onClick={() => {
            navigate('/tracking/siparis-takip');
            setMobileOpen(false);
          }}
          sx={{ mx: 1, borderRadius: 1, mb: 0.5 }}
        >
          <ListItemIcon sx={{ minWidth: 42 }}>
            <Badge badgeContent={waitingCount} color="error" max={99}>
              <ThreeDIcon size={30} color="#1976d2"><AssignmentIcon /></ThreeDIcon>
            </Badge>
          </ListItemIcon>
          <ListItemText
            primary="Sipariş Takip"
            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
          />
        </ListItemButton>
        <ListItemButton
          selected={isActive('/tracking/kurye-takip')}
          onClick={() => {
            navigate('/tracking/kurye-takip');
            setMobileOpen(false);
          }}
          sx={{ mx: 1, borderRadius: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 42 }}>
            <ThreeDIcon size={30} color="#0288d1"><TwoWheelerIcon /></ThreeDIcon>
          </ListItemIcon>
          <ListItemText
            primary="Kurye Takip"
            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
          />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="default"
        elevation={1}
        sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ gap: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' }, py: { xs: 1, sm: 0.5 } }}>
          {isMobile && (
            <IconButton edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <IconButton edge="start" onClick={() => navigate('/')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' }, minWidth: 0 }}>
            Sipariş & Kurye Takip
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
            <DatePicker
              label="Tarih"
              value={parseISO(selectedDate)}
              onChange={handleDateChange}
              slotProps={{
                textField: { size: 'small', sx: { width: { xs: 130, sm: 180 } } },
              }}
            />
          </LocalizationProvider>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            mt: '64px',
            height: 'calc(100% - 64px)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: '64px',
          ml: { md: `${DRAWER_WIDTH}px` },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          bgcolor: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default TrackingLayout;
