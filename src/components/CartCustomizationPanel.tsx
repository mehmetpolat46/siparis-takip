/**
 * CartCustomizationPanel — Dokunmatik POS Sepet Özelleştirme Paneli
 *
 * Mimari:
 *  - Sepetteki her CartItem için 1-N "CartGroup" tutulur.
 *  - Gruplar ekranda "3x Hatay (standart)", "3x Hatay (soğansız)" şeklinde görünür.
 *  - Garson bir gruba girince adet sayacı + malzeme butonları görür.
 *  - "Böl" akışı: seçilen adedi yeni gruba taşır, kalanı mevcut grupta bırakır.
 *  - Klavye tetiklenmez: tüm sayısal giriş büyük dokunmatik NumPad üzerinden yapılır.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  Button,
  Box,
  Typography,
  Divider,
  IconButton,
  Alert,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  CartItem,
  CartGroup,
  Ingredient,
  ProductType,
  KitchenPrintPayload,
  KitchenPrintItem,
  KitchenIngredient,
} from '../types';
import ThreeDIcon from './ThreeDIcon';
import { PortionIcon, WrapIcon } from './FoodIllustrations';

// ─── Sabitler ────────────────────────────────────────────────────────────────
const HATAY_DEFAULT: Ingredient[] = [
  { name: 'Patates', abbr: 'pat', active: true },
  { name: 'Turşu',   abbr: 'tu',  active: true },
  { name: 'Tavuk',   abbr: 'tvk', active: true },
  { name: 'Sos',     abbr: 'sos', active: true },
  { name: 'Mayonez', abbr: 'may', active: true },
];

const KLASIK_DEFAULT: Ingredient[] = [
  { name: 'Marul',   abbr: 'mar', active: true },
  { name: 'Domates', abbr: 'dom', active: true },
  { name: 'Turşu',   abbr: 'tu',  active: true },
  { name: 'Soğan',   abbr: 'soğ', active: true },
  { name: 'Ketçap',  abbr: 'ket', active: true },
  { name: 'Mayonez', abbr: 'may', active: true },
];

const TAKO_DEFAULT: Ingredient[] = [
  { name: 'Çeddar',    abbr: 'çed', active: true },
  { name: 'Patates',   abbr: 'pat', active: true },
  { name: 'Turşu',     abbr: 'tur', active: true },
  { name: 'Tako Sos',  abbr: 'tak sos', active: true },
  { name: 'Soğan',     abbr: 'soğ', active: true },
];

const HATAY_BREAD_OPTIONS = ['lavaş', 'çift lavaş'] as const;
const KLASIK_BREAD_OPTIONS = ['somun', 'lavaş', 'çift lavaş'] as const;

/** Çift Lavaş ek ücreti */
const CIFT_LAVAS_FIYAT = 15;

// ─── Yardımcı fonksiyonlar ────────────────────────────────────────────────────

const isExempt = (name: string) =>
  name.toLowerCase().includes('porsiyon tako') ||
  name.toLowerCase().includes('pors. tako');

const getProductType = (name: string, category: string): ProductType => {
  const l = name.toLowerCase();
  if (l.includes('hatay')) return 'hatay';
  if (l.includes('klasik') || category === 'Klasik Dönerler') return 'klasik';
  if (category === 'Menüler') return 'menu';
  if (l.includes('tako') || category === 'Takolar') return 'tako';
  return 'other';
};

const getCustomizationVisual = (category: string) => {
  if (category === 'Porsiyonlar') {
    return { color: '#2e7d32', icon: <PortionIcon /> };
  }
  return { color: '#d84315', icon: <WrapIcon /> };
};

/** Grubun çift lavaş ek fiyatını döndürür */
const ciftLavasEkFiyat = (g: CartGroup): number => {
  if (g.hatayBread === 'çift lavaş' || g.klasikBread === 'çift lavaş') return CIFT_LAVAS_FIYAT;
  return 0;
};

const freshHatayGroup = (item: CartItem, idx: number, qty: number): CartGroup => ({
  groupId: `${item.id}_g${idx}_${Date.now()}`,
  cartItemId: item.id,
  name: item.name,
  basePrice: item.price,
  quantity: qty,
  category: item.category,
  productType: getProductType(item.name, item.category),
  hatayBread: 'lavaş',
  klasikBread: 'somun',
  hatayIngredients: HATAY_DEFAULT.map((ig) => ({ ...ig })),
});

const freshKlasikGroup = (item: CartItem, idx: number, qty: number): CartGroup => ({
  groupId: `${item.id}_g${idx}_${Date.now()}`,
  cartItemId: item.id,
  name: item.name,
  basePrice: item.price,
  quantity: qty,
  category: item.category,
  productType: getProductType(item.name, item.category),
  klasikBread: 'somun',
  klasikIngredients: KLASIK_DEFAULT.map((ig) => ({ ...ig })),
});

