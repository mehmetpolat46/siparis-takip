import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  useTheme,
  Chip,
  Grid,
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import DeleteIcon from '@mui/icons-material/Delete';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useOrders } from '../context/OrderContext';
import LocalDataBackup from './LocalDataBackup';
import ThreeDIcon from './ThreeDIcon';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { orders, deleteOrder } = useOrders();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleOrderType = (type: 'dine-in' | 'delivery') => {
    setTimeout(() => {
      navigate(`/order?type=${type}`);
    }, 200);
  };

  const handleDeleteLastOrder = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (orders.length === 0) return;
    const lastOrder = orders[orders.length - 1];
    deleteOrder(lastOrder.id);
    setConfirmOpen(false);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
  };

  const actionCardSx = {
    minHeight: { xs: 150, sm: 180 },
    p: { xs: 2, sm: 2.5 },
    borderRadius: '24px',
    justifyContent: 'flex-start',
    gap: 2,
    textAlign: 'left',
    overflow: 'hidden',
    position: 'relative',
    transition: 'transform 220ms ease, box-shadow 220ms ease',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 1,
      borderRadius: '23px',
      border: '1px solid rgba(255,255,255,0.35)',
      pointerEvents: 'none',
    },
    '&:hover': {
      transform: 'translateY(-6px) scale(1.015)',
      boxShadow: '0 18px 35px rgba(16,24,40,0.22)',
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.secondary.light}15 100%)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="sm">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 6 } }}>
          <Chip
            label="YEREL SİPARİŞ MERKEZİ"
            size="small"
            sx={{
              mb: 1.5,
              px: 0.5,
              fontWeight: 800,
              letterSpacing: 0.7,
              color: 'primary.dark',
              bgcolor: 'rgba(255,255,255,0.72)',
              border: '1px solid rgba(25,118,210,0.16)',
            }}
          />
          <Typography
            component="h1"
            variant="h1"
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.error.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 1,
              animation: 'shimmer 3s infinite',
              '@keyframes shimmer': {
                '0%': { backgroundPosition: '0% center' },
                '50%': { backgroundPosition: '100% center' },
                '100%': { backgroundPosition: '0% center' },
              },
            }}
          >
            USLU DÖNER
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.95rem', sm: '1.1rem' },
              fontWeight: 500,
            }}
          >
            Sipariş Yönetim Sistemi
          </Typography>
        </Box>

        {/* Main Action Buttons */}
        <Grid
          container
          spacing={2}
          sx={{ mb: { xs: 4, sm: 6 } }}
        >
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => handleOrderType('dine-in')}
              aria-label="İçeride sipariş oluştur"
              sx={{
                ...actionCardSx,
                background: 'linear-gradient(145deg, #ef5350 0%, #d32f2f 55%, #9f1d1d 100%)',
                color: '#fff',
              }}
            >
              <ThreeDIcon color="#a81818" size={62}>
                <RestaurantIcon />
              </ThreeDIcon>
              <Box>
                <Typography component="span" display="block" variant="h6" fontWeight={800}>
                  İçeride Sipariş
                </Typography>
                <Typography component="span" display="block" variant="body2" sx={{ opacity: 0.84, mt: 0.5 }}>
                  Masa ve paket siparişleri
                </Typography>
              </Box>
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => handleOrderType('delivery')}
              aria-label="Dışarı sipariş oluştur"
              sx={{
                ...actionCardSx,
                background: 'linear-gradient(145deg, #42a5f5 0%, #1976d2 55%, #0d47a1 100%)',
                color: '#fff',
              }}
            >
              <ThreeDIcon color="#0d47a1" size={62}>
                <DeliveryDiningIcon />
              </ThreeDIcon>
              <Box>
                <Typography component="span" display="block" variant="h6" fontWeight={800}>
                  Dışarıya Sipariş
                </Typography>
                <Typography component="span" display="block" variant="body2" sx={{ opacity: 0.84, mt: 0.5 }}>
                  Adres ve kurye siparişleri
                </Typography>
              </Box>
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/tracking')}
              aria-label="Sipariş takibine git"
              sx={{
                ...actionCardSx,
                minHeight: { xs: 122, sm: 132 },
                background: 'linear-gradient(135deg, #ffffff 0%, #edf7ff 100%)',
                color: 'info.dark',
                border: '1px solid rgba(2,136,209,0.22)',
                boxShadow: '0 8px 20px rgba(2,136,209,0.12)',
                '&:hover': {
                  ...actionCardSx['&:hover'],
                  background: 'linear-gradient(135deg, #ffffff 0%, #dff2ff 100%)',
                },
              }}
            >
              <ThreeDIcon color="#0288d1" size={58}>
                <TrackChangesIcon />
              </ThreeDIcon>
              <Box sx={{ flex: 1 }}>
                <Typography component="span" display="block" variant="h6" fontWeight={800}>
                  Sipariş & Kurye Takibi
                </Typography>
                <Typography component="span" display="block" variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Platform siparişlerini ve tahsilatları tek ekrandan yönetin
                </Typography>
              </Box>
            </Button>
          </Grid>
        </Grid>

        {/* Yönetim ve silme işlemleri */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                border: '1px solid rgba(25,118,210,0.22)',
                background: 'linear-gradient(135deg, #ffffff, #edf7ff)',
              }}
            >
              <CardContent sx={{ p: '16px !important' }}>
                <Button
                  fullWidth
                  startIcon={<DashboardIcon />}
                  variant="contained"
                  onClick={() => navigate('/admin')}
                  sx={{
                    py: 1.25,
                    justifyContent: 'flex-start',
                  }}
                >
                  Admin Paneli
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                border: '1px solid rgba(211,47,47,0.22)',
                background: 'linear-gradient(135deg, #ffffff, #fff2f2)',
              }}
            >
              <CardContent sx={{ p: '16px !important' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteLastOrder}
                  color="error"
                  disabled={orders.length === 0}
                  sx={{ py: 1.25, justifyContent: 'flex-start' }}
                >
                  Son Siparişi Sil
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            display="block"
            sx={{ mb: 0.5 }}
          >
            Veriler bu cihazda saklanır. Güncellemeden önce yedek alabilirsiniz.
          </Typography>
          <LocalDataBackup />
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={confirmOpen}
          onClose={handleCancelDelete}
          PaperProps={{
            sx: { borderRadius: '16px' },
          }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>
            Son Siparişi Sil
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ mt: 2 }}>
              Bu işlem geri alınamaz. Emin misiniz?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCancelDelete} variant="outlined">
              İptal
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="contained"
              color="error"
            >
              Sil
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default WelcomeScreen;
