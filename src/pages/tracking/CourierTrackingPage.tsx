import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  TextField,
  Button,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import { useTracking } from '../../context/TrackingContext';
import PanelBadge from '../../components/tracking/PanelBadge';
import PaymentStatusButton from '../../components/tracking/PaymentStatusButton';
import { PlatformOrder } from '../../types/tracking';
import ThreeDIcon from '../../components/ThreeDIcon';

const CourierTrackingPage: React.FC = () => {
  const {
    getOrdersByDate,
    updateOrder,
    couriers,
    addCourier,
    removeCourier,
    selectedDate,
  } = useTracking();

  const [filterCourier, setFilterCourier] = useState<string>('all');
  const [onlyUnpaid, setOnlyUnpaid] = useState(false);
  const [newCourierName, setNewCourierName] = useState('');
  const [courierError, setCourierError] = useState<string | null>(null);
  const [courierToDelete, setCourierToDelete] = useState<string | null>(null);

  const allOrders = getOrdersByDate(selectedDate).filter((o) => o.kurye !== null);

  let filteredOrders = allOrders;
  if (filterCourier !== 'all') {
    filteredOrders = filteredOrders.filter((o) => o.kurye === filterCourier);
  }
  if (onlyUnpaid) {
    filteredOrders = filteredOrders.filter(
      (o) => o.odemeYontemi !== 'online' && !o.ucretAlindiMi
    );
  }

  const handleToggleTeslim = (order: PlatformOrder) => {
    updateOrder(order.id, { teslimEdildiMi: !order.teslimEdildiMi });
  };

  const handleToggleUcret = (id: string) => {
    const order = allOrders.find((o) => o.id === id);
    if (order && order.odemeYontemi !== 'online') {
      updateOrder(id, { ucretAlindiMi: !order.ucretAlindiMi });
    }
  };

  const handleChangePaymentMethod = (orderId: string, newMethod: 'kart' | 'nakit' | 'online') => {
    updateOrder(orderId, { odemeYontemi: newMethod });
  };

  const handleAddCourier = () => {
    setCourierError(null);
    if (!newCourierName.trim()) {
      setCourierError('Kurye adı boş olamaz.');
      return;
    }
    const success = addCourier(newCourierName);
    if (!success) {
      setCourierError('Bu isimde bir kurye zaten mevcut.');
      return;
    }
    setNewCourierName('');
  };

  const getRowBg = (order: PlatformOrder): string | undefined => {
    if (
      order.kurye &&
      order.odemeYontemi !== 'online' &&
      !order.ucretAlindiMi
    ) {
      return '#FFEBEE';
    }
    return undefined;
  };

  const courierSummaries = couriers.map((name) => {
    const courierOrders = getOrdersByDate(selectedDate).filter((o) => o.kurye === name);
    const pendingPayment = courierOrders.filter(
      (o) => o.odemeYontemi !== 'online' && !o.ucretAlindiMi
    ).length;
    return { name, total: courierOrders.length, pendingPayment };
  });

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
          p: 2,
          mb: 3,
          bgcolor: '#e8f5ee',
          border: '1px solid #c7ead6',
          borderRadius: '18px',
        }}
      >
        <ThreeDIcon color="#2e7d32" size={48}>
          <TwoWheelerIcon />
        </ThreeDIcon>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.5rem' } }}>
            Kurye Takip
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedDate} · Teslimat ve tahsilat yönetimi
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Kurye Yönetimi
        </Typography>
        {courierError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCourierError(null)}>
            {courierError}
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {couriers.map((name) => (
            <Chip
              key={name}
              label={name}
              onDelete={() => setCourierToDelete(name)}
              deleteIcon={<DeleteIcon />}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <TextField
            label="Yeni Kurye Adı"
            size="small"
            value={newCourierName}
            onChange={(e) => setNewCourierName(e.target.value)}
            sx={{ flex: 1, maxWidth: 300 }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddCourier}>
            Ekle
          </Button>
        </Box>
      </Paper>

      <Dialog open={courierToDelete !== null} onClose={() => setCourierToDelete(null)}>
        <DialogTitle>Kuryeyi listeden çıkar</DialogTitle>
        <DialogContent>
          <Typography>
            {courierToDelete} adlı kuryeyi yeni atamalardan çıkarmak istiyor musunuz?
            Geçmiş sipariş kayıtları korunur.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCourierToDelete(null)} color="inherit">Vazgeç</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (courierToDelete) removeCourier(courierToDelete);
              setCourierToDelete(null);
            }}
          >
            Kuryeyi Çıkar
          </Button>
        </DialogActions>
      </Dialog>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Kurye Bazlı Özet
        </Typography>
        <Grid container spacing={2}>
          {courierSummaries.map((s) => (
            <Grid item xs={6} sm={4} md={3} key={s.name}>
              <Paper
                sx={{
                  p: 1.5,
                  textAlign: 'center',
                  borderLeft: s.pendingPayment > 0 ? '4px solid #d32f2f' : '4px solid #1976d2',
                }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  {s.name}
                </Typography>
                <Typography variant="body2">{s.total} paket</Typography>
                {s.pendingPayment > 0 && (
                  <Typography variant="caption" color="error" fontWeight={600}>
                    {s.pendingPayment} tahsilat bekliyor
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Kurye Filtresi</InputLabel>
            <Select
              value={filterCourier}
              label="Kurye Filtresi"
              onChange={(e) => setFilterCourier(e.target.value)}
            >
              <MenuItem value="all">Tüm Kuryeler</MenuItem>
              {couriers.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={onlyUnpaid}
                onChange={(e) => setOnlyUnpaid(e.target.checked)}
                color="error"
              />
            }
            label="Sadece ücreti alınmayanlar"
          />
        </Box>
      </Paper>

      {filteredOrders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">Gösterilecek sipariş yok.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>Kurye</TableCell>
                <TableCell>Panel</TableCell>
                <TableCell>Fiyat</TableCell>
                <TableCell>Ekmek</TableCell>
                <TableCell>Ödeme</TableCell>
                <TableCell align="center">Teslim</TableCell>
                <TableCell>Ücret</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} sx={{ bgcolor: getRowBg(order) }}>
                  <TableCell sx={{ fontWeight: 600 }}>{order.kurye}</TableCell>
                  <TableCell>
                    <PanelBadge panel={order.panel} />
                  </TableCell>
                  <TableCell>{order.fiyat.toFixed(2)} ₺</TableCell>
                  <TableCell>{order.ekmekSayisi}</TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <Select
                        value={order.odemeYontemi}
                        onChange={(e) => handleChangePaymentMethod(order.id, e.target.value as 'kart' | 'nakit' | 'online')}
                      >
                        <MenuItem value="kart">Kart</MenuItem>
                        <MenuItem value="nakit">Nakit</MenuItem>
                        <MenuItem value="online">Online</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={order.teslimEdildiMi}
                      onChange={() => handleToggleTeslim(order)}
                    />
                  </TableCell>
                  <TableCell>
                    <PaymentStatusButton order={order} onToggle={handleToggleUcret} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default CourierTrackingPage;
