import React from 'react';
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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useTracking } from '../../context/TrackingContext';
import PanelBadge from '../../components/tracking/PanelBadge';
import PaymentBadge from '../../components/tracking/PaymentBadge';
import PaymentStatusButton from '../../components/tracking/PaymentStatusButton';
import { PlatformOrder } from '../../types/tracking';
import ThreeDIcon from '../../components/ThreeDIcon';

const OrderTrackingPage: React.FC = () => {
  const { getOrdersByDate, updateOrder, assignCourier, getActiveCouriers, selectedDate } =
    useTracking();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);
  const [selectedCourier, setSelectedCourier] = React.useState('');

  const allOrders = getOrdersByDate(selectedDate);
  const waiting = allOrders
    .filter((o) => o.kurye === null)
    .sort((a, b) => a.eklenmeZamani - b.eklenmeZamani);
  const assigned = allOrders
    .filter((o) => o.kurye !== null)
    .sort((a, b) => b.eklenmeZamani - a.eklenmeZamani);

  const couriers = getActiveCouriers();

  const handleToggleTeslim = (order: PlatformOrder) => {
    updateOrder(order.id, { teslimEdildiMi: !order.teslimEdildiMi });
  };

  const handleToggleUcret = (id: string) => {
    const order = allOrders.find((o) => o.id === id);
    if (order && order.odemeYontemi !== 'online') {
      updateOrder(id, { ucretAlindiMi: !order.ucretAlindiMi });
    }
  };

  const handleAssignToCourier = (orderId: string) => {
    const order = allOrders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrderId(orderId);
      setSelectedCourier(order.kurye || '');
      setDialogOpen(true);
    }
  };

  const handleConfirmAssign = () => {
    if (selectedOrderId && selectedCourier) {
      assignCourier(selectedOrderId, selectedCourier);
      setDialogOpen(false);
      setSelectedOrderId(null);
      setSelectedCourier('');
    }
  };

  const handleChangePaymentMethod = (orderId: string, newMethod: 'kart' | 'nakit' | 'online') => {
    updateOrder(orderId, { odemeYontemi: newMethod });
  };

  const formatTime = (ts: number) =>
    format(new Date(ts), 'HH:mm', { locale: tr });

  const renderAssignedRow = (order: PlatformOrder) => {
    const needsPayment =
      order.odemeYontemi !== 'online' && !order.ucretAlindiMi;
    return (
      <TableRow
        key={order.id}
        sx={{
          bgcolor: needsPayment && order.teslimEdildiMi ? '#FFEBEE' : undefined,
        }}
      >
        <TableCell>
          <PanelBadge panel={order.panel} />
        </TableCell>
        <TableCell>{formatTime(order.eklenmeZamani)}</TableCell>
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
        <TableCell>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={order.kurye ?? ''}
              onChange={(e) => assignCourier(order.id, e.target.value)}
            >
              {couriers.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
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
    );
  };

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
          bgcolor: '#eaf4ff',
          border: '1px solid #cfe7ff',
          borderRadius: '18px',
        }}
      >
        <ThreeDIcon color="#1976d2" size={48}>
          <AssignmentIcon />
        </ThreeDIcon>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.5rem' } }}>
            Sipariş Takip
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedDate} · Tüm panellerden gelen siparişler
          </Typography>
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Kurye Ata</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Kurye Seç</InputLabel>
            <Select
              value={selectedCourier}
              label="Kurye Seç"
              onChange={(e) => setSelectedCourier(e.target.value)}
            >
              {couriers.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>İptal</Button>
          <Button onClick={handleConfirmAssign} variant="contained" startIcon={<TwoWheelerIcon />}>
            Ata
          </Button>
        </DialogActions>
      </Dialog>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Kurye Bekliyor
          </Typography>
          <Chip label={waiting.length} color="warning" size="small" />
        </Box>
        {waiting.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            Kurye bekleyen sipariş yok.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Panel</TableCell>
                  <TableCell>Saat</TableCell>
                  <TableCell>Fiyat</TableCell>
                  <TableCell>Ekmek</TableCell>
                  <TableCell>Ödeme</TableCell>
                  <TableCell>İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {waiting.map((order) => (
                  <TableRow key={order.id} sx={{ bgcolor: '#FFF9C4' }}>
                    <TableCell>
                      <PanelBadge panel={order.panel} />
                    </TableCell>
                    <TableCell>{formatTime(order.eklenmeZamani)}</TableCell>
                    <TableCell>{order.fiyat.toFixed(2)} ₺</TableCell>
                    <TableCell>{order.ekmekSayisi}</TableCell>
                    <TableCell>
                      <PaymentBadge odemeYontemi={order.odemeYontemi} />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<TwoWheelerIcon />}
                        onClick={() => handleAssignToCourier(order.id)}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        Kurye Ata
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Kuryeye Atandı
          </Typography>
          <Chip label={assigned.length} color="primary" size="small" />
        </Box>
        {assigned.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            Atanmış sipariş yok.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Panel</TableCell>
                  <TableCell>Saat</TableCell>
                  <TableCell>Fiyat</TableCell>
                  <TableCell>Ekmek</TableCell>
                  <TableCell>Ödeme</TableCell>
                  <TableCell>Kurye</TableCell>
                  <TableCell align="center">Teslim</TableCell>
                  <TableCell>Ücret</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{assigned.map(renderAssignedRow)}</TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default OrderTrackingPage;
