export enum OrderStatus {
  PENDING = 'PENDING',
  COOKING = 'COOKING',
  SERVED = 'SERVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export enum Role {
  NONE = 'NONE',
  CUSTOMER = 'CUSTOMER',
  CHEF = 'CHEF',
  ADMIN = 'ADMIN'
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Entrees' | 'Grab & Go' | 'Drinks' | 'Snacks' | 'Extras';
  image: string;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  calories?: number;
  protein?: string;
  fats?: string;
  carbs?: string;
  sugar?: string;
  ingredients?: string[];
  allergens?: string[];
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  tableId: number;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  timestamp: number;
  customerNote?: string;
}

export interface ServiceRequest {
  id: string;
  tableId: number;
  type: 'WATER' | 'WAITER' | 'BILL';
  status: 'PENDING' | 'RESOLVED';
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}