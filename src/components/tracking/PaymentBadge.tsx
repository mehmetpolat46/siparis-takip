import React from 'react';
import { Chip } from '@mui/material';
import { OdemeYontemi, ODEME_LABELS, ODEME_COLORS } from '../../types/tracking';

interface PaymentBadgeProps {
  odemeYontemi: OdemeYontemi;
  size?: 'small' | 'medium';
}

const PaymentBadge: React.FC<PaymentBadgeProps> = ({ odemeYontemi, size = 'small' }) => (
  <Chip
    label={ODEME_LABELS[odemeYontemi]}
    size={size}
    sx={{
      bgcolor: ODEME_COLORS[odemeYontemi],
      color: '#fff',
      fontWeight: 600,
      fontSize: size === 'small' ? '0.75rem' : '0.85rem',
    }}
  />
);

export default PaymentBadge;
