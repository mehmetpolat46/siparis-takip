import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, IconButton, Typography, TextField,
  Paper, Fab, Chip, Zoom,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { CartItem } from '../types';

// ─── Ürün listesi ─────────────────────────────────────────────────────────────
export interface AProduct {
  id: string | number;
  name: string;
  price: number;
  category: string;
}

export const ALL_PRODUCTS: AProduct[] = [
  { id: 1,  name: 'Hatay Eko Döner',             price: 150, category: 'Hatay Usulü Dönerler' },
  { id: 2,  name: 'Hatay Normal Döner',           price: 170, category: 'Hatay Usulü Dönerler' },
  { id: 3,  name: 'Hatay Maksi Döner',            price: 220, category: 'Hatay Usulü Dönerler' },
  { id: 4,  name: 'Hatay Usulü ET Eko Döner',     price: 230, category: 'Hatay Usulü Dönerler' },
  { id: 5,  name: 'Hatay Usulü ET Normal Döner',  price: 270, category: 'Hatay Usulü Dönerler' },
  { id: 6,  name: 'Hatay Usulü ET Maksi Döner',   price: 330, category: 'Hatay Usulü Dönerler' },
  { id: 6725, name: 'Mercimek Çorbası',           price: 90,  category: 'Hatay Usulü Dönerler' },
  { id: 'hud-lavas', name: 'Ekstra Lavaş',        price: 15,  category: 'Hatay Usulü Dönerler' },
  { id: 7,  name: 'Klasik Eko Döner',             price: 150, category: 'Klasik Dönerler' },
  { id: 8,  name: 'Klasik Normal Döner',          price: 170, category: 'Klasik Dönerler' },
  { id: 9,  name: 'Klasik ET Eko Döner',          price: 230, category: 'Klasik Dönerler' },
  { id: 10, name: 'Klasik ET Normal Döner',       price: 270, category: 'Klasik Dönerler' },
  { id: 11, name: 'Tekli Tako',                   price: 120, category: 'Takolar' },
  { id: 12, name: 'İkili Tako',                   price: 220, category: 'Takolar' },
  { id: 13, name: 'ET Tekli Tako',                price: 160, category: 'Takolar' },
  { id: 14, name: 'ET İkili Tako',                price: 300, category: 'Takolar' },
  { id: 15, name: 'Karışık Combo Tako',           price: 230, category: 'Takolar' },
  { id: 16, name: 'TAVUK Döner Porsiyon',         price: 240, category: 'Porsiyonlar' },
  { id: 17, name: 'Pilav Üstü Porsiyon',          price: 270, category: 'Porsiyonlar' },
  { id: 18, name: 'ET Döner Porsiyon',            price: 360, category: 'Porsiyonlar' },
  { id: 19, name: 'Pilav Üstü ET Döner Porsiyon', price: 380, category: 'Porsiyonlar' },
  { id: 20, name: 'TAVUK Menü',                   price: 260, category: 'Menüler' },
  { id: 21, name: 'ET Döner Menü',                price: 330, category: 'Menüler' },
  { id: 22, name: 'Ayran',                        price: 50,  category: 'İçecekler & Atıştırmalık' },
  { id: 23, name: 'Kutu İçecekler',               price: 70,  category: 'İçecekler & Atıştırmalık' },
  { id: 24, name: 'Şalgam',                       price: 50,  category: 'İçecekler & Atıştırmalık' },
  { id: 25, name: 'Soda',                         price: 35,  category: 'İçecekler & Atıştırmalık' },
  { id: 26, name: 'Su',                           price: 15,  category: 'İçecekler & Atıştırmalık' },
  { id: 27, name: 'Külahta Patates Kızartması',   price: 70,  category: 'İçecekler & Atıştırmalık' },
  { id: 28, name: 'Antep Usulü Katmer Tatlısı',   price: 180, category: 'İçecekler & Atıştırmalık' },
  { id: 29, name: '1 LT Kola',                    price: 90,  category: 'İçecekler & Atıştırmalık' },
  { id: 30, name: '1 LT Ayran',                   price: 90,  category: 'İçecekler & Atıştırmalık' },
  { id: 31, name: '2,5 LT Kola',                  price: 120, category: 'İçecekler & Atıştırmalık' },
  { id: 'drink-2', name: 'Servis Patates',        price: 90,  category: 'İçecekler & Atıştırmalık' },
];

// ─── Yardımcılar ──────────────────────────────────────────────────────────────
const TR_NUMBERS: Record<string, number> = {
  bir: 1, iki: 2, üç: 3, dört: 4, beş: 5,
  alti: 6, yedi: 7, sekiz: 8, dokuz: 9, on: 10,
};