const freshMenuGroup = (item: CartItem, idx: number, qty: number): CartGroup => ({
  groupId: `${item.id}_g${idx}_${Date.now()}`,
  cartItemId: item.id,
  name: item.name,
  basePrice: item.price,
  quantity: qty,
  category: item.category,
  productType: 'menu',
  menuDonerType: undefined,
});

const freshOtherGroup = (item: CartItem, idx: number, qty: number): CartGroup => ({
  groupId: `${item.id}_g${idx}_${Date.now()}`,
  cartItemId: item.id,
  name: item.name,
  basePrice: item.price,
  quantity: qty,
  category: item.category,
  productType: 'other',
});

const freshTakoGroup = (item: CartItem, idx: number, qty: number): CartGroup => ({
  groupId: `${item.id}_g${idx}_${Date.now()}`,
  cartItemId: item.id,
  name: item.name,
  basePrice: item.price,
  quantity: qty,
  category: item.category,
  productType: 'tako',
  takoIngredients: TAKO_DEFAULT.map((ig) => ({ ...ig })),
});

/** Tek CartItem'dan başlangıç CartGroup'unu oluşturur (tümü tek grup) */
const cartItemToGroup = (item: CartItem): CartGroup => {
  const pType = getProductType(item.name, item.category);
  if (pType === 'hatay')  return freshHatayGroup(item, 0, item.quantity);
  if (pType === 'klasik') return freshKlasikGroup(item, 0, item.quantity);
  if (pType === 'menu')   return freshMenuGroup(item, 0, item.quantity);
  if (pType === 'tako')   return freshTakoGroup(item, 0, item.quantity);
  return freshOtherGroup(item, 0, item.quantity);
};

// ─── Mutfak payload üretici ───────────────────────────────────────────────────

export const buildKitchenPayload = (
  groups: CartGroup[],
  receiptNumber: number,
  orderType: 'dine-in' | 'delivery',
  total: number,
): KitchenPrintPayload => {
  // Kurye birim farkı
  const deliveryFeePerUnit = (g: CartGroup): number => {
    if (orderType !== 'delivery') return 0;
    if (g.name.toLowerCase().includes('lavaş')) return 0;
    if (['Hatay Usulü Dönerler', 'Klasik Dönerler', 'Takolar', 'Porsiyonlar', 'Menüler'].includes(g.category)) return 20;
    if (g.category === 'İçecekler & Atıştırmalık') return 10;
    return 0;
  };

  const items: KitchenPrintItem[] = groups.map((g) => {
    let ingredients: KitchenIngredient[] = [];
    let bread: string | undefined;
    const isCiftLavas = g.hatayBread === 'çift lavaş' || g.klasikBread === 'çift lavaş';
    const ekFiyat = isCiftLavas ? CIFT_LAVAS_FIYAT : 0;
    if (g.productType === 'hatay' && g.hatayIngredients) {
      bread = g.hatayBread; // Hatay için de ekmek bilgisini taşı
      ingredients = g.hatayIngredients.map((ig) => ({ name: ig.name, abbr: ig.abbr, active: ig.active }));
    } else if ((g.productType === 'klasik' || g.menuDonerType === 'klasik') && g.klasikIngredients) {
      bread = g.klasikBread;
      ingredients = g.klasikIngredients.map((ig) => ({ name: ig.name, abbr: ig.abbr, active: ig.active }));
    } else if (g.menuDonerType === 'hatay' && g.hatayIngredients) {
      bread = g.hatayBread;
      ingredients = g.hatayIngredients.map((ig) => ({ name: ig.name, abbr: ig.abbr, active: ig.active }));
    } else if (g.productType === 'tako' && g.takoIngredients) {
      ingredients = g.takoIngredients
        .filter((ig) => ig.active)
        .map((ig) => ({ name: ig.name, abbr: ig.abbr, active: ig.active }));
    }

    const unitPrice = g.basePrice + ekFiyat + deliveryFeePerUnit(g);
    return {
      groupId: g.groupId,
      name: g.name,
      quantity: g.quantity,
      unitPrice,
      totalPrice: unitPrice * g.quantity,
      productType: g.productType,
      bread,
      ingredients,
      isCiftLavas,
    };
  });

  // Toplam fiyatı gruplardan yeniden hesapla (çift lavaş ek ücretini dahil eder)
  const computedTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return { receiptNumber, orderType, items, total: computedTotal, timestamp: new Date().toISOString() };
};

// ─── Bileşen Props ────────────────────────────────────────────────────────────

interface CartCustomizationPanelProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  orderType: 'dine-in' | 'delivery';
  onConfirm: (groups: CartGroup[], payload: KitchenPrintPayload) => void;
  onGroupsChange?: (groups: CartGroup[]) => void;
  receiptNumber: number;
  total: number;
}

