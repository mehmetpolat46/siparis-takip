import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const WrapIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon viewBox="0 0 64 64" {...props}>
    <path
      d="M16 17c8-8 24-8 32 0l7 26c1 5-3 9-8 9H17c-5 0-9-4-8-9l7-26Z"
      fill="currentColor"
    />
    <path d="M19 22h26l4 17H15l4-17Z" fill="#F7C873" />
    <path d="M16 39h33l-2 8c-1 3-3 5-7 5H23c-4 0-6-2-7-5l-2-8Z" fill="#E9A85A" />
    <path d="M22 27h20" stroke="#5E9B48" strokeWidth="4" strokeLinecap="round" />
    <path d="M25 33h14" stroke="#D94B3D" strokeWidth="4" strokeLinecap="round" />
    <path d="M28 20v22M36 20v22" stroke="#B57A3C" strokeWidth="2" opacity=".55" />
  </SvgIcon>
);

export const PortionIcon: React.FC<SvgIconProps> = (props) => (
  <SvgIcon viewBox="0 0 64 64" {...props}>
    <ellipse cx="32" cy="43" rx="25" ry="12" fill="currentColor" />
    <ellipse cx="32" cy="39" rx="22" ry="9" fill="#F4F8FB" />
    <path d="M17 37c2-11 9-17 15-17s13 6 15 17H17Z" fill="#D18A3C" />
    <path d="M21 35c4-7 8-10 11-10s8 3 11 10H21Z" fill="#9A5A29" />
    <path d="M18 39h28" stroke="#55A75A" strokeWidth="4" strokeLinecap="round" />
    <circle cx="24" cy="32" r="3" fill="#D84C3F" />
    <circle cx="38" cy="31" r="3" fill="#D84C3F" />
  </SvgIcon>
);
