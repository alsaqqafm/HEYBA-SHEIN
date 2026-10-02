export type Role = 'CUSTOMER' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  email_verified: boolean;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category_id: string;
  price: number;
  old_price?: number;
  stock_quantity: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  is_featured?: boolean;
  is_new_arrival?: boolean;
  created_at?: string;
  updated_at?: string;
  category?: Category;
  images?: ProductImage[];
}

export interface CartItem {
  id: string;
  cart_id?: string;
  product_id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  created_at?: string;
}

export type OrderStatus =
  | 'NEW'
  | 'PENDING_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type PaymentMethod = 'JEEB' | 'KURAIMI';

export interface OrderItem {
  id: string;
  order_id?: string;
  product_id?: string;
  product_name: string;
  product_image?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  notes?: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  payment_method: PaymentMethod;
  payment_reference?: string;
  payment_sender_name?: string;
  status: OrderStatus;
  points_earned: number;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface PointTransaction {
  id: string;
  user_id: string;
  points: number;
  type: 'EARNED_ORDER' | 'ADMIN_ADDITION' | 'ADMIN_DEDUCTION' | 'REDEMPTION';
  order_id?: string;
  description: string;
  created_at: string;
}

export interface PlatformInfoSettings {
  appName: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  logoUrl: string;
  invoiceFooter: string;
}

export interface PaymentJeebSettings {
  enabled: boolean;
  accountName: string;
  accountNumber: string;
  instructions: string;
}

export interface PaymentKuraimiSettings {
  enabled: boolean;
  accountName: string;
  accountNumber: string;
  instructions: string;
}

export interface PointsConfigSettings {
  enabled: boolean;
  pointsPerCurrency: number;
  minOrderForPoints: number;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  previous_status?: string;
  new_status: string;
  notes?: string;
  changed_by?: string;
  created_at: string;
}