// ─── Malzeme Butonu (büyük, dokunmatik) ──────────────────────────────────────

interface IngBtnProps {
  name: string;
  active: boolean;
  onToggle: () => void;
  color: string; // hex
  activeTextColor?: string;
}

const INGREDIENT_ICONS: Record<string, string> = {
  Patates: '🍟',
  Turşu: '🥒',
  Tavuk: '🍗',
  Sos: '🥫',
  Mayonez: '🥣',
  Marul: '🥬',
  Domates: '🍅',
  Soğan: '🧅',
  Ketçap: '🍅',
  Çeddar: '🧀',
  'Tako Sos': '🌶️',
};

const IngBtn: React.FC<IngBtnProps> = ({ name, active, onToggle, color, activeTextColor = '#fff' }) => (
  <Box
    component="div"
    onPointerDown={(e) => { e.preventDefault(); onToggle(); }}
    sx={{
      minWidth: 90,
      minHeight: 60,
      px: 2,
      py: 1,
      m: 0.5,
      borderRadius: 2.5,
      border: `1.5px solid ${active ? color : `${color}66`}`,
      bgcolor: active ? color : '#fff',
      color: active ? activeTextColor : color,
      fontWeight: 700,
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textDecoration: active ? 'none' : 'line-through',
      opacity: active ? 1 : 0.72,
      cursor: 'pointer',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      gap: 0.75,
      boxShadow: active ? `0 3px 0 ${color}99, 0 6px 12px ${color}26` : '0 2px 6px rgba(15,23,42,0.06)',
      transition: 'all 0.15s',
      '&:active': {
        transform: 'translateY(2px)',
        boxShadow: active ? `0 1px 0 ${color}99` : 'none',
      },
    }}
  >
    <Box
      component="span"
      sx={{
        width: 27,
        height: 27,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '9px',
        fontSize: '1.05rem',
        bgcolor: active ? 'rgba(255,255,255,0.2)' : `${color}12`,
        boxShadow: active ? 'inset 0 1px 2px rgba(0,0,0,0.13)' : `0 2px 0 ${color}20`,
        textDecoration: 'none',
      }}
    >
      {INGREDIENT_ICONS[name] ?? '🍽️'}
    </Box>
    <Box component="span">{name}</Box>
  </Box>
);

const BreadSelector: React.FC<{ group: CartGroup; onChange: (g: CartGroup) => void; color: string; breadKey: 'hatayBread' | 'klasikBread' }> = ({ group, onChange, color, breadKey }) => {
  const options = breadKey === 'klasikBread' ? KLASIK_BREAD_OPTIONS : HATAY_BREAD_OPTIONS;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={{ fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: 1 }}>
        🥖 Ekmek
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, mt: 1, mb: 1.5, flexWrap: 'wrap' }}>
        {options.map((b) => {
          const activeBread = breadKey === 'hatayBread' ? group.hatayBread : group.klasikBread;
          const isCiftLavas = b === 'çift lavaş';
          return (
            <Box
              key={b}
              component="div"
              onPointerDown={(e) => { e.preventDefault(); onChange({ ...group, [breadKey]: b }); }}
              sx={{
                minWidth: 112, minHeight: 60, px: 2, borderRadius: 2.5,
                border: `1.5px solid ${activeBread === b ? color : `${color}66`}`,
                bgcolor: activeBread === b ? color : '#fff',
                color: activeBread === b ? '#fff' : color,
                fontWeight: 800, fontSize: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent',
                textTransform: 'capitalize',
                gap: 0.5,
                boxShadow: activeBread === b ? `0 3px 0 ${color}99, 0 7px 14px ${color}22` : '0 2px 6px rgba(15,23,42,0.06)',
                '&:active': { transform: 'translateY(2px)', boxShadow: activeBread === b ? `0 1px 0 ${color}99` : 'none' },
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: '9px',
                  bgcolor: activeBread === b ? 'rgba(255,255,255,0.2)' : `${color}12`,
                  fontSize: '1.05rem',
                }}
              >
                {b === 'somun' ? '🥖' : b === 'lavaş' ? '🫓' : '🥙'}
              </Box>
              {b === 'çift lavaş' ? 'Çift Lavaş' : b.charAt(0).toUpperCase() + b.slice(1)}
              {isCiftLavas && <Typography component="span" sx={{ fontSize: '0.7rem', opacity: 0.85 }}>+15₺</Typography>}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// ─── Hatay Özelleştirme ───────────────────────────────────────────────────────

const HatayEditor: React.FC<{ group: CartGroup; onChange: (g: CartGroup) => void }> = ({ group, onChange }) => {
  const toggle = (idx: number) => {
    const ings = group.hatayIngredients!.map((ig, i) => i === idx ? { ...ig, active: !ig.active } : ig);
    onChange({ ...group, hatayIngredients: ings });
  };
  return (
    <Box>
      {/* Ekmek Seçimi: Lavaş / Çift Lavaş */}
      <BreadSelector group={group} onChange={onChange} color="#e64a19" breadKey="hatayBread" />

      <Typography variant="caption" sx={{ fontWeight: 800, color: '#bf360c', textTransform: 'uppercase', letterSpacing: 1 }}>
        🌶️ Hatay İçerik
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1, mb: 2 }}>
        {group.hatayIngredients!.map((ig, i) => (
          <IngBtn key={ig.name} name={ig.name} active={ig.active} onToggle={() => toggle(i)} color="#e64a19" />
        ))}
      </Box>
    </Box>
  );
};

// ─── Klasik Özelleştirme ──────────────────────────────────────────────────────

const KlasikEditor: React.FC<{ group: CartGroup; onChange: (g: CartGroup) => void }> = ({ group, onChange }) => {
  const toggle = (idx: number) => {
    const ings = group.klasikIngredients!.map((ig, i) => i === idx ? { ...ig, active: !ig.active } : ig);
    onChange({ ...group, klasikIngredients: ings });
  };
  return (
    <Box>
      <BreadSelector group={group} onChange={onChange} color="#1565c0" breadKey="klasikBread" />
      {/* Malzemeler */}
      <Typography variant="caption" sx={{ fontWeight: 800, color: '#1565c0', textTransform: 'uppercase', letterSpacing: 1 }}>
        🥗 İçerik
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
        {group.klasikIngredients!.map((ig, i) => (
          <IngBtn key={ig.name} name={ig.name} active={ig.active} onToggle={() => toggle(i)} color="#1565c0" />
        ))}
      </Box>
    </Box>
  );
};

// ─── Tako Özelleştirme ────────────────────────────────────────────────────────

const TakoEditor: React.FC<{ group: CartGroup; onChange: (g: CartGroup) => void }> = ({ group, onChange }) => {
  const toggle = (idx: number) => {
    const ings = group.takoIngredients!.map((ig, i) => i === idx ? { ...ig, active: !ig.active } : ig);
    onChange({ ...group, takoIngredients: ings });
  };
  return (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 800, color: '#e65100', textTransform: 'uppercase', letterSpacing: 1 }}>
        🌮 Tako İçerik
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1, mb: 2 }}>
        {group.takoIngredients!.map((ig, i) => (
          <IngBtn
            key={ig.name}
            name={ig.name}
            active={ig.active}
            onToggle={() => toggle(i)}
            color="#e65100"
          />
        ))}
      </Box>
    </Box>
  );
};

