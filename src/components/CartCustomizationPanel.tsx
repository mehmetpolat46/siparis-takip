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
  DialogTitle,
  DialogContent,
  DialogActions,
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

// ─── Yardımcı fonksiyonlar ────────────────────────────────────────────────────

const isExempt = (name: string) =>
  name.toLowerCase().includes('porsiyon tako') ||
  name.toLowerCase().includes('pors. tako');

const getProductType = (name: string, category: string): ProductType => {
  const l = name.toLowerCase();
  if (l.includes('hatay')) return 'hatay';
  if (l.includes('klasik') || category === 'Klasik Dönerler') return 'klasik';
  if (category === 'Menüler') return 'menu';
  return 'other';
};

const freshHatayGroup = (item: CartItem, idx: number, qty: number): CartGroup => ({
  groupId: `${item.id}_g${idx}_${Date.now()}`,
  cartItemId: item.id,
  name: item.name,
  basePrice: item.price,
  quantity: qty,
  category: item.category,
  productType: getProductType(item.name, item.category),
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

/** Tek CartItem'dan başlangıç CartGroup'unu oluşturur (tümü tek grup) */
const cartItemToGroup = (item: CartItem): CartGroup => {
  const pType = getProductType(item.name, item.category);
  if (pType === 'hatay')  return freshHatayGroup(item, 0, item.quantity);
  if (pType === 'klasik') return freshKlasikGroup(item, 0, item.quantity);
  if (pType === 'menu')   return freshMenuGroup(item, 0, item.quantity);
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

    if (g.productType === 'hatay' && g.hatayIngredients) {
      ingredients = g.hatayIngredients.map((ig) => ({ name: ig.name, abbr: ig.abbr, active: ig.active }));
    } else if ((g.productType === 'klasik' || g.menuDonerType === 'klasik') && g.klasikIngredients) {
      bread = g.klasikBread;
      ingredients = g.klasikIngredients.map((ig) => ({ name: ig.name, abbr: ig.abbr, active: ig.active }));
    } else if (g.menuDonerType === 'hatay' && g.hatayIngredients) {
      ingredients = g.hatayIngredients.map((ig) => ({ name: ig.name, abbr: ig.abbr, active: ig.active }));
    }

    const unitPrice = g.basePrice + deliveryFeePerUnit(g);
    return {
      groupId: g.groupId,
      name: g.name,
      quantity: g.quantity,
      unitPrice,
      totalPrice: unitPrice * g.quantity,
      productType: g.productType,
      bread,
      ingredients,
    };
  });

  return { receiptNumber, orderType, items, total, timestamp: new Date().toISOString() };
};

// ─── Bileşen Props ────────────────────────────────────────────────────────────

interface CartCustomizationPanelProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  orderType: 'dine-in' | 'delivery';
  onConfirm: (groups: CartGroup[], payload: KitchenPrintPayload) => void;
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
      borderRadius: 2,
      border: `2.5px solid ${color}`,
      bgcolor: active ? color : 'transparent',
      color: active ? activeTextColor : color,
      fontWeight: 700,
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textDecoration: active ? 'none' : 'line-through',
      opacity: active ? 1 : 0.65,
      cursor: 'pointer',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      transition: 'all 0.15s',
    }}
  >
    {name}
  </Box>
);

// ─── Hatay Özelleştirme ───────────────────────────────────────────────────────

const HatayEditor: React.FC<{ group: CartGroup; onChange: (g: CartGroup) => void }> = ({ group, onChange }) => {
  const toggle = (idx: number) => {
    const ings = group.hatayIngredients!.map((ig, i) => i === idx ? { ...ig, active: !ig.active } : ig);
    onChange({ ...group, hatayIngredients: ings });
  };
  return (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 800, color: '#bf360c', textTransform: 'uppercase', letterSpacing: 1 }}>
        🌶️ Hatay İçerik
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
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
      {/* Ekmek */}
      <Typography variant="caption" sx={{ fontWeight: 800, color: '#1565c0', textTransform: 'uppercase', letterSpacing: 1 }}>
        🥖 Ekmek
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, mt: 1, mb: 1.5 }}>
        {(['somun', 'lavaş'] as const).map((b) => (
          <Box
            key={b}
            component="div"
            onPointerDown={(e) => { e.preventDefault(); onChange({ ...group, klasikBread: b }); }}
            sx={{
              minWidth: 100, minHeight: 56, px: 3, borderRadius: 2,
              border: '2.5px solid #1565c0',
              bgcolor: group.klasikBread === b ? '#1565c0' : 'transparent',
              color: group.klasikBread === b ? '#fff' : '#1565c0',
              fontWeight: 800, fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent',
              textTransform: 'capitalize',
            }}
          >
            {b.charAt(0).toUpperCase() + b.slice(1)}
          </Box>
        ))}
      </Box>
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

