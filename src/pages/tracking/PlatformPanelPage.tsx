import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { Panel, getPanelConfig, PANELS } from '../../types/tracking';
import { useTracking } from '../../context/TrackingContext';
import OrderForm from '../../components/tracking/OrderForm';
import OrderTable from '../../components/tracking/OrderTable';
import DailySummary from '../../components/tracking/DailySummary';
import ThreeDIcon from '../../components/ThreeDIcon';

const isValidPanel = (id: string | undefined): id is Panel =>
  PANELS.some((p) => p.id === id);

const PlatformPanelPage: React.FC = () => {
  const { panelId } = useParams<{ panelId: string }>();
  const { getOrdersByPanel, updateOrder, deleteOrder, selectedDate } = useTracking();

  if (!isValidPanel(panelId)) {
    return <Navigate to="/tracking/panel/getir" replace />;
  }

  const config = getPanelConfig(panelId);
  const orders = getOrdersByPanel(panelId, selectedDate);

  const handleToggleTeslim = (id: string) => {
    const order = orders.find((o) => o.id === id);
    if (order) updateOrder(id, { teslimEdildiMi: !order.teslimEdildiMi });
  };

  const handleToggleUcret = (id: string) => {
    const order = orders.find((o) => o.id === id);
    if (order && order.odemeYontemi !== 'online') {
      updateOrder(id, { ucretAlindiMi: !order.ucretAlindiMi });
    }
  };

  const handleChangePaymentMethod = (id: string, method: 'kart' | 'nakit' | 'online') => {
    updateOrder(id, { odemeYontemi: method });
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
          p: { xs: 2, sm: 2.5 },
          background: `linear-gradient(135deg, ${config.bgColor} 0%, ${config.bgColor}cc 100%)`,
          color: config.color,
          borderRadius: '20px',
          boxShadow: `0 14px 28px ${config.bgColor}40`,
        }}
      >
        <ThreeDIcon color={config.bgColor} size={50}>
          <StorefrontIcon />
        </ThreeDIcon>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {config.label}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.25 }}>
            {selectedDate} · {orders.length} sipariş
          </Typography>
        </Box>
      </Box>

      <OrderForm panel={panelId} />

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        Sipariş Listesi
      </Typography>
      <OrderTable
        orders={orders}
        onToggleTeslim={handleToggleTeslim}
        onToggleUcret={handleToggleUcret}
        onChangePayment={handleChangePaymentMethod}
        onDelete={deleteOrder}
        highlightWaiting
      />

      <DailySummary orders={orders} />
    </Box>
  );
};

export default PlatformPanelPage;
