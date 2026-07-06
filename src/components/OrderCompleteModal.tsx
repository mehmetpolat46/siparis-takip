import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useOrders } from '../context/OrderContext';
import { CartItem, OrderItem, CartGroup, KitchenPrintPayload } from '../types';

interface OrderCompleteModalProps {
  open: boolean;
  onClose: () => void;
  orderType: 'dine-in' | 'delivery';
  cart: CartItem[];
  total: number;
  phone: string;
  address: string;
  paymentType: 'cash' | 'card';
  onComplete: () => void;
  // Özelleştirilmiş grup verisi (CartCustomizationPanel'den gelir)
  customizedInstances?: CartGroup[];
  kitchenPayload?: KitchenPrintPayload;
}

const OrderCompleteModal: React.FC<OrderCompleteModalProps> = ({
  open,
  onClose,
  orderType: initialOrderType,
  cart,
  total,
  phone,
  address,
  paymentType,
  onComplete,
  customizedInstances,
  kitchenPayload,
}) => {
  const { addOrder } = useOrders();
  const [receiptNumber, setReceiptNumber] = useState(() => {
    const savedNumber = localStorage.getItem('receiptNumber');
    const savedDate = localStorage.getItem('receiptDate');
    const today = new Date().toDateString();

    if (savedDate === today && savedNumber) {
      return parseInt(savedNumber, 10);
    }
    return 1;
  });

  // Reset input fields when modal opens
  useEffect(() => {
    if (open) {
      // no internal delivery fields to clear
    }
  }, [open]);

  useEffect(() => {
    const savedDate = localStorage.getItem('receiptDate');
    const today = new Date().toDateString();

    if (savedDate !== today) {
      setReceiptNumber(1);
      localStorage.setItem('receiptDate', today);
    }
    localStorage.setItem('receiptNumber', receiptNumber.toString());
  }, [receiptNumber]);

  const getDeliveryFeeForItem = (item: CartItem) => {
    if (initialOrderType !== 'delivery') return 0;
    if (item.name.toLowerCase().includes('lavaş')) return 0;
    if (['Hatay Usulü Dönerler', 'Klasik Dönerler', 'Takolar', 'Porsiyonlar', 'Menüler'].includes(item.category)) {
      return 20 * item.quantity;
    }
    if (item.category === 'İçecekler & Atıştırmalık') {
      return 10 * item.quantity;
    }
    return 0;
  };

  const handleComplete = () => {
    const orderItems: OrderItem[] = cart.map(item => ({
      ...item,
      id: item.id.toString(),
      category: item.category || 'default',
      name: item.name.toLowerCase().includes('lavaş') ? `${item.name} (Ekstra Lavaş)` : item.name
    }));

    addOrder({
      type: initialOrderType,
      items: orderItems,
      total: kitchenPayload ? kitchenPayload.total : total,
      phone: initialOrderType === 'delivery' ? phone : undefined,
      address: initialOrderType === 'delivery' ? address : undefined,
      paymentType: initialOrderType === 'delivery' ? paymentType : undefined,
    });

    // ─── Mutfak adisyon satırı üretici (CartGroup bazlı) ─────────────────────
    const buildKitchenLine = (): string => {
      // Kurye birim farkı hesaplayıcı (CartGroup için)
      const getGroupDeliveryFeePerUnit = (g: { name: string; category: string }): number => {
        if (initialOrderType !== 'delivery') return 0;
        if (g.name.toLowerCase().includes('lavaş')) return 0;
        if (['Hatay Usulü Dönerler', 'Klasik Dönerler', 'Takolar', 'Porsiyonlar', 'Menüler'].includes(g.category)) return 20;
        if (g.category === 'İçecekler & Atıştırmalık') return 10;
        return 0;
      };

      if (!customizedInstances || customizedInstances.length === 0) {
        return cart.map(item => {
          const feePerUnit = getGroupDeliveryFeePerUnit(item);
          const unitPrice = item.price + feePerUnit;
          return `<div class="item"><span class="item-name">${item.quantity}x ${item.name}</span><span class="dots"></span><span class="item-details">${unitPrice} TL</span></div>`;
        }).join('');
      }

      // Grupları aynı cartItemId bazında birleştir → ürün başlığı 1 kez yaz
      const itemIds = Array.from(new Set(customizedInstances.map(g => String(g.cartItemId))));

      return itemIds.map(cartItemId => {
        const itemGroups = customizedInstances.filter(g => String(g.cartItemId) === cartItemId);
        const itemName   = itemGroups[0].name;
        const feePerUnit = getGroupDeliveryFeePerUnit(itemGroups[0]);

        // ── Her grup için kendi satırı ──────────────────────────────────────
        const groupLines = itemGroups.map(g => {
          const pType    = g.productType;
          const menuType = g.menuDonerType;
          const unitPriceWithFee = g.basePrice + feePerUnit;
          const lineTotalWithFee = unitPriceWithFee * g.quantity;

          const ings = (pType === 'hatay' || menuType === 'hatay')  ? g.hatayIngredients  :
                       (pType === 'klasik' || menuType === 'klasik') ? g.klasikIngredients : undefined;

          // Malzeme parantezi: (pat, tu, tvk, sos, <s>may</s>)
          let ingParenthesis = '';
          if (ings && ings.length > 0) {
            const ingStr = ings
              .map(ig => ig.active
                ? ig.abbr
                : `<s>${ig.abbr}</s>`)
              .join(', ');
            const breadPrefix = (pType === 'klasik' || menuType === 'klasik') && g.klasikBread
              ? `${g.klasikBread}, `
              : '';
            ingParenthesis = ` (${breadPrefix}${ingStr})`;
          }

          return `
            <div class="item kitchen-item">
              <span class="item-name">${g.quantity}x ${itemName}</span>
              <span class="dots"></span>
              <span class="item-details">${lineTotalWithFee} TL</span>
            </div>${ingParenthesis ? `<div class="ing-sub-line">${ingParenthesis.replace(/^\s*\(/, '').replace(/\)\s*$/, '')}</div>` : ''}`;
        }).join('');

        return groupLines;
      }).join('');
    };

    // Yazdırma işlemi
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>USLU DÖNER -  Fişi</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
              
              body { 
                font-family: 'Roboto', sans-serif;
                padding: 20px;
                max-width: 600px;
                margin: 0 auto;
                background: #fff;
              }
              
              .receipt {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                font-family: 'Courier New', monospace;
                color: #000;
                font-weight: 600;
                width: 100%;
              }
              
              .header { 
                text-align: center;
                margin-bottom: 20px;
                color: #000;
              }
              
              .header h2 {
                font-size: 28px;
                margin: 0;
                color: #000;
                font-weight: 700;
              }
              
              .header p {
                color: #000;
                margin: 5px 0 0;
                font-size: 18px;
                font-weight: 600;
              }
              
              .receipt-number {
                font-weight: 700;
                font-size: 20px;
                color: #000;
              }
              
              .info {
                margin-bottom: 25px;
                font-size: 16px;
                color: #000;
                font-weight: 600;
              }
              
              .info p {
                margin: 5px 0;
                color: #000;
                font-weight: 600;
                font-size: 21px;
              }

              .info p:last-of-type {
                margin-bottom: 20px;
              }
              
              .items {
                margin-bottom: 25px;
              }
              
              .item {
                margin-bottom: 20px;
                font-size: 18px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: #000;
                font-weight: 600;
                line-height: 1.5;
              }
              
              .item-name {
                flex: 1;
                margin-right: 15px;
                color: #000;
                font-weight: 600;
                font-size: 26px;
              }
              
              .item-details {
                text-align: right;
                white-space: nowrap;
                color: #000;
                font-weight: 600;
                font-size: 24px;
              }
              
              .dots {
                border-bottom: 1px dotted #000;
                flex: 1;
                margin: 0 12px;
                position: relative;
                top: -4px;
              }
              
              .total {
                border-top: 2px dashed #000;
                padding-top: 15px;
                margin-top: 20px;
                font-size: 18px;
                color: #000;
                font-weight: 600;
              }
              
              .total p {
                margin: 8px 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: #000;
                font-weight: 600;
              }
              
              .total .grand-total {
                font-weight: 700;
                font-size: 22px;
                color: #000;
                margin-top: 10px;
              }
              
              .footer {
                text-align: center;
                margin-top: 25px;
                font-size: 16px;
                color: #000;
                border-top: 1px dashed #000;
                padding-top: 15px;
                font-weight: 600;
              }
              .items span {
                font-size: 22px !important;
              }
              
              .kitchen-item .item-name {
                font-size: 22px;
              }

              .inst-idx {
                font-size: 14px !important;
                color: #555;
                font-weight: 400;
              }

              .ingredient-line {
                font-size: 16px;
                padding: 4px 8px 10px 8px;
                border-bottom: 1px dashed #ccc;
                margin-bottom: 4px;
                letter-spacing: 1px;
              }

              .ing {
                display: inline-block;
                margin-right: 6px;
                font-weight: 700;
                color: #000;
              }

              .ing.removed {
                color: #999;
                font-weight: 400;
              }

              .ing.extra {
                color: #1a7a1a;
                font-weight: 700;
              }

              .bread {
                display: inline-block;
                margin-right: 8px;
                font-weight: 700;
                color: #333;
                background: #f5f5f5;
                border-radius: 3px;
                padding: 1px 5px;
                font-size: 14px;
              }              
              .sub-line {
                font-size: 18px;
                font-weight: 700;
                padding: 3px 8px 3px 28px;
                color: #000;
                letter-spacing: 0.5px;
              }

              .ing-sub-line {
                font-size: 18px;
                font-weight: 700;
                padding: 2px 8px 10px 300px;
                color: #000;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
              }

              .ing-removed {
                font-size: 18px;
                font-weight: 700;
                color: #000;
                margin-right: 10px;
              }

              .ing-removed s {
                text-decoration-thickness: 2px;
              }

              .ing-active {
                font-size: 18px;
                font-weight: 700;
                color: #000;
                margin-right: 10px;
              }

              .ing-extra {
                font-size: 18px;
                font-weight: 800;
                color: #1a7a1a;
                margin-right: 10px;
              }

              .ing-bread {
                font-size: 16px;
                font-weight: 700;
                color: #333;
                background: #f0f0f0;
                border-radius: 3px;
                padding: 1px 6px;
                margin-right: 8px;
              }
              
              .footer p {
                margin: 5px 0;
                color: #000;
                font-weight: 600;
              }
            </style>
          </head>
          <body>
            <div class="receipt">
            <div class="header">
              <h2>USLU DÖNER</h2>
                <p>Hatay Usulü & Klasik Döner </p>
              <p class="receipt-number">Fiş No: ${receiptNumber}</p>
            </div>
            
            <div class="info">
                <p>Tarih: ${new Date().toLocaleString('tr-TR')}</p>
                <p>Sipariş Tipi: ${initialOrderType === 'delivery' ? 'Paket Servis' : 'Yerinde'}</p>
              ${initialOrderType === 'delivery' ? `<br/>
                  <p>Telefon: ${phone}</p> <br/><br/><br/>
                  <p>Adres: ${address}</p><br/><br/><br/><br/><br/><br/>
                  <p>Ödeme: ${paymentType === 'cash' ? 'Nakit' : 'Kart'}</p>
              ` : ''}
            </div>
            
            <div class="items">
              ${buildKitchenLine()}
            </div>
            
            <div class="total">
              <p class="grand-total">
                  <span>Toplam:</span>
                  <span>${(kitchenPayload ? kitchenPayload.total : total).toFixed(2)} TL</span>
              </p>
            </div>
            
            <div class="footer">
              <p>Bizi tercih ettiğiniz için teşekkür ederiz!</p>
              <p>Afiyet olsun...</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    setReceiptNumber(prev => prev + 1);
    onComplete();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          width: '90%',
          maxWidth: '600px'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontSize: '1.1rem', color: initialOrderType === 'delivery' ? 'primary.main' : 'error.main' }}>Siparişi Tamamla</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: '0.9rem' }}>Ürün</TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.9rem' }}>Adet</TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.9rem' }}>Fiyat</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customizedInstances && customizedInstances.length > 0
                  ? (() => {
                      // Grupları cartItemId bazında birleştir
                      const itemIds = Array.from(new Set(customizedInstances.map(g => String(g.cartItemId))));
                      return itemIds.map(cartItemId => {
                        const itemGroups = customizedInstances.filter(g => String(g.cartItemId) === cartItemId);
                        const lineTotal  = itemGroups.reduce((s, g) => s + g.basePrice * g.quantity, 0);
                        const totalQty   = itemGroups.reduce((s, g) => s + g.quantity, 0);
                        const itemName   = itemGroups[0].name;
                        const deliveryFee = initialOrderType === 'delivery'
                          ? itemGroups.reduce((s, g) => s + getDeliveryFeeForItem({ id: g.cartItemId, name: g.name, price: g.basePrice, quantity: g.quantity, category: g.category }), 0)
                          : 0;
                        return (
                          <TableRow key={cartItemId}>
                            <TableCell sx={{ fontSize: '0.9rem' }}>
                              {itemName}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.9rem' }}>{totalQty}</TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.9rem' }}>
                              {lineTotal + deliveryFee} TL
                            </TableCell>
                          </TableRow>
                        );
                      });
                    })()
                  : cart.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell sx={{ fontSize: '0.9rem' }}>{item.name}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.9rem' }}>{item.quantity}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.9rem' }}>
                          {initialOrderType === 'delivery' && getDeliveryFeeForItem(item) > 0
                            ? `${item.price * item.quantity + getDeliveryFeeForItem(item)} TL`
                            : `${item.price * item.quantity} TL`}
                        </TableCell>
                      </TableRow>
                    ))
                }
              </TableBody>
            </Table>
          </TableContainer>

        {initialOrderType === 'delivery' && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Müşteri Bilgileri
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Telefon: {phone || '-'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Adres: {address || '-'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Ödeme Tipi: {paymentType === 'cash' ? 'Nakit' : 'Kart'}
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" align="right">
              Toplam: {kitchenPayload ? kitchenPayload.total : total} TL
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button
          onClick={handleComplete}
          variant="contained"
          color={initialOrderType === 'delivery' ? 'primary' : 'error'}
        >
          Tamamla
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderCompleteModal;