const normalize = (s: string) =>
  s.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').trim();

const findProduct = (text: string): AProduct | null => {
  const t = normalize(text);
  let best = 0; let found: AProduct | null = null;
  for (const p of ALL_PRODUCTS) {
    const pTokens = normalize(p.name).split(/\s+/);
    const tTokens = t.split(/\s+/);
    let score = 0;
    for (const pt of pTokens) {
      if (pt.length < 3) continue;
      for (const tt of tTokens) { if (tt.includes(pt) || pt.includes(tt)) score++; }
    }
    if (score > best) { best = score; found = p; }
  }
  return best >= 1 ? found : null;
};

const extractQty = (text: string): number => {
  const t = normalize(text);
  const m = t.match(/\d+/);
  if (m) return Math.min(parseInt(m[0], 10), 99);
  for (const [w, v] of Object.entries(TR_NUMBERS)) {
    if (v > 0 && t.includes(normalize(w))) return v;
  }
  return 1;
};

// ─── Mesaj tipi ───────────────────────────────────────────────────────────────
interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  chips?: string[];
}

// ─── Konuşma state (bekleme modları) ─────────────────────────────────────────
type WaitMode =
  | null
  | { type: 'awaitPhone' }
  | { type: 'awaitAddress'; phone: string }
  | { type: 'awaitPayment' };

// ─── Props ────────────────────────────────────────────────────────────────────
export interface VoiceOrderAssistantProps {
  cart: CartItem[];
  onAddToCart: (product: AProduct, qty: number) => void;
  onRemoveFromCart: (id: string | number) => void;
  onClearCart: () => void;
  getTotal: () => number;
  orderType: 'dine-in' | 'delivery';
  // delivery alanları
  phone: string;
  address: string;
  paymentType: 'cash' | 'card';
  onSetPhone: (v: string) => void;
  onSetAddress: (v: string) => void;
  onSetPayment: (v: 'cash' | 'card') => void;
  onOpenCustomization: () => void; // sepet onay → CartCustomizationPanel'i aç
}

// ─── Speech API tipleri ───────────────────────────────────────────────────────
interface ISRResult { transcript: string }
interface ISRResultList { [i: number]: { [j: number]: ISRResult }; length: number }
interface ISREvent extends Event { results: ISRResultList }
interface ISR extends EventTarget {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((e: ISREvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void;
}
declare global {
  interface Window {
    SpeechRecognition: new () => ISR;
    webkitSpeechRecognition: new () => ISR;
  }
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
const VoiceOrderAssistant: React.FC<VoiceOrderAssistantProps> = ({
  cart, onAddToCart, onRemoveFromCart, onClearCart, getTotal,
  orderType, phone, address, paymentType,
  onSetPhone, onSetAddress, onSetPayment, onOpenCustomization,
}) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: 0, role: 'assistant',
    text: 'Merhaba! Ben sipariş asistanınızım 🍽️\nÜrün ekleyebilir, telefon/adres kaydedebilir ve siparişi yazıcıya gönderebilirim.\n\nNe yapmamı istersiniz?',
    chips: ['Sepet nerede?', 'Telefon kaydet', 'Yazıcıya gönder'],
  }]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [waitMode, setWaitMode] = useState<WaitMode>(null);
  const recognitionRef = useRef<ISR | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgId = useRef(1);

