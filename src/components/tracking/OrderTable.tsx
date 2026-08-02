import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Typography,
  IconButton,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  useTheme,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { PlatformOrder, OdemeYontemi } from '../../types/tracking';
import PaymentBadge from './PaymentBadge';
import PaymentStatusButton from './PaymentStatusButton';

interface OrderTableProps {
  orders: PlatformOrder[];
  onToggleTeslim: (id: string) => void;
  onToggleUcret: (id: string) => void;
  onChangePayment?: (id: string, method: OdemeYontemi) => void;
  onDelete?: (id: string) => void;
  showPanel?: boolean;
  highlightWaiting?: boolean;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onToggleTeslim,
  onToggleUcret,
  onChangePayment,
  onDelete,
  showPanel = false,
  highlightWaiting = false,
}) => {
  const theme = useTheme();
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: '16px',
          backgroundColor: theme.palette.background.paper,
          backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.light}05 0%, ${theme.palette.secondary.light}05 100%)`,
        }}
      >
        <Typography
          color="text.secondary"
          sx={{ fontSize: '1.1rem', fontWeight: 500 }}
        >
          📋 Bu tarihte sipariş bulunmuyor.
        </Typography>
      </Paper>
    );
  }

  const getRowBg = (order: PlatformOrder): string => {
    if (highlightWaiting && order.kurye === null) {
      return theme.palette.warning.light + '40';
    }
    if (
      order.kurye &&
      order.odemeYontemi !== 'online' &&
      !order.ucretAlindiMi
    ) {
      return theme.palette.error.light + '30';
    }
    return 'transparent';
  };

  const paymentEmoji: Record<OdemeYontemi, string> = {
    kart: '💳',
    nakit: '💵',
    online: '💻',
  };

  return (
    <>
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: theme.shadows[2],
      }}
    >
      <Table size="small" sx={{ borderCollapse: 'collapse' }}>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: theme.palette.primary.main,
              '& th': {
                backgroundColor: `${theme.palette.primary.main} !important`,
                color: '#fff !important',
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '12px 8px',
              },
            }}
          >
            {showPanel && <TableCell>Panel</TableCell>}
            <TableCell align="right">Fiyat</TableCell>
            <TableCell align="center">Ekmek</TableCell>
            <TableCell align="center">Ödeme</TableCell>
            <TableCell>Kurye</TableCell>
            <TableCell align="center">✓ Teslim</TableCell>
            <TableCell align="center">💰 Ücret</TableCell>
            {onDelete && <TableCell align="center">İşlem</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order, idx) => (
            <TableRow
              key={order.id}
              sx={{
                backgroundColor: getRowBg(order),
                transition: 'background-color 200ms ease, box-shadow 200ms ease',
                '&:hover': {
                  backgroundColor: getRowBg(order) || theme.palette.action.hover,
                  boxShadow: `inset 4px 0 0 ${theme.palette.primary.main}`,
                },
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              {showPanel && (
                <TableCell sx={{ fontWeight: 600, minWidth: '80px' }}>
                  <Chip
                    label={order.panel}
                    size="small"
                    variant="filled"
                    sx={{
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  />
                </TableCell>
              )}
              <TableCell align="right" sx={{ fontWeight: 600, minWidth: '60px' }}>
                {order.fiyat.toFixed(2)} ₺
              </TableCell>
              <TableCell align="center" sx={{ minWidth: '50px' }}>
                <Chip
                  label={`${order.ekmekSayisi} 🍞`}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>
              <TableCell align="center" sx={{ minWidth: '70px' }}>
                {onChangePayment ? (
                  <FormControl size="small" sx={{ minWidth: 110 }}>
                    <Select
                      value={order.odemeYontemi}
                      onChange={(e) =>
                        onChangePayment(order.id, e.target.value as OdemeYontemi)
                      }
                      sx={{
                        fontSize: '0.85rem',
                        borderRadius: '6px',
                        '& .MuiSelect-select': {
                          py: 0.5,
                        },
                      }}
                    >
                      <MenuItem value="kart">💳 Kart</MenuItem>
                      <MenuItem value="nakit">💵 Nakit</MenuItem>
                      <MenuItem value="online">💻 Online</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span>{paymentEmoji[order.odemeYontemi]}</span>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {order.odemeYontemi === 'kart'
                        ? 'Kart'
                        : order.odemeYontemi === 'nakit'
                        ? 'Nakit'
                        : 'Online'}
                    </Typography>
                  </Box>
                )}
              </TableCell>
              <TableCell sx={{ minWidth: '100px' }}>
                {order.kurye ? (
                  <Chip
                    label={`🚚 ${order.kurye}`}
                    size="small"
                    color="primary"
                    variant="filled"
                    sx={{ fontWeight: 600 }}
                  />
                ) : (
                  <Chip
                    label="⏳ Bekliyor"
                    size="small"
                    color="warning"
                    variant="filled"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </TableCell>
              <TableCell align="center">
                <Tooltip
                  title={order.teslimEdildiMi ? 'Teslim edildi' : 'Teslim et'}
                >
                  <Checkbox
                    checked={order.teslimEdildiMi}
                    onChange={() => onToggleTeslim(order.id)}
                    color="success"
                    sx={{ cursor: 'pointer' }}
                  />
                </Tooltip>
              </TableCell>
              <TableCell align="center">
                <PaymentStatusButton order={order} onToggle={onToggleUcret} />
              </TableCell>
              {onDelete && (
                <TableCell align="center">
                  <Tooltip title="Siparişi sil">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setOrderToDelete(order.id)}
                      sx={{
                        '&:hover': {
                          backgroundColor: theme.palette.error.light + '30',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
      <Dialog open={orderToDelete !== null} onClose={() => setOrderToDelete(null)}>
        <DialogTitle>Siparişi sil</DialogTitle>
        <DialogContent>
          Bu siparişi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderToDelete(null)} color="inherit">Vazgeç</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (orderToDelete && onDelete) onDelete(orderToDelete);
              setOrderToDelete(null);
            }}
          >
            Siparişi Sil
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderTable;
