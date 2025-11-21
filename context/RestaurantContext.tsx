import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Order, OrderStatus, ServiceRequest, MenuItem, CartItem } from '../types';
import { MENU_ITEMS } from '../constants';

interface RestaurantContextType {
  menu: MenuItem[];
  orders: Order[];
  serviceRequests: ServiceRequest[];
  placeOrder: (tableId: number, items: CartItem[], note?: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  requestService: (tableId: number, type: 'WATER' | 'WAITER' | 'BILL') => void;
  resolveServiceRequest: (requestId: string) => void;
  processRefund: (orderId: string) => void;
  processPayment: (orderId: string) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menu, setMenu] = useState<MenuItem[]>(MENU_ITEMS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);

  const placeOrder = useCallback((tableId: number, cartItems: CartItem[], note?: string) => {
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      tableId,
      items: cartItems.map(item => ({
        menuItemId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: OrderStatus.PENDING,
      timestamp: Date.now(),
      customerNote: note
    };
    setOrders(prev => [...prev, newOrder]);
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  }, []);

  const requestService = useCallback((tableId: number, type: 'WATER' | 'WAITER' | 'BILL') => {
    const newRequest: ServiceRequest = {
      id: Math.random().toString(36).substr(2, 9),
      tableId,
      type,
      status: 'PENDING',
      timestamp: Date.now()
    };
    setServiceRequests(prev => [...prev, newRequest]);
  }, []);

  const resolveServiceRequest = useCallback((requestId: string) => {
    setServiceRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'RESOLVED' } : r));
  }, []);

  const processRefund = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: OrderStatus.CANCELLED } : o));
  }, []);

  const processPayment = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: OrderStatus.PAID } : o));
  }, []);

  const addMenuItem = useCallback((item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    setMenu(prev => [...prev, newItem]);
  }, []);

  const updateMenuItem = useCallback((item: MenuItem) => {
    setMenu(prev => prev.map(i => i.id === item.id ? item : i));
  }, []);

  const deleteMenuItem = useCallback((id: string) => {
    setMenu(prev => prev.filter(i => i.id !== id));
  }, []);

  return (
    <RestaurantContext.Provider value={{
      menu,
      orders,
      serviceRequests,
      placeOrder,
      updateOrderStatus,
      requestService,
      resolveServiceRequest,
      processRefund,
      processPayment,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error("useRestaurant must be used within a RestaurantProvider");
  return context;
};