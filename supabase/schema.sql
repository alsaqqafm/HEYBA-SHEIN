-- ==============================================================================
-- HEYBA Shein | هيبة شي إن - Production Database Schema (Supabase / PostgreSQL)
-- Includes 11 Tables, RLS Security, Triggers, Atomic RPCs & Storage Setup
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. USERS TABLE (User Profiles & Roles)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN')),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 2. CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. PRODUCTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  old_price NUMERIC(10, 2) CHECK (old_price >= 0),
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. PRODUCT IMAGES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. CARTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. CART ITEMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_cart_product UNIQUE (cart_id, product_id)
);

-- ==============================================================================
-- 7. ORDERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL, -- Format: HEYBA-2026-XXXXXX
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  notes TEXT,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('JEEB', 'KURAIMI')),
  payment_reference TEXT,
  payment_sender_name TEXT,
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (
    status IN (
      'NEW',
      'PENDING_PAYMENT',
      'PAYMENT_CONFIRMED',
      'PREPARING',
      'READY',
      'DELIVERED',
      'COMPLETED',
      'REJECTED',
      'CANCELLED'
    )
  ),
  points_earned INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. ORDER ITEMS TABLE (Snapshot of ordered products)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 9. POINTS TABLE (Customer loyalty audit ledger)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  points INT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('EARNED_ORDER', 'ADMIN_ADDITION', 'ADMIN_DEDUCTION', 'REDEMPTION')),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 10. SETTINGS TABLE (Platform & Payment Configuration)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 11. ORDER STATUS HISTORY TABLE (11th Essential Table: Audit & Timeline Trail)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INITIAL DEFAULT SETTINGS SEED DATA
-- ==============================================================================
INSERT INTO public.settings (key, value) VALUES
('platform_info', '{
  "appName": "HEYBA Shein | هيبة شي إن",
  "phone": "+967 770 000 000",
  "email": "support@heybashein.com",
  "address": "صنعاء - شارع حوبان / عدن - المعلا",
  "currency": "ر.ي",
  "logoUrl": "/logo.svg",
  "invoiceFooter": "شكراً لتسوقك من HEYBA Shein - نتمنى لك تجربة أزياء استثنائية!"
}'::jsonb),
('payment_jeeb', '{
  "enabled": true,
  "accountName": "متجر هيبة شي إن",
  "accountNumber": "770000000",
  "instructions": "قم بالتحويل عبر محفظة جيب إلى الرقم أعلاه وأرفق رقم العملية المرجعي لتأكيد الطلب."
}'::jsonb),
('payment_kuraimi', '{
  "enabled": true,
  "accountName": "شركة هيبة شي إن للتجارة",
  "accountNumber": "12345678",
  "instructions": "قم بالتحويل أو الإيداع عبر حساب الكريمي مُميز أعلاه وأدخل رقم الإشعار المرجعي."
}'::jsonb),
('points_config', '{
  "enabled": true,
  "pointsPerCurrency": 0.1,
  "minOrderForPoints": 1000
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Helper Function: Is User Admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users Table RLS Policies
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Admins full users access" ON public.users FOR ALL USING (public.is_admin());

-- Categories & Products RLS
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin write categories" ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "Public read active products" ON public.products FOR SELECT USING (status = 'active' OR public.is_admin());
CREATE POLICY "Admin write products" ON public.products FOR ALL USING (public.is_admin());

CREATE POLICY "Public read product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admin write product images" ON public.product_images FOR ALL USING (public.is_admin());

-- Carts & Cart Items RLS
CREATE POLICY "Users own cart select" ON public.carts FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users own cart insert" ON public.carts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users own cart update" ON public.carts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users own cart_items select" ON public.cart_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid()) OR public.is_admin()
);
CREATE POLICY "Users own cart_items insert" ON public.cart_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid())
);
CREATE POLICY "Users own cart_items update" ON public.cart_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid())
);
CREATE POLICY "Users own cart_items delete" ON public.cart_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid())
);

-- Orders & Order Items RLS
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin write orders" ON public.orders FOR UPDATE USING (public.is_admin());

CREATE POLICY "Users read own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid()) OR public.is_admin()
);
CREATE POLICY "Users insert own order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid())
);

-- Points RLS
CREATE POLICY "Users read own points" ON public.points FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Admin write points" ON public.points FOR ALL USING (public.is_admin());

-- Settings RLS
CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admin write settings" ON public.settings FOR ALL USING (public.is_admin());

-- Order Status History RLS
CREATE POLICY "Users read own order status history" ON public.order_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_status_history.order_id AND user_id = auth.uid()) OR public.is_admin()
);
CREATE POLICY "Admin insert status history" ON public.order_status_history FOR INSERT WITH CHECK (public.is_admin());