// ─── Menü Döner Tipi Seçici ───────────────────────────────────────────────────

const MenuEditor: React.FC<{ group: CartGroup; onChange: (g: CartGroup) => void; cartItem: CartItem }> = ({ group, onChange, cartItem }) => {
  const selectType = (type: 'hatay' | 'klasik') => {
    const base: CartGroup = { ...group, menuDonerType: type, productType: 'menu' };
    if (type === 'hatay') {
      base.hatayBread = 'lavaş';
      base.hatayIngredients = HATAY_DEFAULT.map((ig) => ({ ...ig }));
      base.klasikIngredients = undefined;
      base.klasikBread = undefined;
    } else {
      base.klasikBread = 'somun';
      base.klasikIngredients = KLASIK_DEFAULT.map((ig) => ({ ...ig }));
      base.hatayIngredients = undefined;
      base.hatayBread = undefined;
    }
    onChange(base);
  };
  return (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 800, color: '#6a1b9a', textTransform: 'uppercase', letterSpacing: 1 }}>
        🍽️ Menü Döner Tipi
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 1, mb: 1.5 }}>
        {(['hatay', 'klasik'] as const).map((t) => (
          <Box
            key={t}
            component="div"
            onPointerDown={(e) => { e.preventDefault(); selectType(t); }}
            sx={{
              flex: 1, minHeight: 64, borderRadius: 2, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
              userSelect: 'none', WebkitTapHighlightColor: 'transparent',
              border: `2.5px solid ${t === 'hatay' ? '#e64a19' : '#1565c0'}`,
              bgcolor: group.menuDonerType === t ? (t === 'hatay' ? '#e64a19' : '#1565c0') : 'transparent',
              color: group.menuDonerType === t ? '#fff' : (t === 'hatay' ? '#e64a19' : '#1565c0'),
            }}
          >
            {t === 'hatay' ? '🌶️ Hatay Usulü' : '🥙 Klasik'}
          </Box>
        ))}
      </Box>
      {group.menuDonerType === 'hatay' && <HatayEditor group={group} onChange={onChange} />}
      {group.menuDonerType === 'klasik' && <KlasikEditor group={group} onChange={onChange} />}
    </Box>
  );
};

// ─── Grup Editörü (sağ panel içeriği) ────────────────────────────────────────

