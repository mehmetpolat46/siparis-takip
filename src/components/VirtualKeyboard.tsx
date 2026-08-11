/**
 * VirtualKeyboard — Dokunmatik POS Sanal Klavyesi
 * - Sağ alt köşede klavye ikonu
 * - İkona basınca tam ekran klavye açılır
 * - Türkçe karakter desteği (büyük/küçük harf, shift, caps lock)
 * - Sayısal tuş takımı ayrı satırda
 * - Aktif inputu dışarıdan setActiveInput ile bağla
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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

const VirtualKeyboard: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [shifted, setShifted] = useState(false);
  const [caps, setCaps] = useState(false);
  const activeElementRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const location = useLocation();

  const rows = (shifted || caps) ? ROWS_UPPER : ROWS_LOWER;

  useEffect(() => {
    const rememberFocusedInput = (event: FocusEvent) => {
      const target = event.target;
      if (
        (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) &&
        !target.readOnly &&
        !target.disabled &&
        target.type !== 'hidden'
      ) {
        activeElementRef.current = target;
      }
    };

    document.addEventListener('focusin', rememberFocusedInput);
    return () => {
      document.removeEventListener('focusin', rememberFocusedInput);
    };
  }, []);

  // Sayfa/panel değiştiğinde (ör. Getir → Yemek Sepeti) önceki sayfadan kalan,
  // artık DOM'da olmayan bir input referansına yazmaya çalışmayı engeller.
  // Kullanıcının yeni sayfada hedef kutuya tekrar dokunması gerekir.
  useEffect(() => {
    activeElementRef.current = null;
  }, [location.pathname]);

  const insertText = useCallback((value: string) => {
    const target = activeElementRef.current;

    // Referans hâlâ tutuluyor olsa bile artık sayfada değilse (rota değişmiş,
    // bileşen kaldırılmış vb.) sessizce hiçbir şey yazmamak yerine iptal et.
    if (!target || !target.isConnected || target.readOnly || target.disabled) {
      activeElementRef.current = null;
      return false;
    }

    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      // Kutu görsel olarak odağını kaybetmiş olsa bile (ör. dokunmatik ekranda
      // klavye tuşuna basarken tarayıcının varsayılan davranışı odağı kaydırmışsa)
      // yazmadan önce odağı son bilinen kutuya geri getir.
      if (document.activeElement !== target) {
        target.focus({ preventScroll: true });
      }
      const start = target.selectionStart ?? target.value.length;
      const end = target.selectionEnd ?? target.value.length;

      let nextValue = target.value;

      if (value === 'BACKSPACE') {
        if (start === end && start > 0) {
          nextValue = target.value.slice(0, start - 1) + target.value.slice(start);
          target.setSelectionRange(start - 1, start - 1);
        } else {
          nextValue = target.value.slice(0, start) + target.value.slice(end);
          target.setSelectionRange(start, start);
        }
      } else if (value === 'ENTER') {
        // ENTER tuşu — focus'u kaldır
        target.blur();
      } else if (value === ' ') {
        nextValue = `${target.value.slice(0, start)} ${target.value.slice(end)}`;
        target.setSelectionRange(start + 1, start + 1);
      } else {
        nextValue = `${target.value.slice(0, start)}${value}${target.value.slice(end)}`;
        target.setSelectionRange(start + value.length, start + value.length);
      }

      const valueSetter = Object.getOwnPropertyDescriptor(
        target instanceof HTMLInputElement
          ? HTMLInputElement.prototype
          : HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      valueSetter?.call(target, nextValue);
      target.focus({ preventScroll: true });
      target.dispatchEvent(new Event('input', { bubbles: true }));
      target.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    return false;
  }, []);

  const handleKey = useCallback((key: string) => {
    const isHandledByKeyboard = insertText(key);
    if (!isHandledByKeyboard) return;
    // Shift bir tuş basışında sıfırlanır (caps lock hariç)
    if (shifted && !caps) setShifted(false);
  }, [caps, insertText, shifted]);

  // Bazı eski/gömülü dokunmatik tarayıcılar (POS kiosk tarayıcıları) Pointer
  // Events'i tam desteklemeyebilir. Bu yüzden tuşlara hem onPointerDown hem de
  // onMouseDown bağlanır; onPointerDown zaten işlediyse onMouseDown'ın aynı
  // basışı tekrar işlemesi kısa bir zaman penceresiyle engellenir.
  const suppressMouseUntilRef = useRef(0);
  const bindPress = useCallback((action: () => void) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      suppressMouseUntilRef.current = Date.now() + 500;
      action();
    },
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      if (Date.now() < suppressMouseUntilRef.current) return;
      action();
    },
  }), []);

  const KEY_SX = {
    minWidth: { xs: 34, sm: 44 },
    minHeight: { xs: 42, sm: 56 },
    px: { xs: 0.5, sm: 1 },
    m: { xs: 0.2, sm: 0.3 },
    borderRadius: '12px',
    bgcolor: '#fff',
    border: '1px solid #dce6f2',
    color: '#1a1a1a',
    fontWeight: 700,
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none' as const,
    WebkitTapHighlightColor: 'transparent',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 3px 0 #cdd8e5, 0 6px 10px rgba(15,23,42,0.14)',
    transition: 'all 120ms cubic-bezier(0.4, 0, 0.2, 1)',
    flexShrink: 0,
    '&:active': {
      bgcolor: '#e3f2fd',
      transform: 'translateY(2px)',
      boxShadow: 'inset 0 1px 2px rgba(15,23,42,0.12), 0 1px 0 #cdd8e5',
    },
    '&:hover': {
      borderColor: '#1976d2',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 3px 0 #b7d2ed, 0 7px 13px rgba(15,23,42,0.16)',
    },
  };

  return (
    <>
      {/* ── Sağ alt klavye ikonu ── */}
      <Fab
        size="medium"
        aria-label={open ? 'Sanal klavyeyi kapat' : 'Sanal klavyeyi aç'}
        title={open ? 'Kapat' : 'Sanal Türkçe Klavye'}
        {...bindPress(() => setOpen((v) => !v))}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: (t) => t.zIndex.modal + 4,
          bgcolor: open ? '#1565c0' : '#fff',
          color: open ? '#fff' : '#1565c0',
          border: '1px solid rgba(21,101,192,0.22)',
          boxShadow: open ? '0 4px 0 #0d47a1, 0 10px 18px rgba(21,101,192,0.3)' : '0 4px 0 #c7d9ed, 0 10px 18px rgba(15,23,42,0.16)',
          transition: 'all 200ms ease-in-out',
          '&:hover': {
            bgcolor: open ? '#0d47a1' : '#eef7ff',
            boxShadow: '0 4px 0 #0d47a1, 0 13px 22px rgba(21,101,192,0.34)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
      >
        {open ? <KeyboardHideIcon /> : <KeyboardIcon />}
      </Fab>

      {/* ── Klavye paneli ── */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Box
          role="toolbar"
          aria-label="Sanal Türkçe Klavye"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: (t) => t.zIndex.modal + 3,
            bgcolor: '#f5f8fc',
            backgroundImage: 'linear-gradient(to bottom, #ffffff, #edf3fa)',
            borderTop: '3px solid #1976d2',
            boxShadow: '0 -12px 32px rgba(15,23,42,0.18)',
            px: 1,
            pt: 1,
            pb: 1.5,
            backdropFilter: 'blur(8px)',
            maxWidth: '100vw',
          }}
        >
          {/* Satırlar */}
          {rows.map((row, ri) => (
            <Box
              key={ri}
              sx={{
                display: 'flex',
                justifyContent: { xs: 'flex-start', md: 'center' },
                overflowX: { xs: 'auto', md: 'visible' },
                mb: 0.3,
              }}
            >
              {/* Shift (ilk satır hariç) */}
              {ri === 3 && (
                <Box
                  component="div"
                  {...bindPress(() => { if (caps) { setCaps(false); setShifted(false); } else { setShifted((v) => !v); } })}
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
                  {...bindPress(() => handleKey(key))}
                  sx={KEY_SX}
                >
                  {key}
                </Box>
              ))}

              {/* Backspace (son satır) */}
              {ri === 3 && (
                <Box
                  component="div"
                  {...bindPress(() => handleKey('BACKSPACE'))}
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
              {...bindPress(() => { setCaps((v) => !v); setShifted(false); })}
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
              {...bindPress(() => handleKey(' '))}
              sx={{ ...KEY_SX, flex: 1, maxWidth: 500, mx: 0.5 }}
            >
              <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>BOŞLUK</Typography>
            </Box>

            <Box
              component="div"
              {...bindPress(() => handleKey('ENTER'))}
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
