/**
 * VirtualKeyboard — Dokunmatik POS Sanal Klavyesi
 * - Sağ alt köşede klavye ikonu
 * - İkona basınca tam ekran klavye açılır
 * - Türkçe karakter desteği (büyük/küçük harf, shift, caps lock)
 * - Sayısal tuş takımı ayrı satırda
 * - Aktif inputu dışarıdan setActiveInput ile bağla
 */

import React, { useState, useCallback } from 'react';
import { Box, Slide, Typography, Fab } from '@mui/material';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import KeyboardHideIcon from '@mui/icons-material/KeyboardHide';
import BackspaceIcon from '@mui/icons-material/Backspace';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

// ─── Tuş Satırları ────────────────────────────────────────────────────────────

const ROWS_LOWER = [
  ['1','2','3','4','5','6','7','8','9','0','-'],
  ['q','w','e','r','t','y','u','ı','o','p','ğ','ü'],
  ['a','s','d','f','g','h','j','k','l','ş','i'],
  ['z','x','c','v','b','n','m','ö','ç','.'],
];

const ROWS_UPPER = [
  ['1','2','3','4','5','6','7','8','9','0','-'],
  ['Q','W','E','R','T','Y','U','I','O','P','Ğ','Ü'],
  ['A','S','D','F','G','H','J','K','L','Ş','İ'],
  ['Z','X','C','V','B','N','M','Ö','Ç','.'],
];

// ─── Bileşen ──────────────────────────────────────────────────────────────────

interface VirtualKeyboardProps {
  /** Klavyenin yazacağı input setter — örn. setPhone, setAddress */
  onKey?: (key: string) => void;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ onKey }) => {
  const [open, setOpen] = useState(false);
  const [shifted, setShifted] = useState(false);
  const [caps, setCaps] = useState(false);

  const rows = (shifted || caps) ? ROWS_UPPER : ROWS_LOWER;

  const handleKey = useCallback((key: string) => {
    onKey?.(key);
    // Shift bir tuş basışında sıfırlanır (caps lock hariç)
    if (shifted && !caps) setShifted(false);
  }, [onKey, shifted, caps]);

  const KEY_SX = {
    minWidth: 44,
    minHeight: 50,
    px: 1,
    m: 0.3,
    borderRadius: 1.5,
    bgcolor: '#fff',
    border: '1.5px solid #bdbdbd',
    color: '#1a1a1a',
    fontWeight: 700,
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none' as const,
    WebkitTapHighlightColor: 'transparent',
    boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
    '&:active': { bgcolor: '#e3f2fd', transform: 'scale(0.96)' },
    transition: 'all 0.08s',
    flexShrink: 0,
  };

  return (
    <>
      {/* ── Sağ alt klavye ikonu ── */}
      <Fab
        size="medium"
        onPointerDown={(e) => { e.preventDefault(); setOpen((v) => !v); }}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1400,
          bgcolor: open ? '#1a237e' : '#fff',
          color: open ? '#fff' : '#1a237e',
          border: '2px solid #1a237e',
          boxShadow: 4,
          '&:hover': { bgcolor: open ? '#283593' : '#e8eaf6' },
        }}
      >
        {open ? <KeyboardHideIcon /> : <KeyboardIcon />}
      </Fab>

      {/* ── Klavye paneli ── */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1300,
            bgcolor: '#eceff1',
            borderTop: '2px solid #b0bec5',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.18)',
            px: 1,
            pt: 1,
            pb: 1.5,
          }}
        >
          {/* Satırlar */}
          {rows.map((row, ri) => (
            <Box key={ri} sx={{ display: 'flex', justifyContent: 'center', mb: 0.3 }}>
              {/* Shift (ilk satır hariç) */}
              {ri === 3 && (
                <Box
                  component="div"
                  onPointerDown={(e) => { e.preventDefault(); if (caps) { setCaps(false); setShifted(false); } else { setShifted((v) => !v); } }}
                  sx={{
                    ...KEY_SX,
                    minWidth: 66,
                    bgcolor: (shifted || caps) ? '#1a237e' : '#fff',
                    color: (shifted || caps) ? '#fff' : '#1a237e',
                    border: '1.5px solid #1a237e',
                    fontSize: '0.75rem',
                    mr: 0.5,
                  }}
                >
                  ⇧
                </Box>
              )}

              {row.map((key) => (
                <Box
                  key={key}
                  component="div"
                  onPointerDown={(e) => { e.preventDefault(); handleKey(key); }}
                  sx={KEY_SX}
                >
                  {key}
                </Box>
              ))}

              {/* Backspace (son satır) */}
              {ri === 3 && (
                <Box
                  component="div"
                  onPointerDown={(e) => { e.preventDefault(); handleKey('BACKSPACE'); }}
                  sx={{
                    ...KEY_SX,
                    minWidth: 66,
                    bgcolor: '#ffebee',
                    color: '#c62828',
                    border: '1.5px solid #c62828',
                    ml: 0.5,
                  }}
                >
                  <BackspaceIcon fontSize="small" />
                </Box>
              )}
            </Box>
          ))}

          {/* Alt satır: Caps Lock | Boşluk | Enter */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.3 }}>
            <Box
              component="div"
              onPointerDown={(e) => { e.preventDefault(); setCaps((v) => !v); setShifted(false); }}
              sx={{
                ...KEY_SX,
                minWidth: 80,
                bgcolor: caps ? '#f57f17' : '#fff',
                color: caps ? '#fff' : '#f57f17',
                border: '1.5px solid #f57f17',
                fontSize: '0.75rem',
              }}
            >
              CAPS
            </Box>

            <Box
              component="div"
              onPointerDown={(e) => { e.preventDefault(); handleKey(' '); }}
              sx={{ ...KEY_SX, flex: 1, maxWidth: 500, mx: 0.5 }}
            >
              <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>BOŞLUK</Typography>
            </Box>

            <Box
              component="div"
              onPointerDown={(e) => { e.preventDefault(); handleKey('ENTER'); }}
              sx={{
                ...KEY_SX,
                minWidth: 80,
                bgcolor: '#e8f5e9',
                color: '#2e7d32',
                border: '1.5px solid #2e7d32',
              }}
            >
              <KeyboardReturnIcon fontSize="small" />
            </Box>
          </Box>
        </Box>
      </Slide>
    </>
  );
};

export default VirtualKeyboard;
