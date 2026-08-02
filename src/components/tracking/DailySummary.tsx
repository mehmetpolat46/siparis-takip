import React from 'react';
import { Paper, Typography, Grid } from '@mui/material';
import { PlatformOrder } from '../../types/tracking';

interface DailySummaryProps {
  orders: PlatformOrder[];
}

const DailySummary: React.FC<DailySummaryProps> = ({ orders }) => {
  const onlineTotal = orders
    .filter((o) => o.odemeYontemi === 'online')
    .reduce((sum, o) => sum + o.fiyat, 0);
  const kartTotal = orders
    .filter((o) => o.odemeYontemi === 'kart')
    .reduce((sum, o) => sum + o.fiyat, 0);
  const nakitTotal = orders
    .filter((o) => o.odemeYontemi === 'nakit')
    .reduce((sum, o) => sum + o.fiyat, 0);
  const ekmekTotal = orders.reduce((sum, o) => sum + o.ekmekSayisi, 0);
  const ciroTotal = onlineTotal + kartTotal + nakitTotal;

  const items = [
    { label: 'Toplam Online', value: `${onlineTotal.toFixed(2)} ₺`, color: '#6A1B9A' },
    { label: 'Toplam Kart', value: `${kartTotal.toFixed(2)} ₺`, color: '#1565C0' },
    { label: 'Toplam Nakit', value: `${nakitTotal.toFixed(2)} ₺`, color: '#2E7D32' },
    { label: 'Toplam Ekmek', value: `${ekmekTotal} adet`, color: '#795548' },
    { label: 'Toplam Ciro', value: `${ciroTotal.toFixed(2)} ₺`, color: '#E65100' },
  ];

  return (
    <Paper sx={{ p: 2, mt: 3, bgcolor: '#fafafa' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Gün Sonu Özeti
      </Typography>
      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid item xs={6} sm={4} md={2.4} key={item.label}>
            <Paper sx={{ p: 1.5, textAlign: 'center', borderLeft: `4px solid ${item.color}` }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {item.label}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: item.color }}>
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default DailySummary;
