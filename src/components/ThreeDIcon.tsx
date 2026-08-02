import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface ThreeDIconProps {
  children: React.ReactNode;
  color: string;
  size?: number;
  sx?: SxProps<Theme>;
}

const ThreeDIcon: React.FC<ThreeDIconProps> = ({ children, color, size = 64, sx }) => (
  <Box
    sx={{
      width: size,
      height: size,
      flex: '0 0 auto',
      display: 'grid',
      placeItems: 'center',
      position: 'relative',
      color: '#fff',
      borderRadius: `${Math.round(size * 0.3)}px`,
      background: `linear-gradient(145deg, rgba(255,255,255,0.46) 0%, ${color} 34%, ${color} 100%)`,
      boxShadow: `inset 2px 2px 3px rgba(255,255,255,0.46), inset -5px -6px 10px rgba(0,0,0,0.18), 0 10px 0 color-mix(in srgb, ${color} 72%, #000), 0 17px 22px rgba(16,24,40,0.23)`,
      transform: 'perspective(300px) rotateX(5deg) rotateY(-7deg)',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 7,
        left: 8,
        width: '54%',
        height: '20%',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.36)',
        filter: 'blur(1px)',
        transform: 'rotate(-24deg)',
      },
      '& > svg': {
        fontSize: Math.round(size * 0.48),
        position: 'relative',
        zIndex: 1,
        filter: 'drop-shadow(0 3px 2px rgba(0,0,0,0.25))',
      },
      ...sx,
    }}
  >
    {children}
  </Box>
);

export default ThreeDIcon;