interface GroupEditorProps {
  group: CartGroup;
  cartItem: CartItem;
  totalQtyForItem: number; // bu cartItem'a ait tüm grupların qty toplamı
  onChange: (g: CartGroup) => void;
  onQtyChange: (groupId: string, newQty: number) => void;
  onBack: () => void;
}

const GroupEditor: React.FC<GroupEditorProps> = ({
  group, cartItem, totalQtyForItem, onChange, onQtyChange, onBack,
}) => {
  const isCustomizable =
    !isExempt(group.name) &&
    (group.productType === 'hatay' ||
      group.productType === 'klasik' ||
      group.productType === 'menu' ||
      group.productType === 'tako');

  const unitPrice = group.basePrice + ciftLavasEkFiyat(group);
  const visual = getCustomizationVisual(cartItem.category);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ── Başlık ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          mb: 2,
          p: 1.25,
          borderRadius: 3,
          bgcolor: `${visual.color}0d`,
          border: `1px solid ${visual.color}24`,
        }}
      >
        <IconButton
          onPointerDown={(e) => { e.preventDefault(); onBack(); }}
          size="small"
          sx={{ bgcolor: '#fff', border: '1px solid rgba(15,23,42,0.08)' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <ThreeDIcon color={visual.color} size={48}>
          {visual.icon}
        </ThreeDIcon>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>
            {group.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {unitPrice}₺/adet{ciftLavasEkFiyat(group) > 0 ? ' (+15₺ Çift Lavaş)' : ''}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* ── Adet Sayacı (büyük, dokunmatik) ── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 2, mb: 3, py: 1.5,
        bgcolor: '#f4f8ff', borderRadius: 3, border: '1px solid #c7dcf5',
      }}>
        {/* − butonu */}
        <Box
          component="div"
          onPointerDown={(e) => {
            e.preventDefault();
            if (group.quantity > 1) onQtyChange(group.groupId, group.quantity - 1);
          }}
          sx={{
            width: 64, height: 64, borderRadius: 2,
            bgcolor: group.quantity > 1 ? '#c62828' : '#e0e0e0',
            color: '#fff', fontSize: '2rem', fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: group.quantity > 1 ? 'pointer' : 'default',
            userSelect: 'none', WebkitTapHighlightColor: 'transparent',
            boxShadow: group.quantity > 1 ? '0 4px 0 #8e1919, 0 9px 14px rgba(198,40,40,0.22)' : 'none',
            '&:active': { transform: 'translateY(3px)', boxShadow: '0 1px 0 #8e1919' },
          }}
        >
          −
        </Box>

        {/* Adet göstergesi */}
        <Box sx={{ textAlign: 'center', minWidth: 90 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '2.8rem', color: '#1a237e', lineHeight: 1 }}>
            {group.quantity}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            / {totalQtyForItem} adet
          </Typography>
        </Box>

        {/* + butonu */}
        <Box
          component="div"
          onPointerDown={(e) => {
            e.preventDefault();
            // Toplam adeti aşamaz
            const usedQty = totalQtyForItem - group.quantity; // diğer gruplardaki toplam
            if (usedQty > 0) onQtyChange(group.groupId, group.quantity + 1);
          }}
          sx={{
            width: 64, height: 64, borderRadius: 2,
            bgcolor: (totalQtyForItem - group.quantity) > 0 ? '#2e7d32' : '#e0e0e0',
            color: '#fff', fontSize: '2rem', fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: (totalQtyForItem - group.quantity) > 0 ? 'pointer' : 'default',
            userSelect: 'none', WebkitTapHighlightColor: 'transparent',
            boxShadow: (totalQtyForItem - group.quantity) > 0 ? '0 4px 0 #1b5e20, 0 9px 14px rgba(46,125,50,0.22)' : 'none',
            '&:active': { transform: 'translateY(3px)', boxShadow: '0 1px 0 #1b5e20' },
          }}
        >
          +
        </Box>
      </Box>

      {/* ── İçerik Editörü ── */}
      {isCustomizable ? (
        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {group.productType === 'hatay' && (
            <HatayEditor group={group} onChange={onChange} />
          )}
          {group.productType === 'klasik' && (
            <KlasikEditor group={group} onChange={onChange} />
          )}
          {group.productType === 'menu' && (
            <MenuEditor group={group} onChange={onChange} cartItem={cartItem} />
          )}
          {group.productType === 'tako' && (
            <TakoEditor group={group} onChange={onChange} />
          )}
        </Box>
      ) : (
        <Alert severity="info" sx={{ mt: 1 }}>
          Bu ürün içerik özelleştirmesinden muaftır.
        </Alert>
      )}
    </Box>
  );
};

// ─── Sol Panel: Grup Listesi ──────────────────────────────────────────────────

interface GroupListProps {
  cart: CartItem[];
  groups: CartGroup[];
  activeGroupId: string | null;
  onSelect: (gid: string) => void;
}

