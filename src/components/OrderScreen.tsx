import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  TextField,
  Divider,
  Paper,
  AppBar,
  Toolbar,
  Snackbar,
  Alert,
  Badge,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import OrderCompleteModal from './OrderCompleteModal';
import CartCustomizationPanel from './CartCustomizationPanel';
import VirtualKeyboard from './VirtualKeyboard';
import { useOrders } from '../context/OrderContext';
import {
  ArrowBack as ArrowBackIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { CartItem, CartGroup, KitchenPrintPayload } from '../types';

interface Product {
  id: string | number;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
}

const categories = [
  'Hatay Usulü Dönerler',
  'Klasik Dönerler',
  'Takolar',
  'Porsiyonlar',
  'Menüler',
  'İçecekler & Atıştırmalık',
];

const products: Product[] = [
  // Hatay Usulü Dönerler
  {
    id: 1,
    name: 'Hatay Eko Döner',
    price: 150,
    category: 'Hatay Usulü Dönerler',
  },
  {
    id: 2,
    name: 'Hatay  Normal Döner',
    price: 170,
    category: 'Hatay Usulü Dönerler',
  },
  {
    id: 3,
    name: 'Hatay Maksi Döner',
    price: 220,
    category: 'Hatay Usulü Dönerler',
  },
  {
    id: 4,
    name: 'Hatay Usulü ET Eko Döner',
    price: 230,
    category: 'Hatay Usulü Dönerler',
  },
  {
    id: 5,
    name: 'Hatay Usulü ET Normal Döner',
    price: 270,
    category: 'Hatay Usulü Dönerler',
  },
  {
    id: 6,
    name: 'Hatay Usulü ET Maksi Döner',
    price: 330,
    category: 'Hatay Usulü Dönerler',
  },
     {
    id: 6725,
    name: 'Mercimek Çorbası',
    price: 90,
    category: 'Hatay Usulü Dönerler',
  },

  {
    id: 'hud-lavas',
    name: 'Ekstra Lavaş',
    price: 15,
    category: 'Hatay Usulü Dönerler',
  },

  // Klasik Dönerler
  {
    id: 7,
    name: 'Klasik Eko Döner',
    price: 150,
    category: 'Klasik Dönerler',
  },
  {
    id: 8,
    name: 'Klasik Normal Döner',
    price: 170,
    category: 'Klasik Dönerler',
  },
  {
    id: 9,
    name: 'Klasik ET Eko Döner',
    price: 230,
    category: 'Klasik Dönerler',
  },
  {
    id: 10,
    name: 'Klasik ET Normal Döner',
    price: 270,
    category: 'Klasik Dönerler',
  },
  {
    id: 'hud-lavas',
    name: 'Ekstra Lavaş',
    price: 15,
    category: 'Klasik Dönerler',
  },

  // Takolar
  {
    id: 11,
    name: 'Tekli Tako',
    price: 120,
    category: 'Takolar',
  },
  {
    id: 12,
    name: 'İkili Tako',
    price: 220,
    category: 'Takolar',
  },
  {
    id: 13,
    name: 'ET Tekli Tako',
    price: 160,
    category: 'Takolar',
  },
  {
    id: 14,
    name: 'ET İkili Tako',
    price: 300,
    category: 'Takolar',
  },
  {
    id: 15,
    name: 'Karışık Combo Tako',
    price: 230,
    category: 'Takolar',
  },
  

  // Porsiyonlar
  {
    id: 16,
    name: 'TAVUK Döner Porsiyon',
    price: 240,
    category: 'Porsiyonlar',
  },
  {
    id: 17,
    name: 'Pilav Üstü Porsiyon',
    price: 270,
    category: 'Porsiyonlar',
  },
  {
    id: 18,
    name: 'ET Döner Porsiyon',
    price: 360,
    category: 'Porsiyonlar',
  },
  {
    id: 19,
    name: 'Pilav Üstü ET Döner Porsiyon',
    price: 380,
    category: 'Porsiyonlar',
  },
  {
    id: 'hud-lavas',
    name: 'Ekstra Lavaş',
    price: 15,
    category: 'Porsiyonlar',
  },

  // Menüler
  {
    id: 20,
    name: 'TAVUK  Menü',
    price: 260,
    category: 'Menüler',
  },
  {
    id: 21,
    name: 'ET Döner Menü',
    price: 330,
    category: 'Menüler',
  },
  {
    id: 'm-lavas',
    name: 'Ekstra Lavaş',
    price: 15,
    category: 'Menüler',
  },

  // İçecekler & Atıştırmalık
  {
    id: 22,
    name: 'Ayran',
    price: 50,
    category: 'İçecekler & Atıştırmalık',
  },
  {
    id: 23,
    name: 'Kutu İçecekler',
    price: 70,
    category: 'İçecekler & Atıştırmalık',
  },
  {
    id: 24,
    name: 'Şalgam',
    price: 50,
    category: 'İçecekler & Atıştırmalık',
  },
  {
    id: 25,
    name: 'Soda',
    price: 35,
    category: 'İçecekler & Atıştırmalık',
  },
  {
    id: 26,
    name: 'Su',
    price: 15,
    category: 'İçecekler & Atıştırmalık',
  },
  {
    id: 27,
    name: 'Külahta Patates Kızartması',
    price: 70,
    category: 'İçecekler & Atıştırmalık',
  },
  {
    id: 28,
    name: 'Antep Usulü Katmer Tatlısı',
    price: 180,
    category: 'İçecekler & Atıştırmalık',
  },
  {
    id: 29,
    name: '1 LT Kola ',
    price: 90,
    category: 'İçecekler & Atıştırmalık',
  },
  {
    id: 30,
    name: '1 LT Ayaran',
    price: 90,
    category: 'İçecekler & Atıştırmalık',
  },
  {
    id: 31,
    name: '2,5 LT Kola',
    price: 120,
    category: 'İçecekler & Atıştırmalık',
  },

  {
    id: 'drink-2',
    name: 'Servis Patates',
    price: 90,
    category: 'İçecekler & Atıştırmalık',
    image: 'https://via.placeholder.com/150',
  },
 
];

const OrderScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addOrder: _addOrder } = useOrders(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const orderType = searchParams.get('type') === 'delivery' ? 'delivery' : 'dine-in';
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string | number, number>>({});
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [activeInput, setActiveInput] = useState<'phone' | 'address' | 'last4' | null>(null);
  const [paymentType, setPaymentType] = useState<'cash' | 'card'>('cash');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCustomizationPanel, setShowCustomizationPanel] = useState(false);
  const [customizedInstances, setCustomizedInstances] = useState<CartGroup[]>([]);
  const [kitchenPayload, setKitchenPayload] = useState<KitchenPrintPayload | undefined>();
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0);
  const [receiptNumber] = useState(() => {
    const savedNumber = localStorage.getItem('receiptNumber');
    const savedDate = localStorage.getItem('receiptDate');
    const today = new Date().toDateString();
    if (savedDate === today && savedNumber) return parseInt(savedNumber, 10);
    return 1;
  });

  useEffect(() => {
    if (orderType !== 'delivery' || lastFourDigits.length !== 4) {
      return;
    }

    const savedPhones = JSON.parse(localStorage.getItem('savedPhones') || '{}');
    const foundPhone = Object.keys(savedPhones).find((p) => p.endsWith(lastFourDigits));

    if (foundPhone) {
      setPhone(foundPhone);
      setAddress(savedPhones[foundPhone].address);
    }
  }, [lastFourDigits, orderType]);

  const handleQuantityChange = (productId: string | number, change: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + change),
    }));
  };

  const addToCart = (product: Product) => {
    const quantity = quantities[product.id] || 0;
    if (quantity === 0) return;

    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });

    setQuantities((prev) => ({
      ...prev,
      [product.id]: 0,
    }));
  };

  const removeFromCart = (productId: string | number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const deliveryFee = orderType === 'delivery' ? calculateDeliveryFee() : 0;
    return subtotal + deliveryFee;
  };

  const calculateDeliveryFee = () => {
    if (orderType !== 'delivery') return 0;

    let fee = 0;

    cart.forEach(item => {
      fee += getDeliveryFeeForItem(item);
    });

    return fee;
  };

  const getDeliveryFeeForItem = (item: CartItem) => {
    if (orderType !== 'delivery') return 0;
    if (item.name.toLowerCase().includes('lavaş')) return 0;
    if (['Hatay Usulü Dönerler', 'Klasik Dönerler', 'Takolar', 'Porsiyonlar', 'Menüler'].includes(item.category)) {
      return 20 * item.quantity;
    }
    if (item.category === 'İçecekler & Atıştırmalık') {
      return 10 * item.quantity;
    }
    return 0;
  };

  // Sanal klavye tuş işleyici
  const handleVirtualKey = (key: string) => {
    const setter =
      activeInput === 'phone'  ? setPhone :
      activeInput === 'address' ? setAddress :
      activeInput === 'last4'  ? setLastFourDigits : null;
    if (!setter) return;

    if (key === 'BACKSPACE') {
      setter((prev) => prev.slice(0, -1));
    } else if (key === 'ENTER') {
      setActiveInput(null);
    } else {
      setter((prev) => {
        if (activeInput === 'last4') {
          const next = (prev + key).replace(/\D/g, '').slice(0, 4);
          return next;
        }
        return prev + key;
      });
    }
  };

  const handleComplete = () => {
    setCart([]);
    setQuantities({});
    setShowSuccessMessage(true);
  };

  const exportToExcel = () => {
    // Excel başlıkları
    const headers = [
      'Tarih',
      'Sipariş Tipi',
      'Ürün',
      'Adet',
      'Birim Fiyat',
      'Toplam Fiyat',
      'Telefon',
      'Adres',
      'Ödeme Tipi'
    ];

    // Siparişleri Excel formatına dönüştür
    const excelData = cart.map(item => [
      new Date().toLocaleString('tr-TR'),
      orderType === 'dine-in' ? 'İçeride' : 'Kurye',
      item.name,
      item.quantity,
      item.price,
      item.price * item.quantity,
      orderType === 'delivery' ? phone : '-',
      orderType === 'delivery' ? address : '-',
      orderType === 'delivery' ? (paymentType === 'cash' ? 'Nakit' : 'Kredi Kartı') : '-'
    ]);

    // CSV formatına dönüştür
    const csvContent = [
      headers.join(','),
      ...excelData.map(row => row.join(','))
    ].join('\n');

    // CSV dosyasını indir
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `uslu_doner_siparis_${new Date().toLocaleString('tr-TR').replace(/[/\\?%*:|"<>]/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter(
    (product) => {
      if (product.category !== selectedCategory) return false;
      const n = product.name.toLowerCase();
      // "et" kelimesi geçen tüm ürünleri gizle (et dürüm, et menü, et porsiyon vb.)
      if (/\bet\b/.test(n)) return false;
      return true;
    }
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ minHeight: '64px' }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontSize: '1.1rem', color: orderType === 'delivery' ? 'primary.main' : 'error.main' }}>
            USLU DÖNER – {orderType === 'dine-in' ? 'İçeride' : 'Kurye'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<BarChartIcon />}
              onClick={() => navigate('/admin')}
              size="small"
              sx={{ fontSize: '0.8rem' }}
              color={orderType === 'delivery' ? 'primary' : 'error'}
            >
              Raporlar
            </Button>
            <Button
              startIcon={<SettingsIcon />}
              onClick={() => navigate('/admin')}
              size="small"
              sx={{ fontSize: '0.8rem' }}
              color={orderType === 'delivery' ? 'primary' : 'error'}
            >
              Ayarlar
            </Button>
            <Button
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              size="small"
              sx={{ fontSize: '0.8rem' }}
              color={orderType === 'delivery' ? 'primary' : 'error'}
            >
              Ana Sayfa
            </Button>
            <Button
              startIcon={<PrintIcon />}
              onClick={exportToExcel}
              size="small"
              sx={{ fontSize: '0.8rem' }}
              color={orderType === 'delivery' ? 'primary' : 'error'}
            >
              Excel
            </Button>
            <IconButton color="inherit" size="small">
              <Badge badgeContent={cart.length} color="primary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {/* Left side - Categories and Products */}
          <Grid item xs={12} md={9}>
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'contained' : 'outlined'}
                  onClick={() => setSelectedCategory(category)}
                  sx={{ 
                    minWidth: '120px',
                    height: '40px',
                    fontSize: '0.9rem'
                  }}
                  color={orderType === 'delivery' ? 'primary' : 'error'}
                >
                  {category}
                </Button>
              ))}
            </Box>

            <Grid container spacing={1}>
              {filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontSize: '1rem' }}>{product.name}</Typography>
                      <Typography color="textSecondary" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {product.price}₺
                      </Typography>
                      {product.description && (
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{product.description}</Typography>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <IconButton
                          onClick={() => handleQuantityChange(product.id, -1)}
                          disabled={!quantities[product.id]}
                          size="small"
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          value={quantities[product.id] || 0}
                          size="small"
                          sx={{ width: 50, mx: 1 }}
                          inputProps={{ 
                            readOnly: true,
                            style: { textAlign: 'center', fontSize: '1rem' }
                          }}
                        />
                        <IconButton
                          onClick={() => handleQuantityChange(product.id, 1)}
                          size="small"
                        >
                          <AddIcon />
                        </IconButton>
                        <Button
                          variant="contained"
                          onClick={() => addToCart(product)}
                          disabled={!quantities[product.id]}
                          sx={{ ml: 1, fontSize: '0.8rem' }}
                          color={orderType === 'delivery' ? 'primary' : 'error'}
                        >
                          Ekle
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Right side - Cart */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, height: 'calc(100vh - 120px)', position: 'sticky', top: '20px', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600, color: orderType === 'delivery' ? 'primary.main' : 'error.main' }}>
                🛒 Sepet
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Kurye bilgileri — sepet boş olsa da her zaman görünür */}
              {orderType === 'delivery' && (
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Telefon Son 4 Hanesi"
                    value={lastFourDigits}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setLastFourDigits(digits);
                    }}
                    onFocus={() => setActiveInput('last4')}
                    onClick={() => setActiveInput('last4')}
                    sx={{ mb: 1.5, '& .MuiOutlinedInput-root': activeInput === 'last4' ? { '& fieldset': { borderColor: '#1a237e', borderWidth: 2 } } : {} }}
                    inputProps={{ maxLength: 4, inputMode: 'none', readOnly: false }}
                    helperText="Kayıtlı müşteri için son 4 haneyi girin"
                  />
                  <TextField
                    fullWidth
                    label="Telefon"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onFocus={() => setActiveInput('phone')}
                    onClick={() => setActiveInput('phone')}
                    sx={{ mb: 1.5, '& .MuiOutlinedInput-root': activeInput === 'phone' ? { '& fieldset': { borderColor: '#1a237e', borderWidth: 2 } } : {} }}
                    inputProps={{ inputMode: 'none' }}
                  />
                  <TextField
                    fullWidth
                    label="Adres"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onFocus={() => setActiveInput('address')}
                    onClick={() => setActiveInput('address')}
                    sx={{ mb: 1.5, '& .MuiOutlinedInput-root': activeInput === 'address' ? { '& fieldset': { borderColor: '#1a237e', borderWidth: 2 } } : {} }}
                    inputProps={{ inputMode: 'none' }}
                  />
                  <FormControl component="fieldset" sx={{ mb: 1 }}>
                    <FormLabel component="legend">Ödeme Tipi</FormLabel>
                    <RadioGroup
                      row
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value as 'cash' | 'card')}
                    >
                      <FormControlLabel value="cash" control={<Radio />} label="Nakit" />
                      <FormControlLabel value="card" control={<Radio />} label="Kart" />
                    </RadioGroup>
                  </FormControl>
                  <Divider sx={{ mb: 2 }} />
                </Box>
              )}

              {cart.length === 0 ? (
                <Typography color="textSecondary" align="center" sx={{ py: 2, fontSize: '0.9rem' }}>
                  Sepetiniz boş.
                  <br />
                  Lütfen sol taraftan ürün seçin.
                </Typography>
              ) : (
                <>
                  {cart.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                        p: 1,
                        borderRadius: 1,
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.name}</Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem' }}>
                          {item.quantity} x {item.price}₺
                          {orderType === 'delivery' && getDeliveryFeeForItem(item) > 0 ? (
                            <>{' '}+ {getDeliveryFeeForItem(item) / item.quantity}₺ kurye</>
                          ) : null}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{ mr: 1, fontSize: '0.9rem', fontWeight: 500 }}>
                          {item.quantity * item.price}₺
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => removeFromCart(item.id)}
                          sx={{ p: 0.5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem', fontWeight: 600, color: orderType === 'delivery' ? 'primary.main' : 'error.main' }}>
                    Toplam: {calculateTotal()}₺
                  </Typography>
                  {orderType === 'delivery' && (
                    <Typography variant="body2" color="textSecondary" gutterBottom sx={{ fontSize: '0.8rem' }}>
                      * Kurye ücreti dahildir
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={cart.length === 0}
                    startIcon={<PrintIcon />}
                    onClick={() => setShowCustomizationPanel(true)}
                    sx={{ mt: 2, py: 1.5, fontSize: '0.9rem' }}
                    color={orderType === 'delivery' ? 'primary' : 'error'}
                  >
                    Sepeti Onayla
                  </Button>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <CartCustomizationPanel
        open={showCustomizationPanel}
        onClose={() => setShowCustomizationPanel(false)}
        cart={cart}
        orderType={orderType}
        receiptNumber={receiptNumber}
        total={calculateTotal()}
        onConfirm={(groups, payload) => {
          setCustomizedInstances(groups);
          setKitchenPayload(payload);
          setConfirmedTotal(payload.total);
          setShowCustomizationPanel(false);
          setShowCompleteModal(true);
        }}
      />

      <OrderCompleteModal
        open={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        orderType={orderType}
        cart={cart}
        total={confirmedTotal}
        phone={phone}
        address={address}
        paymentType={paymentType}
        onComplete={handleComplete}
        customizedInstances={customizedInstances}
        kitchenPayload={kitchenPayload}
      />

      {/* Sanal klavye — sağ alt köşe ikonu + panel */}
      <VirtualKeyboard onKey={handleVirtualKey} />

      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={3000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Sipariş başarıyla kaydedildi!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderScreen; 
