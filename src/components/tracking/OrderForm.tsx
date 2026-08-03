import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Box,
  FormHelperText,
  useTheme,
  Collapse,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import { Panel, OdemeYontemi } from '../../types/tracking';
import { useTracking } from '../../context/TrackingContext';
import ThreeDIcon from '../ThreeDIcon';
import { WrapIcon } from '../FoodIllustrations';

interface OrderFormProps {
  panel: Panel;
}

const OrderForm: React.FC<OrderFormProps> = ({ panel }) => {
  const theme = useTheme();
  const { addOrder, getActiveCouriers, selectedDate, formState, setFormState, resetFormState } = useTracking();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const couriers = getActiveCouriers();

  const updateTextField = (field: 'fiyat' | 'ekmekSayisi', value: string) => {
    setFormState({ ...formState, [field]: value });
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: '' });
    }
  };

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!formState.fiyat.trim()) {
      errors.fiyat = 'Fiyat alanı zorunludur.';
    } else {
      const fiyat = parseFloat(formState.fiyat.replace(',', '.'));
      if (isNaN(fiyat) || fiyat <= 0) {
        errors.fiyat = 'Geçerli bir fiyat giriniz.';
      }
    }

    if (!formState.ekmekSayisi.trim()) {
      errors.ekmekSayisi = 'Ekmek sayısı zorunludur.';
    } else {
      const ekmek = parseInt(formState.ekmekSayisi, 10);
      if (isNaN(ekmek) || ekmek < 0) {
        errors.ekmekSayisi = 'Geçerli bir ekmek sayısı giriniz.';
      }
    }

    if (!formState.odemeYontemi) {
      errors.odemeYontemi = 'Ödeme yöntemi seçiniz.';
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    const errors = validate();
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Lütfen tüm zorunlu alanları doldurunuz.');
      return;
    }

    setFieldErrors({});
    setError(null);
    
    addOrder({
      panel,
      fiyat: parseFloat(formState.fiyat.replace(',', '.')),
      ekmekSayisi: parseInt(formState.ekmekSayisi, 10),
      odemeYontemi: formState.odemeYontemi as OdemeYontemi,
      kurye: formState.kurye || null,
      tarih: selectedDate,
    });
    
    resetFormState();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 3,
        borderRadius: '20px',
        backgroundColor: theme.palette.background.paper,
        backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.light}05 0%, ${theme.palette.secondary.light}05 100%)`,
        borderTop: `4px solid ${theme.palette.primary.main}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5 }}>
        <ThreeDIcon color="#1976d2" size={44}>
          <AddIcon />
        </ThreeDIcon>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.primary.dark }}>
            Yeni Sipariş Ekle
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Bilgileri girin, kurye atamasını isterseniz daha sonra yapın.
          </Typography>
        </Box>
      </Box>

      <Collapse in={!!error} sx={{ mb: 2 }}>
        <Alert
          severity="error"
          onClose={() => setError(null)}
          icon={<ErrorIcon />}
          sx={{ borderRadius: '12px', mb: 2 }}
        >
          {error}
        </Alert>
      </Collapse>

      <Collapse in={success} sx={{ mb: 2 }}>
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{ borderRadius: '12px', mb: 2 }}
        >
          ✓ Sipariş başarıyla eklendi.
        </Alert>
      </Collapse>

      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-end">
          {/* Fiyat */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Fiyat (₺)"
              fullWidth
              value={formState.fiyat}
              onChange={(e) => updateTextField('fiyat', e.target.value)}
              onInput={(e) => updateTextField('fiyat', (e.target as HTMLInputElement).value)}
              onFocus={() => setError(null)}
              inputProps={{ inputMode: 'decimal', pattern: '[0-9.,-]*' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoneyIcon color="primary" fontSize="small" />
                  </InputAdornment>
                ),
              }}
              error={!!fieldErrors.fiyat}
              helperText={fieldErrors.fiyat}
              variant="outlined"
              size="small"
              placeholder="0.00"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: theme.palette.background.paper,
                },
              }}
            />
          </Grid>

          {/* Ekmek Sayısı */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Ekmek Sayısı"
              fullWidth
              value={formState.ekmekSayisi}
              onChange={(e) => updateTextField('ekmekSayisi', e.target.value)}
              onInput={(e) => updateTextField('ekmekSayisi', (e.target as HTMLInputElement).value)}
              onFocus={() => setError(null)}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WrapIcon color="warning" fontSize="small" />
                  </InputAdornment>
                ),
              }}
              error={!!fieldErrors.ekmekSayisi}
              helperText={fieldErrors.ekmekSayisi}
              variant="outlined"
              size="small"
              placeholder="0"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: theme.palette.background.paper,
                },
              }}
            />
          </Grid>

          {/* Ödeme Yöntemi */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl
              fullWidth
              error={!!fieldErrors.odemeYontemi}
              size="small"
            >
              <InputLabel
                sx={{
                  '&.MuiInputLabel-shrink': {
                    color: theme.palette.primary.main,
                  },
                }}
              >
                Ödeme Yöntemi
              </InputLabel>
              <Select
                value={formState.odemeYontemi}
                label="Ödeme Yöntemi"
                onChange={(e) => {
                  setFormState({ ...formState, odemeYontemi: e.target.value });
                  if (fieldErrors.odemeYontemi) {
                    setFieldErrors({ ...fieldErrors, odemeYontemi: '' });
                  }
                }}
                onFocus={() => setError(null)}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <MenuItem value="kart">💳 Kart</MenuItem>
                <MenuItem value="nakit">💵 Nakit</MenuItem>
                <MenuItem value="online">🌐 Online</MenuItem>
              </Select>
              {fieldErrors.odemeYontemi && (
                <FormHelperText>{fieldErrors.odemeYontemi}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Kurye */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Kurye (Opsiyonel)</InputLabel>
              <Select
                value={formState.kurye}
                label="Kurye (Opsiyonel)"
                onChange={(e) => setFormState({ ...formState, kurye: e.target.value })}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <MenuItem value="">
                  <em>Henüz atanmadı</em>
                </MenuItem>
                {couriers.map((c) => (
                  <MenuItem key={c} value={c}>
                    <TwoWheelerIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} /> {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12} sm={6} md={3}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<AddIcon />}
              sx={{
                py: { xs: 1.25, sm: 1.5 },
                fontWeight: 700,
                borderRadius: '8px',
                fontSize: '0.95rem',
              }}
            >
              Sipariş Ekle
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default OrderForm;
