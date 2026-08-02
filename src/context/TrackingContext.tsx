import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import {
  PlatformOrder,
  Panel,
  OdemeYontemi,
  DEFAULT_COURIERS,
} from '../types/tracking';

interface AddOrderInput {
  panel: Panel;
  fiyat: number;
  ekmekSayisi: number;
  odemeYontemi: OdemeYontemi;
  kurye?: string | null;
  tarih?: string;
}

interface FormState {
  fiyat: string;
  ekmekSayisi: string;
  odemeYontemi: string;
  kurye: string;
}

interface TrackingContextType {
  orders: PlatformOrder[];
  couriers: string[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  addOrder: (input: AddOrderInput) => void;
  updateOrder: (id: string, updates: Partial<PlatformOrder>) => void;
  deleteOrder: (id: string) => void;
  assignCourier: (id: string, kurye: string) => void;
  getOrdersByDate: (date: string) => PlatformOrder[];
  getOrdersByPanel: (panel: Panel, date: string) => PlatformOrder[];
  getWaitingCourierCount: (date: string) => number;
  addCourier: (name: string) => boolean;
  removeCourier: (name: string) => void;
  getActiveCouriers: () => string[];
  formState: FormState;
  setFormState: (state: FormState) => void;
  resetFormState: () => void;
}

const STORAGE_ORDERS = 'platformOrders';
const STORAGE_COURIERS = 'trackingCouriers';

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

const todayStr = () => format(new Date(), 'yyyy-MM-dd');

const DEFAULT_FORM_STATE: FormState = {
  fiyat: '',
  ekmekSayisi: '',
  odemeYontemi: '',
  kurye: '',
};

export const TrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<PlatformOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_ORDERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [couriers, setCouriers] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_COURIERS);
    return saved ? JSON.parse(saved) : [...DEFAULT_COURIERS];
  });

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  
  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM_STATE);

  useEffect(() => {
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_COURIERS, JSON.stringify(couriers));
  }, [couriers]);

  const addOrder = useCallback((input: AddOrderInput) => {
    const newOrder: PlatformOrder = {
      id: Math.random().toString(36).substr(2, 9),
      panel: input.panel,
      fiyat: input.fiyat,
      ekmekSayisi: input.ekmekSayisi,
      odemeYontemi: input.odemeYontemi,
      kurye: input.kurye ?? null,
      teslimEdildiMi: false,
      ucretAlindiMi: input.odemeYontemi === 'online',
      tarih: input.tarih ?? todayStr(),
      eklenmeZamani: Date.now(),
    };
    setOrders((prev) => [...prev, newOrder]);
  }, []);

  const updateOrder = useCallback((id: string, updates: Partial<PlatformOrder>) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, ...updates } : order))
    );
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  }, []);

  const assignCourier = useCallback((id: string, kurye: string) => {
    updateOrder(id, { kurye });
  }, [updateOrder]);

  const getOrdersByDate = useCallback(
    (date: string) => orders.filter((o) => o.tarih === date),
    [orders]
  );

  const getOrdersByPanel = useCallback(
    (panel: Panel, date: string) =>
      orders.filter((o) => o.panel === panel && o.tarih === date),
    [orders]
  );

  const getWaitingCourierCount = useCallback(
    (date: string) => orders.filter((o) => o.tarih === date && o.kurye === null).length,
    [orders]
  );

  const addCourier = useCallback((name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (couriers.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return false;
    setCouriers((prev) => [...prev, trimmed]);
    return true;
  }, [couriers]);

  const removeCourier = useCallback((name: string) => {
    setCouriers((prev) => prev.filter((c) => c !== name));
  }, []);

  const getActiveCouriers = useCallback(() => couriers, [couriers]);

  const resetFormState = useCallback(() => {
    setFormState(DEFAULT_FORM_STATE);
  }, []);

  return (
    <TrackingContext.Provider
      value={{
        orders,
        couriers,
        selectedDate,
        setSelectedDate,
        addOrder,
        updateOrder,
        deleteOrder,
        assignCourier,
        getOrdersByDate,
        getOrdersByPanel,
        getWaitingCourierCount,
        addCourier,
        removeCourier,
        getActiveCouriers,
        formState,
        setFormState,
        resetFormState,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = (): TrackingContextType => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used within TrackingProvider');
  }
  return context;
};
