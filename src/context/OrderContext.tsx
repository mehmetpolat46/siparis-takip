import React, { createContext, useContext, useState, useEffect } from 'react';

export interface OrderItem {
  id: string | number;
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
  phone?: string;
  address?: string;
  paymentType?: 'cash' | 'card';
  total: number;
  /** Çift Lavaş seçilen sipariş sayısı (ekstra ekmek adedi) */
  ciftLavasSayisi?: number;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date'>) => string;
  deleteOrder: (id: string) => void;
  getSalesStats: () => {
    totalSales: number;
    totalOrders: number;
    totalDeliveryOrders: number;
    productStats: {
      [key: string]: {
        quantity: number;
        total: number;
        category: string;
      };
    };
  };
  clearOrders: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      return JSON.parse(savedOrders, (key, value) => {
        if (key === 'date') return new Date(value);
        return value;
      });
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order: Omit<Order, 'id' | 'date'>) => {
    const newOrder: Order = {
      ...order,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(),
    };
    setOrders((prev) => [...prev, newOrder]);
    return newOrder.id;
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  };

  const getSalesStats = () => {
    const stats = {
      totalSales: 0,
      totalOrders: orders.length,
      totalDeliveryOrders: 0,
      productStats: {} as {
        [key: string]: {
          quantity: number;
          total: number;
          category: string;
        };
      },
    };

    orders.forEach((order) => {
      stats.totalSales += order.total;
      if (order.type === 'delivery') {
        stats.totalDeliveryOrders++;
      }

      order.items.forEach((item) => {
        if (!stats.productStats[item.name]) {
          stats.productStats[item.name] = {
            quantity: 0,
            total: 0,
            category: item.category,
          };
        }
        stats.productStats[item.name].quantity += item.quantity;
        stats.productStats[item.name].total += item.price * item.quantity;
      });
    });

    return stats;
  };

  const clearOrders = () => {
    setOrders([]);
    localStorage.removeItem('orders');
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, deleteOrder, getSalesStats, clearOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
