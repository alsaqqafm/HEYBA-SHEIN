export type Role = 'CUSTOMER' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  email_verified: boolean;
  phone?: string;
  whatsapp?: string;
  login_provider?: 'email' | 'whatsapp';
  governorate?: string;
  area?: string;
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
  | 'UNDER_REVIEW'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'PREPARED'
  | 'SENT_TO_SHIPPING'
  | 'WITH_AGENT'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  // Backward compatibility aliases if any:
  | 'PENDING_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'READY';

export interface OrderStatusHistoryItem {
  id: string;
  order_id: string;
  status: OrderStatus;
  status_label: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

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

export interface ShippingCompany {
  id: string;
  name: string;
  logo_url?: string;
  phone: string;
  whatsapp?: string;
  governorate: string;
  area: string;
  address: string;
  latitude?: number;
  longitude?: number;
  status: 'active' | 'inactive';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export type DeliveryAgentStatus = 'available' | 'busy' | 'unavailable' | 'suspended';

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  shipping_company_id: string;
  shipping_company_name: string;
  governorate: string;
  area: string;
  status: DeliveryAgentStatus;
  avatar_url?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_country?: string;
  delivery_governorate?: string;
  delivery_area?: string;
  delivery_address: string;
  recipient_name?: string;
  latitude?: number;
  longitude?: number;
  shipping_company_id?: string;
  shipping_company_name?: string;
  shipping_company_phone?: string;
  shipping_company_whatsapp?: string;
  shipping_company_address?: string;
  delivery_agent_id?: string;
  delivery_agent_name?: string;
  delivery_agent_phone?: string;
  delivery_agent_whatsapp?: string;
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
  order_status_history?: OrderStatusHistoryItem[];
  status_history?: OrderStatusHistoryItem[];
  tracking?: OrderTracking;
  delivery_confirmed?: boolean;
  delivery_confirmed_at?: string;
  delivery_confirmation_note?: string;
  delivery_confirmation_user_id?: string;
  points_awarded?: boolean;
  review?: OrderReview;
}

export interface OrderReview {
  id: string;
  order_id: string;
  user_id: string;
  customer_name: string;
  rating: number; // 1 to 5
  delivery_rating?: number; // 1 to 5
  comment: string;
  created_at: string;
}

export interface OrderTracking {
  id: string;
  order_id: string;
  delivery_agent_id?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  updated_at?: string;
  tracking_enabled: boolean;
  tracking_status: 'PENDING_ASSIGNMENT' | 'AWAITING_AGENT' | 'AGENT_ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'UNAVAILABLE';
  notes?: string;
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
