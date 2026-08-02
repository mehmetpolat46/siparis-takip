import React from 'react';
import { Chip } from '@mui/material';
import { Panel, getPanelConfig } from '../../types/tracking';

interface PanelBadgeProps {
  panel: Panel;
  size?: 'small' | 'medium';
}

const PanelBadge: React.FC<PanelBadgeProps> = ({ panel, size = 'small' }) => {
  const config = getPanelConfig(panel);
  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        bgcolor: config.bgColor,
        color: config.color,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.85rem',
      }}
    />
  );
};

export default PanelBadge;
