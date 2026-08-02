import React from 'react';
import { Button } from '@mui/material';
import { PlatformOrder } from '../../types/tracking';

interface PaymentStatusButtonProps {
  order: PlatformOrder;
  onToggle: (id: string) => void;
  size?: 'small' | 'medium';
}

const PaymentStatusButton: React.FC<PaymentStatusButtonProps> = ({
  order,
  onToggle,
  size = 'small',
}) => {
  if (order.odemeYontemi === 'online') {
    return (
      <Button size={size} disabled variant="outlined" sx={{ color: 'text.disabled' }}>
        Gerek yok
      </Button>
    );
  }

  const isKart = order.odemeYontemi === 'kart';
  const label = order.ucretAlindiMi
    ? isKart
      ? 'Fiş Alındı ✓'
      : 'Para Alındı ✓'
    : isKart
      ? 'Fiş Alındı'
      : 'Para Alındı';

  return (
    <Button
      size={size}
      variant={order.ucretAlindiMi ? 'contained' : 'outlined'}
      color={order.ucretAlindiMi ? 'success' : 'warning'}
      onClick={() => onToggle(order.id)}
    >
      {label}
    </Button>
  );
};

export default PaymentStatusButton;