  useEffect(() => {
    setSpeechSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMsg = useCallback((msg: Omit<Message, 'id'>) => {
    setMessages(prev => [...prev, { ...msg, id: msgId.current++ }]);
  }, []);

  // ─── Komut motoru ──────────────────────────────────────────────────────────
  const handleCommand = useCallback((raw: string) => {
    if (!raw.trim()) return;
    addMsg({ role: 'user', text: raw });
    const t = normalize(raw);

    // ── Bekleme modları ────────────────────────────────────────────────────
    if (waitMode?.type === 'awaitPhone') {
      const digits = raw.replace(/\D/g, '');
      if (digits.length >= 10) {
        onSetPhone(digits);
        setWaitMode({ type: 'awaitAddress', phone: digits });
        addMsg({ role: 'assistant', text: `📞 Telefon kaydedildi: ${digits}\n\nŞimdi adresi söyleyin ya da yazın.` });
      } else {
        addMsg({ role: 'assistant', text: '⚠️ Geçerli bir telefon numarası giremedim. En az 10 rakam olmalı. Tekrar deneyin.' });
      }
      return;
    }

    if (waitMode?.type === 'awaitAddress') {
      onSetAddress(raw.trim());
      // localStorage'a kaydet
      const saved = JSON.parse(localStorage.getItem('savedPhones') || '{}');
      saved[waitMode.phone] = { address: raw.trim() };
      localStorage.setItem('savedPhones', JSON.stringify(saved));
      setWaitMode(null);
      addMsg({
        role: 'assistant',
        text: `🏠 Adres kaydedildi!\n📞 ${waitMode.phone}\n🏠 ${raw.trim()}\n\nMüşteri bilgileri hazır. Ödeme tipi ne olacak?`,
        chips: ['Nakit', 'Kart'],
      });
      return;
    }

    if (waitMode?.type === 'awaitPayment') {
      if (t.includes('nakit') || t.includes('kash') || t === 'n') {
        onSetPayment('cash');
        setWaitMode(null);
        addMsg({ role: 'assistant', text: '✅ Ödeme tipi: Nakit olarak ayarlandı.' });
      } else if (t.includes('kart') || t.includes('card') || t === 'k') {
        onSetPayment('card');
        setWaitMode(null);
        addMsg({ role: 'assistant', text: '✅ Ödeme tipi: Kart olarak ayarlandı.' });
      } else {
        addMsg({ role: 'assistant', text: '⚠️ "Nakit" veya "Kart" deyin lütfen.', chips: ['Nakit', 'Kart'] });
      }
      return;
    }

    // ── Sepet sorgula ──────────────────────────────────────────────────────
    if (t.includes('sepet') || t.includes('ne var') || t.includes('liste')) {
      if (cart.length === 0) {
        addMsg({ role: 'assistant', text: '🛒 Sepetiniz şu an boş.', chips: ['Hatay Normal Döner ekle', '2 ayran ekle'] });
      } else {
        const lines = cart.map(c => `• ${c.quantity}x ${c.name} — ${c.price * c.quantity}₺`).join('\n');
        addMsg({ role: 'assistant', text: `🛒 Sepetiniz:\n${lines}\n\nToplam: ${getTotal()}₺`, chips: ['Yazıcıya gönder', 'Sepeti temizle'] });
      }
      return;
    }

    // ── Toplam ────────────────────────────────────────────────────────────
    if (t.includes('toplam') || t.includes('tutar') || t.includes('ne kadar') || t.includes('fiyat')) {
      addMsg({ role: 'assistant', text: `💰 Sepet toplamı: ${getTotal()}₺` });
      return;
    }

    // ── Sepeti temizle ────────────────────────────────────────────────────
    if (t.includes('temizle') || t.includes('bosalt') || t.includes('sifirla') || t.includes('hepsini sil')) {
      onClearCart();
      addMsg({ role: 'assistant', text: '🗑️ Sepet temizlendi.' });
      return;
    }

    // ── Yazıcıya gönder / onayla ──────────────────────────────────────────
    if (
      t.includes('yazici') || t.includes('yazıcı') || t.includes('yazdir') ||
      t.includes('gonder') || t.includes('onayla') || t.includes('tamamla') ||
      t.includes('fis') || t.includes('fiş') || t.includes('print')
    ) {
      if (cart.length === 0) {
        addMsg({ role: 'assistant', text: '⚠️ Sepetiniz boş. Önce ürün ekleyin.' });
      } else {
        addMsg({ role: 'assistant', text: '🖨️ Özelleştirme paneli açılıyor...' });
        onOpenCustomization();
      }
      return;
    }

    // ── Telefon kaydet ────────────────────────────────────────────────────
    if (
      t.includes('telefon') || t.includes('numara') || t.includes('musteri') ||
      t.includes('kaydet') || t.includes('adres')
    ) {
      setWaitMode({ type: 'awaitPhone' });
      addMsg({ role: 'assistant', text: '📞 Müşterinin telefon numarasını söyleyin ya da yazın.' });
      return;
    }

    // ── Ödeme tipi ────────────────────────────────────────────────────────
    if (t.includes('odeme') || t.includes('ödeme') || t.includes('nakit') || t.includes('kart')) {
      if (t.includes('nakit')) { onSetPayment('cash'); addMsg({ role: 'assistant', text: '✅ Ödeme tipi: Nakit.' }); return; }
      if (t.includes('kart'))  { onSetPayment('card');  addMsg({ role: 'assistant', text: '✅ Ödeme tipi: Kart.' }); return; }
      setWaitMode({ type: 'awaitPayment' });
      addMsg({ role: 'assistant', text: 'Ödeme tipi ne olacak?', chips: ['Nakit', 'Kart'] });
      return;
    }

    // ── Ürün çıkar ────────────────────────────────────────────────────────
    if (t.includes('cikar') || t.includes('kaldir') || t.includes('iptal') || t.includes('sil')) {
      const p = findProduct(raw);
      if (p) {
        const inCart = cart.find(c => c.id === p.id);
        if (inCart) {
          onRemoveFromCart(p.id);
          addMsg({ role: 'assistant', text: `🗑️ "${p.name}" sepetten çıkarıldı.` });
        } else {
          addMsg({ role: 'assistant', text: `⚠️ "${p.name}" zaten sepette yok.` });
        }
        return;
      }
    }

    // ── Ürün ekle ─────────────────────────────────────────────────────────
    const p = findProduct(raw);
    if (p) {
      const qty = extractQty(raw);
      onAddToCart(p, qty);
      addMsg({
        role: 'assistant',
        text: `✅ Sepete eklendi!`,
        chips: [`${qty}x ${p.name} — ${p.price * qty}₺`],
      });
      return;
    }

    // ── Anlaşılamadı ──────────────────────────────────────────────────────
    addMsg({
      role: 'assistant',
      text: `🤔 Tam anlayamadım. Şunları yapabilirim:`,
      chips: ['2 hatay normal döner', 'Telefon kaydet', 'Sepeti göster', 'Yazıcıya gönder', 'Sepeti temizle'],
    });
  }, [waitMode, cart, onAddToCart, onRemoveFromCart, onClearCart, getTotal,
      onSetPhone, onSetAddress, onSetPayment, onOpenCustomization, addMsg]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    handleCommand(inputText.trim());
    setInputText('');
  };

  const toggleListening = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = 'tr-TR'; r.continuous = false; r.interimResults = false;
    r.onresult = (e: ISREvent) => { handleCommand(e.results[0][0].transcript); };
    r.onerror = () => setIsListening(false);
    r.onend   = () => setIsListening(false);
    recognitionRef.current = r;
    r.start(); setIsListening(true);
  };

  const accent = orderType === 'delivery' ? '#1976d2' : '#d32f2f';

  return (
    <>
      <Zoom in={open}>
        <Paper elevation={8} sx={{
          position: 'fixed', bottom: 90, left: 24,
          width: 370, height: 540,
          display: open ? 'flex' : 'none',
          flexDirection: 'column', borderRadius: 3, overflow: 'hidden', zIndex: 1300,
        }}>
          {/* Başlık */}
          <Box sx={{ px: 2, py: 1.5, bgcolor: accent, color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToyIcon />
            <Typography sx={{ fontWeight: 700, flex: 1, fontSize: '0.95rem' }}>Sipariş Asistanı</Typography>
            {orderType === 'delivery' && phone && (
              <Typography sx={{ fontSize: '0.75rem', opacity: 0.85 }}>📞 {phone.slice(-4)}</Typography>
            )}
            <IconButton size="small" sx={{ color: '#fff' }} onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Mesajlar */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5, bgcolor: '#f5f7fa' }}>
            {messages.map(msg => (
              <Box key={msg.id} sx={{ display: 'flex', flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', mb: 1 }}>
                <Box sx={{
                  maxWidth: '85%', px: 1.5, py: 1,
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  bgcolor: msg.role === 'user' ? accent : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#000',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}>
                  <Typography sx={{ fontSize: '0.83rem', whiteSpace: 'pre-line' }}>{msg.text}</Typography>
                </Box>
                {msg.chips && msg.chips.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5, maxWidth: '90%' }}>
                    {msg.chips.map((c, i) => (
                      <Chip key={i} label={c} size="small" clickable
                        onClick={() => handleCommand(c)}
                        sx={{ fontSize: '0.75rem', bgcolor: '#e8eaf6', fontWeight: 600 }} />
                    ))}
                  </Box>
                )}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Giriş */}
          <Box sx={{ px: 1.5, py: 1, borderTop: '1px solid #e0e0e0', bgcolor: '#fff',
            display: 'flex', alignItems: 'center', gap: 1 }}>
            {speechSupported && (
              <IconButton onClick={toggleListening} size="small" sx={{
                color: isListening ? '#fff' : accent,
                bgcolor: isListening ? accent : 'transparent',
                border: `1px solid ${accent}`,
              }}>
                {isListening ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
            )}
            <TextField fullWidth size="small"
              placeholder={waitMode ? 'Cevabınızı yazın...' : 'Komut yazın...'}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, fontSize: '0.85rem' } }}
            />
            <IconButton onClick={handleSend} disabled={!inputText.trim()} size="small" sx={{ color: accent }}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Zoom>

      <Fab onClick={() => setOpen(v => !v)} sx={{
        position: 'fixed', bottom: 24, left: 24,
        bgcolor: accent, color: '#fff', zIndex: 1300,
        '&:hover': { bgcolor: accent, filter: 'brightness(0.9)' },
      }}>
        {open ? <CloseIcon /> : <SmartToyIcon />}
      </Fab>
    </>
  );
};

export default VoiceOrderAssistant;
