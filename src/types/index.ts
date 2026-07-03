export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface Order {
  id: string;
  date: Date;
  type: 'dine-in' | 'delivery';
  items: OrderItem[];
  total: number;
  phone?: string;
  address?: string;
  paymentType?: 'cash' | 'card';
}

// ─── Malzeme kısaltma sözlüğü ────────────────────────────────────────────────
export const INGREDIENT_ABBR: Record<string, string> = {
  Marul:   'mar',
  Domates: 'dom',
  Turşu:   'tu',
  Soğan:   'soğ',
  Ketçap:  'ket',
  Mayonez: 'may',
  Patates: 'pat',
  Tavuk:   'tvk',
  Sos:     'sos',
};

// ─── Ürün tipi ───────────────────────────────────────────────────────────────
export type ProductType = 'hatay' | 'klasik' | 'menu' | 'other';

// ─── Malzeme ─────────────────────────────────────────────────────────────────
export interface Ingredient {
  name: string;
  abbr: string;
  active: boolean; // false → çıkarıldı → <s>abbr</s>
}

/**
 * CartGroup: Sepetteki bir ürünün özelleştirilmiş ALT GRUBU.
 * Örnek: "6 adet Hatay Döner" → iki CartGroup:
 *   { qty: 3, ingredients: [...standard] }
 *   { qty: 3, ingredients: [...soğansız] }
 *
 * Her CartItem için 1-N adet CartGroup olabilir.
 * CartGroup'ların qty toplamı = CartItem.quantity olmalıdır.
 */
export interface CartGroup {
  groupId: string;
  cartItemId: string | number;
  name: string;
  basePrice: number;
  quantity: number;
  category: string;
  productType: ProductType;
  hatayIngredients?: Ingredient[];
  klasikBread?: 'somun' | 'lavaş';
  klasikIngredients?: Ingredient[];
  menuDonerType?: 'hatay' | 'klasik';
}

// ─── Mutfak yazıcı payload ───────────────────────────────────────────────────
export interface KitchenIngredient {
  name: string;
  abbr: string;
  active: boolean; // false → <s>abbr</s>
}

export interface KitchenPrintItem {
  groupId: string;
  name: string;
  quantity: number;
  unitPrice: number;   // basePrice + extraPrice
  totalPrice: number;  // unitPrice * quantity
  productType: ProductType;
  bread?: string;
  ingredients: KitchenIngredient[];
}

export interface KitchenPrintPayload {
  receiptNumber: number;
  orderType: 'dine-in' | 'delivery';
  items: KitchenPrintItem[];
  total: number;
  timestamp: string;
}

// Legacy alias — bazı bileşenlerde kullanılıyor olabilir
export type CartItemInstance = CartGroup;
export type HatayIngredient = Ingredient;
export type KlasikIngredient = Ingredient;