/** Malzeme özetini kısa string olarak döndürür */
const ingredientSummary = (g: CartGroup): string => {
  if (g.productType === 'tako' && g.takoIngredients) {
    const selected = g.takoIngredients.filter((ig) => ig.active).map((ig) => ig.abbr);
    if (selected.length === 0) return 'Sade';
    return selected.join(', ');
  }

  const ings =
    (g.productType === 'hatay' ? g.hatayIngredients :
    (g.productType === 'klasik' || g.menuDonerType === 'klasik') ? g.klasikIngredients :
    g.menuDonerType === 'hatay' ? g.hatayIngredients : undefined);

  if (!ings) return '';
  const removed = ings.filter((ig) => !ig.active).map((ig) => ig.abbr);
  if (removed.length === 0) return 'Standart';
  return removed.map((a) => `×${a}`).join(', ');
};

const GroupList: React.FC<GroupListProps> = ({ cart, groups, activeGroupId, onSelect }) => {
  return (
    <Box sx={{ overflowY: 'auto', height: '100%', pr: 0.5 }}>
      {cart.map((item) => {
        const itemGroups = groups.filter((g) => g.cartItemId === item.id);
        const visual = getCustomizationVisual(item.category);
        return (
          <Box key={String(item.id)} sx={{ mb: 2 }}>
            {/* Ürün başlığı */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.75, bgcolor: `${visual.color}0d`, border: `1px solid ${visual.color}1f`, borderRadius: 2, mb: 1 }}>
              <ThreeDIcon color={visual.color} size={34}>
                {visual.icon}
              </ThreeDIcon>
              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', flex: 1 }}>{item.name}</Typography>
              <Chip label={`${item.quantity} adet`} size="small" color={item.quantity > 1 ? 'warning' : 'default'} sx={{ fontWeight: 700 }} />
            </Box>
            {/* Grup kartları */}
            {itemGroups.map((g) => {
              const isActive = g.groupId === activeGroupId;
              const summary = ingredientSummary(g);
              const unitPrice = g.basePrice;
              const needsAttention = g.productType === 'menu' && !g.menuDonerType;
              return (
                <Box
                  key={g.groupId}
                  component="div"
                  onPointerDown={(e) => { e.preventDefault(); onSelect(g.groupId); }}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    px: 1.5, py: 1.5, mb: 1, borderRadius: 2,
                    border: isActive ? '2.5px solid' : '1.5px solid',
                    borderColor: isActive ? (g.productType === 'hatay' ? '#e64a19' : g.productType === 'klasik' ? '#1565c0' : '#6a1b9a') : 'divider',
                    bgcolor: isActive ? 'action.selected' : 'background.paper',
                    cursor: 'pointer',
                    userSelect: 'none', WebkitTapHighlightColor: 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  {/* Sol: checkmark ya da uyarı */}
                  {needsAttention
                    ? <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'warning.main', flexShrink: 0 }} />
                    : <CheckCircleIcon sx={{ color: isExempt(g.name) ? 'text.disabled' : 'success.main', fontSize: 18, flexShrink: 0 }} />
                  }
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {g.quantity}x
                      {g.productType === 'hatay' && g.hatayBread ? ` (${g.hatayBread === 'çift lavaş' ? 'Çift Lavaş' : 'Lavaş'})` : ''}
                      {(g.productType === 'klasik' || g.menuDonerType === 'klasik') && g.klasikBread ? ` (${g.klasikBread === 'çift lavaş' ? 'Çift Lavaş' : (g.klasikBread.charAt(0).toUpperCase() + g.klasikBread.slice(1))})` : ''}
                      {g.menuDonerType ? ` · ${g.menuDonerType === 'hatay' ? 'Hatay' : 'Klasik'}` : ''}
                    </Typography>
                    {summary && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {summary}
                      </Typography>
                    )}
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'text.secondary', flexShrink: 0 }}>
                    {unitPrice * g.quantity}₺
                  </Typography>
                </Box>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
};

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────

const CartCustomizationPanel: React.FC<CartCustomizationPanelProps> = ({
  open, onClose, cart, orderType, onConfirm, onGroupsChange, receiptNumber, total,
}) => {
  // groups: CartItem başına başlangıçta tek CartGroup, bölündükçe artar
  const [groups, setGroups] = useState<CartGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  // Modal açıldığında tüm CartItem'ları tek grupla başlat
  useEffect(() => {
    if (open) {
      const initial = cart.map((item) => cartItemToGroup(item));
      setGroups(initial);
      const firstCustom = initial.find(
        (g) => !isExempt(g.name) && g.productType !== 'other',
      );
      setActiveGroupId(firstCustom?.groupId ?? initial[0]?.groupId ?? null);
    }
  }, [open, cart]);

  // Bir grubu güncelle
  const handleGroupChange = useCallback((updated: CartGroup) => {
    setGroups((prev) => prev.map((g) => g.groupId === updated.groupId ? updated : g));
  }, []);

  /**
   * Adet değişince otomatik split/merge:
   * - Azaltma: fark kadar yeni boş grup oluştur (garson özelleştirir)
   * - Artırma: son grupta fazladan adet varsa bu gruptan al
   *
   * Kural: bir cartItem'ın tüm gruplarının qty toplamı sabit kalır.
   */
  const handleQtyChange = useCallback((groupId: string, newQty: number) => {
    setGroups((prev) => {
      const source = prev.find((g) => g.groupId === groupId);
      if (!source) return prev;

      const itemGroups = prev.filter((g) => g.cartItemId === source.cartItemId);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const totalQty = itemGroups.reduce((s, g) => s + g.quantity, 0);
      const diff = newQty - source.quantity; // + artırma, - azaltma

      if (diff === 0) return prev;

      // Artırma: başka bir gruptan 1 adet al (en son gruptan)
      if (diff > 0) {
        const donor = itemGroups
          .filter((g) => g.groupId !== groupId && g.quantity > 1)
          .at(-1);
        if (!donor) return prev; // verecek grup yok
        return prev.map((g) => {
          if (g.groupId === groupId)  return { ...g, quantity: g.quantity + 1 };
          if (g.groupId === donor.groupId) return { ...g, quantity: g.quantity - 1 };
          return g;
        });
      }

      // Azaltma (diff < 0): bu gruptan 1 adet eksilt, yeni boş grup ekle
      if (source.quantity <= 1) return prev; // en az 1 kalmalı

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const cartItem = cart.find((c) => c.id === source.cartItemId)!;
      const newGroup: CartGroup = {
        ...source,
        groupId: `${source.cartItemId}_g${Date.now()}`,
        quantity: 1,
        // Yeni grup varsayılan (temiz) malzemelerle başlar
        hatayIngredients: source.hatayIngredients ? HATAY_DEFAULT.map((ig) => ({ ...ig })) : undefined,
        hatayBread: source.hatayBread ? 'lavaş' : undefined,
        klasikIngredients: source.klasikIngredients ? KLASIK_DEFAULT.map((ig) => ({ ...ig })) : undefined,
        menuDonerType: source.menuDonerType,
        takoIngredients: source.takoIngredients ? TAKO_DEFAULT.map((ig) => ({ ...ig })) : undefined,
      };

      const result = prev.map((g) =>
        g.groupId === groupId ? { ...g, quantity: g.quantity - 1 } : g
      );
      const sourceIdx = result.findIndex((g) => g.groupId === groupId);
      result.splice(sourceIdx + 1, 0, newGroup);

      setTimeout(() => setActiveGroupId(newGroup.groupId), 50);
      return [...result];
    });
  }, [cart]);

  // Groups değiştiğinde parent'ı notify et (gerçek zamanlı UI güncellemesi için)
  useEffect(() => {
    onGroupsChange?.(groups);
  }, [groups, onGroupsChange]);

  // Menü ürünleri için döner tipi seçimi eksik mi?
  const pendingMenu = groups.filter((g) => g.productType === 'menu' && !g.menuDonerType);

  // Ürün adına göre ekmek sayısını hesapla
  const getBreadCountForItem = (item: { name: string; category: string }, quantity: number): number => {
    const lowerName = item.name.toLowerCase();
    
    // Hatay Maxi = 2 ekmek
    if (lowerName.includes('maksi') || lowerName.includes('maxi')) {
      return quantity * 2;
    }
    
    // Klasik, Hatay Usulü Eko, Normal, Porsiyon, Tavuk Menü = 1 ekmek
    if (
      item.category === 'Klasik Dönerler' ||
      (item.category === 'Hatay Usulü Dönerler' && (lowerName.includes('eko') || lowerName.includes('normal'))) ||
      item.category === 'Porsiyonlar' ||
      (item.category === 'Menüler' && lowerName.includes('tavuk'))
    ) {
      return quantity * 1;
    }
    
    // Diğer ürünler = 0 ekmek (taklalar, içecekler vs.)
    return 0;
  };

  // Toplam ekmek sayısını hesapla (çift lavaş +1 ile)
  const calculateBreadCount = (): number => {
    // Groups'tan her ürün için ekmek sayısını hesapla (group.quantity kullan)
    let breadCount = groups.reduce((sum, g) => {
      // Gruba karşılık gelen cart item'ini bul
      const cartItem = cart.find(item => item.id === g.cartItemId);
      if (!cartItem) return sum;
      return sum + getBreadCountForItem(cartItem, g.quantity);
    }, 0);
    
    // Groups'ta çift lavaş seçilmişse +1 ekmek ekle
    const ciftLavasCount = groups.reduce((sum, g) => {
      if (g.hatayBread === 'çift lavaş' || g.klasikBread === 'çift lavaş') {
        return sum + g.quantity;
      }
      return sum;
    }, 0);
    
    breadCount += ciftLavasCount;
    
    console.log('🥖 Ekmek Hesapla:', { groupCount: groups.length, breadCount, ciftLavasCount });
    
    return breadCount;
  };

  const handleConfirm = () => {
    const payload = buildKitchenPayload(groups, receiptNumber, orderType, total);
    console.log('🍽️ Mutfak Payload:', JSON.stringify(payload, null, 2));
    onConfirm(groups, payload);
  };

  const activeGroup = groups.find((g) => g.groupId === activeGroupId) ?? null;
  const activeCartItem = activeGroup ? cart.find((c) => c.id === activeGroup.cartItemId) ?? null : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen
      PaperProps={{
        sx: {
          borderRadius: 0,
          bgcolor: '#f5f7fa',
          backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(25,118,210,0.12), transparent 30%)',
        },
      }}
    >
      {/* ── Üst AppBar ── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, px: { xs: 1.5, sm: 3 }, py: 1.5,
        background: 'linear-gradient(125deg, #0d47a1 0%, #1976d2 58%, #42a5f5 100%)', color: '#fff', flexShrink: 0,
        boxShadow: '0 5px 18px rgba(13,71,161,0.25)',
      }}>
        <IconButton onPointerDown={(e) => { e.preventDefault(); onClose(); }} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
        <ThreeDIcon color="#0d47a1" size={44}>
          <WrapIcon />
        </ThreeDIcon>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', lineHeight: 1.2 }}>
            Siparişi Özelleştir
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Malzemeleri ve ekmeği pakete göre ayarlayın
          </Typography>
        </Box>
        {pendingMenu.length > 0 && (
          <Alert severity="warning" sx={{ py: 0.5, px: 1.5, fontSize: '0.8rem' }}>
            {pendingMenu.length} menü için döner tipi seçilmedi
          </Alert>
        )}
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" sx={{ color: '#90caf9', display: 'block' }}>Genel Toplam</Typography>
          <Typography sx={{ fontWeight: 900, fontSize: '1.3rem' }}>{total}₺</Typography>
          {calculateBreadCount() > 0 && (
            <Typography variant="caption" sx={{ color: '#fdd835', display: 'block', fontWeight: 700 }}>
              🥖 Ekmek: {calculateBreadCount()} (groups: {groups.length}, ciftLavas: {groups.filter(g => g.hatayBread === 'çift lavaş' || g.klasikBread === 'çift lavaş').length})
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          onPointerDown={(e) => { e.preventDefault(); handleConfirm(); }}
          sx={{
            background: 'linear-gradient(145deg, #66bb6a, #2e7d32)', color: '#fff', fontWeight: 800, px: 4, py: 1.5,
            fontSize: '1rem', borderRadius: 2, ml: 1,
            boxShadow: '0 4px 0 #1b5e20, 0 8px 16px rgba(27,94,32,0.3)',
            '&:hover': { background: 'linear-gradient(145deg, #4caf50, #1b5e20)' },
          }}
        >
          Siparişi Tamamla ✓
        </Button>
      </Box>

      {/* ── Ana İçerik: Sol liste + Sağ editör ── */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', gap: 0 }}>

        {/* Sol: Grup listesi */}
        <Box sx={{
          width: { xs: '100%', md: 340 },
          display: { xs: activeGroupId ? 'none' : 'flex', md: 'flex' },
          flexDirection: 'column',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: '#fbfdff',
          overflow: 'hidden',
        }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#edf6ff' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
              Ürünler & Gruplar
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Özelleştirmek için bir gruba tıklayın
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            <GroupList
              cart={cart}
              groups={groups}
              activeGroupId={activeGroupId}
              onSelect={(gid) => setActiveGroupId(gid)}
            />
          </Box>
        </Box>

        {/* Sağ: Grup editörü */}
        <Box sx={{
          flex: 1,
          display: { xs: activeGroupId ? 'flex' : 'none', md: 'flex' },
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: '#fbfdff',
        }}>
          {activeGroup && activeCartItem ? (
            <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
              <GroupEditor
                group={activeGroup}
                cartItem={activeCartItem}
                totalQtyForItem={groups
                  .filter((g) => g.cartItemId === activeGroup.cartItemId)
                  .reduce((s, g) => s + g.quantity, 0)}
                onChange={handleGroupChange}
                onQtyChange={handleQtyChange}
                onBack={() => setActiveGroupId(null)}
              />
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, color: 'text.secondary' }}>
              <Typography sx={{ fontSize: '3rem' }}>👈</Typography>
              <Typography sx={{ fontWeight: 600 }}>Soldan bir ürün grubunu seçin</Typography>
              <Typography variant="body2">Malzeme ekleyip çıkarabilir veya grubu bölebilirsiniz.</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};

export default CartCustomizationPanel;
