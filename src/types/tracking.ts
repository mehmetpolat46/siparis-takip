export type Panel = 'getir' | 'sepeti' | 'trendyol' | 'migros' | 'telefon';
export type OdemeYontemi = 'kart' | 'nakit' | 'online';

export interface PlatformOrder {
  id: string;
  panel: Panel;
  fiyat: number;
  ekmekSayisi: number;
  odemeYontemi: OdemeYontemi;
  kurye: string | null;
  teslimEdildiMi: boolean;
  ucretAlindiMi: boolean;
  tarih: string;
  eklenmeZamani: number;
}

export interface PanelConfig {
  id: Panel;
  label: string;
  color: string;
  bgColor: string;
}

export const PANELS: PanelConfig[] = [
  { id: 'getir', label: 'Getir Yemek', color: '#fff', bgColor: '#5D3EBC' },
  { id: 'sepeti', label: 'Yemek Sepeti', color: '#fff', bgColor: '#FA0050' },
  { id: 'trendyol', label: 'Trendyol Yemek', color: '#fff', bgColor: '#F27A1A' },
  { id: 'migros', label: 'Migros Yemek', color: '#fff', bgColor: '#E30613' },
  { id: 'telefon', label: 'Telefon Siparişi', color: '#fff', bgColor: '#2E7D32' },
];

export const ODEME_LABELS: Record<OdemeYontemi, string> = {
  kart: 'Kart',
  nakit: 'Nakit',
  online: 'Online',
};

export const ODEME_COLORS: Record<OdemeYontemi, string> = {
  kart: '#1565C0',
  nakit: '#2E7D32',
  online: '#6A1B9A',
};

export const DEFAULT_COURIERS = ['Berat', 'Durmuş', 'Muhammed'];

export const getPanelConfig = (panel: Panel): PanelConfig =>
  PANELS.find((p) => p.id === panel) ?? PANELS[0];