// ─── Menü Döner Tipi Seçici ───────────────────────────────────────────────────

const MenuEditor: React.FC<{ group: CartGroup; onChange: (g: CartGroup) => void; cartItem: CartItem }> = ({ group, onChange, cartItem }) => {
  const selectType = (type: 'hatay' | 'klasik') => {
    const base: CartGroup = { ...group, menuDonerType: type, productType: 'menu' };
    if (type === 'hatay') {
      base.hatayIngredients = HATAY_DEFAULT.map((ig) => ({ ...ig }));
      base.klasikIngredients = undefined;
      base.klasikBread = undefined;
    } else {
      base.klasikBread = 'somun';
      base.klasikIngredients = KLASIK_DEFAULT.map((ig) => ({ ...ig }));
      base.hatayIngredients = undefined;
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
      group.productType === 'menu');

  const unitPrice = group.basePrice;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ── Başlık ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton
          onPointerDown={(e) => { e.preventDefault(); onBack(); }}
          size="small"
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>
            {group.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {unitPrice}₺/adet
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* ── Adet Sayacı (büyük, dokunmatik) ── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 2, mb: 3, py: 1.5,
        bgcolor: '#f0f4ff', borderRadius: 3, border: '2px solid #c5cae9',
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
        return (
          <Box key={String(item.id)} sx={{ mb: 2 }}>
            {/* Ürün başlığı */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.75, bgcolor: 'grey.100', borderRadius: 1.5, mb: 1 }}>
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
                      {g.klasikBread ? ` (${g.klasikBread})` : ''}
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
  open, onClose, cart, orderType, onConfirm, receiptNumber, total,
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

      const cartItem = cart.find((c) => c.id === source.cartItemId)!;
      const newGroup: CartGroup = {
        ...source,
        groupId: `${source.cartItemId}_g${Date.now()}`,
        quantity: 1,
        // Yeni grup varsayılan (temiz) malzemelerle başlar
        hatayIngredients: source.hatayIngredients ? HATAY_DEFAULT.map((ig) => ({ ...ig })) : undefined,
        klasikIngredients: source.klasikIngredients ? KLASIK_DEFAULT.map((ig) => ({ ...ig })) : undefined,
        menuDonerType: source.menuDonerType,
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

  // Menü ürünleri için döner tipi seçimi eksik mi?
  const pendingMenu = groups.filter((g) => g.productType === 'menu' && !g.menuDonerType);

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
      PaperProps={{ sx: { borderRadius: 0, bgcolor: '#f5f7fa' } }}
    >
      {/* ── Üst AppBar ── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 1.5,
        bgcolor: '#1a237e', color: '#fff', flexShrink: 0,
      }}>
        <IconButton onPointerDown={(e) => { e.preventDefault(); onClose(); }} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', flex: 1 }}>
          🛒 Sepet Özelleştirme
        </Typography>
        {pendingMenu.length > 0 && (
          <Alert severity="warning" sx={{ py: 0.5, px: 1.5, fontSize: '0.8rem' }}>
            {pendingMenu.length} menü için döner tipi seçilmedi
          </Alert>
        )}
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" sx={{ color: '#90caf9', display: 'block' }}>Genel Toplam</Typography>
          <Typography sx={{ fontWeight: 900, fontSize: '1.3rem' }}>{total}₺</Typography>
        </Box>
        <Button
          variant="contained"
          onPointerDown={(e) => { e.preventDefault(); handleConfirm(); }}
          sx={{
            bgcolor: '#43a047', color: '#fff', fontWeight: 800, px: 4, py: 1.5,
            fontSize: '1rem', borderRadius: 2, ml: 1,
            '&:hover': { bgcolor: '#388e3c' },
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
          bgcolor: '#fff',
          overflow: 'hidden',
        }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
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
          bgcolor: '#fff',
        }}>
          {activeGroup && activeCartItem ? (
            <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
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