-- ==============================================================================
-- TRIGGER: AUTO-CREATE USER PROFILE ON AUTH.USERS SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'CUSTOMER',
    (NEW.email_confirmed_at IS NOT NULL)
  )
  ON CONFLICT (id) DO UPDATE
  SET email_verified = (NEW.email_confirmed_at IS NOT NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- RPC FUNCTION 1: ATOMIC CHECKOUT & INVENTORY DECREMENT
-- Validates stock, calculates real prices server-side, reduces stock atomically
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_order_atomic(
  p_user_id UUID,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_delivery_address TEXT,
  p_payment_method TEXT,
  p_payment_reference TEXT,
  p_payment_sender_name TEXT,
  p_items JSONB -- Array of { "product_id": "uuid", "quantity": int }
)
RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_subtotal NUMERIC(10,2) := 0;
  v_delivery_fee NUMERIC(10,2) := 1500;
  v_grand_total NUMERIC(10,2) := 0;
  v_points_earned INT := 0;
  v_item JSONB;
  v_product RECORD;
  v_item_total NUMERIC(10,2);
  v_cart_id UUID;
BEGIN
  -- 1. Generate Order Number: HEYBA-2026-XXXXXX
  v_order_number := 'HEYBA-2026-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');

  -- 2. Verify and Calculate Prices from DB (Anti-Tampering)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product FROM public.products
    WHERE id = (v_item->>'product_id')::UUID FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'المنتج غير موجود بالقاعدة: %', (v_item->>'product_id');
    END IF;

    IF v_product.stock_quantity < (v_item->>'quantity')::INT THEN
      RAISE EXCEPTION 'المخزون غير كافٍ للمنتج (%): المتاح % قطعة فقط', v_product.name, v_product.stock_quantity;
    END IF;

    IF v_product.status = 'inactive' THEN
      RAISE EXCEPTION 'المنتج (%) غير متاح حالياً للطلب', v_product.name;
    END IF;

    v_item_total := v_product.price * (v_item->>'quantity')::INT;
    v_subtotal := v_subtotal + v_item_total;
  END LOOP;

  v_grand_total := v_subtotal + v_delivery_fee;
  v_points_earned := FLOOR(v_subtotal * 0.01)::INT; -- 100 YER = 1 Point

  -- 3. Insert Order Record
  INSERT INTO public.orders (
    order_number,
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    delivery_address,
    subtotal,
    discount,
    delivery_fee,
    total,
    payment_method,
    payment_reference,
    payment_sender_name,
    status,
    points_earned
  ) VALUES (
    v_order_number,
    p_user_id,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_delivery_address,
    v_subtotal,
    0,
    v_delivery_fee,
    v_grand_total,
    p_payment_method,
    p_payment_reference,
    p_payment_sender_name,
    'NEW',
    v_points_earned
  ) RETURNING id INTO v_order_id;

  -- 4. Insert Snapshot Order Items & Decrement Inventory Atomically
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product FROM public.products WHERE id = (v_item->>'product_id')::UUID;
    v_item_total := v_product.price * (v_item->>'quantity')::INT;

    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      price,
      quantity,
      total
    ) VALUES (
      v_order_id,
      v_product.id,
      v_product.name,
      v_product.price,
      (v_item->>'quantity')::INT,
      v_item_total
    );

    -- Decrement stock and update status if 0
    UPDATE public.products
    SET
      stock_quantity = stock_quantity - (v_item->>'quantity')::INT,
      status = CASE WHEN (stock_quantity - (v_item->>'quantity')::INT) <= 0 THEN 'out_of_stock' ELSE status END,
      updated_at = NOW()
    WHERE id = v_product.id;
  END LOOP;

  -- 5. Insert Status Audit Record
  INSERT INTO public.order_status_history (
    order_id,
    previous_status,
    new_status,
    notes,
    changed_by
  ) VALUES (
    v_order_id,
    NULL,
    'NEW',
    'تم إنشاء الطلب وتأكيد الدفع بنجاح عبر النظام',
    p_user_id
  );

  -- 6. Clear User Cart
  SELECT id INTO v_cart_id FROM public.carts WHERE user_id = p_user_id;
  IF FOUND THEN
    DELETE FROM public.cart_items WHERE cart_id = v_cart_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total', v_grand_total
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- RPC FUNCTION 2: IDEMPOTENT ORDER STATUS UPDATE & POINTS AWARDING
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.update_order_status_atomic(
  p_order_id UUID,
  p_new_status TEXT,
  p_notes TEXT,
  p_admin_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_old_status TEXT;
  v_points_already_awarded BOOLEAN := FALSE;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود';
  END IF;

  v_old_status := v_order.status;

  -- Update Order Status
  UPDATE public.orders
  SET status = p_new_status, updated_at = NOW()
  WHERE id = p_order_id;

  -- Audit Timeline Log
  INSERT INTO public.order_status_history (
    order_id,
    previous_status,
    new_status,
    notes,
    changed_by
  ) VALUES (
    p_order_id,
    v_old_status,
    p_new_status,
    p_notes,
    p_admin_id
  );

  -- Idempotent Points Awarding: Only award if transition is to COMPLETED and not already awarded
  IF p_new_status = 'COMPLETED' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.points
      WHERE order_id = p_order_id AND type = 'EARNED_ORDER'
    ) INTO v_points_already_awarded;

    IF NOT v_points_already_awarded AND v_order.points_earned > 0 THEN
      INSERT INTO public.points (
        user_id,
        points,
        type,
        order_id,
        description
      ) VALUES (
        v_order.user_id,
        v_order.points_earned,
        'EARNED_ORDER',
        p_order_id,
        'نقاط مكافأة مكتسبة عند اكتمال الطلب رقم ' || v_order.order_number
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'new_status', p_new_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- BOOTSTRAP FIRST ADMIN FUNCTION
-- Securely elevates a specific email to ADMIN role without hardcoding passwords
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(p_email TEXT)
RETURNS TEXT AS $$
BEGIN
  UPDATE public.users
  SET role = 'ADMIN'
  WHERE email = LOWER(p_email);

  IF FOUND THEN
    RETURN 'تم ترقية الحساب ' || p_email || ' إلى صلاحية مدير بنجاح!';
  ELSE
    RETURN 'عذراً، البريد الإلكتروني غير مسجل بعد في جدول المستخدمين.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
