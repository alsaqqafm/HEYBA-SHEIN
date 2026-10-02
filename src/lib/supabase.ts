import { createClient } from '@supabase/supabase-js';
import type { Product, Category, OrderStatus } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(import.meta.env.VITE_SUPABASE_URL) &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)
  );
};

// ==============================================================================
// AUTH HELPERS
// ==============================================================================
export const apiSignUp = async (name: string, email: string, pass: string) => {
  if (!isSupabaseConfigured()) {
    return { success: true, message: 'تم إنشاء الحساب محلياً في وضع التطوير' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: { name },
    },
  });

  if (error) throw error;
  return { success: true, user: data.user };
};

export const apiSignIn = async (email: string, pass: string) => {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error) throw error;
  return { success: true, user: data.user };
};

export const apiSignOut = async () => {
  if (isSupabaseConfigured()) {
    await supabase.auth.signOut();
  }
};

export const apiResetPassword = async (email: string) => {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/forgot-password`,
  });

  if (error) throw error;
  return { success: true };
};

// ==============================================================================
// PRODUCTS & CATEGORIES DATA HELPERS
// ==============================================================================
export const fetchProductsFromDB = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), images:product_images(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data || [];
};

export const fetchCategoriesFromDB = async (): Promise<Category[]> => {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data || [];
};

// Storage Product Image Upload (Only ADMIN allowed by RLS)
export const uploadProductImage = async (file: File): Promise<string | null> => {
  if (!isSupabaseConfigured()) return null;

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Image Upload Error:', uploadError);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

// ==============================================================================
// ATOMIC ORDER CREATION & STOCK VERIFICATION
// ==============================================================================
export const apiCreateOrderAtomic = async (params: {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: 'JEEB' | 'KURAIMI';
  paymentReference: string;
  paymentSenderName: string;
  items: { product_id: string; quantity: number }[];
}) => {
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      order_number: `HEYBA-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  }

  const { data, error } = await supabase.rpc('create_order_atomic', {
    p_user_id: params.userId,
    p_customer_name: params.customerName,
    p_customer_email: params.customerEmail,
    p_customer_phone: params.customerPhone,
    p_delivery_address: params.deliveryAddress,
    p_payment_method: params.paymentMethod,
    p_payment_reference: params.paymentReference,
    p_payment_sender_name: params.paymentSenderName,
    p_items: params.items,
  });

  if (error) throw error;
  return data;
};

// ==============================================================================
// ORDER STATUS UPDATE & IDEMPOTENT POINTS AWARDING
// ==============================================================================
export const apiUpdateOrderStatusAtomic = async (
  orderId: string,
  newStatus: OrderStatus,
  notes: string,
  adminId: string
) => {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  const { data, error } = await supabase.rpc('update_order_status_atomic', {
    p_order_id: orderId,
    p_new_status: newStatus,
    p_notes: notes,
    p_admin_id: adminId,
  });

  if (error) throw error;
  return data;
};

// ==============================================================================
// POINTS AUDIT HELPERS
// ==============================================================================
export const fetchUserPointsBalance = async (userId: string): Promise<number> => {
  if (!isSupabaseConfigured()) return 250;

  const { data, error } = await supabase
    .from('points')
    .select('points')
    .eq('user_id', userId);

  if (error) return 0;
  return (data || []).reduce((sum, row) => sum + row.points, 0);
};

export const apiAdminAdjustPoints = async (
  userId: string,
  amount: number,
  description: string
) => {
  if (!isSupabaseConfigured()) return { success: true };

  const { data, error } = await supabase.from('points').insert([
    {
      user_id: userId,
      points: amount,
      type: amount >= 0 ? 'ADMIN_ADDITION' : 'ADMIN_DEDUCTION',
      description,
    },
  ]);

  if (error) throw error;
  return data;
};
