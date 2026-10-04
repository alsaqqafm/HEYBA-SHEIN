-- ==============================================================================
-- HEYBA Shein | هيبة شي إن - Proposed Migration for Order Tracking Entity
-- File: supabase/migrations/20261004_create_order_tracking.sql
-- Status: PROPOSED ONLY (NOT APPLIED TO PRODUCTION SUPABASE)
-- Architecture: Order → Delivery Agent (delivery_agents) → Shipping Company (shipping_companies)
-- ==============================================================================

-- 1. Create order_trackings Table linked to delivery_agents and orders
CREATE TABLE IF NOT EXISTS public.order_trackings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  delivery_agent_id UUID REFERENCES public.delivery_agents(id) ON DELETE SET NULL,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  accuracy NUMERIC(8, 2),
  tracking_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  tracking_status TEXT NOT NULL DEFAULT 'UNAVAILABLE' CHECK (
    tracking_status IN ('PENDING_ASSIGNMENT', 'AWAITING_AGENT', 'AGENT_ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'UNAVAILABLE')
  ),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_order_tracking UNIQUE (order_id)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.order_trackings ENABLE ROW LEVEL SECURITY;

-- 3. RLS Security Policies:
-- A) Customer can ONLY READ tracking data for their own orders
CREATE POLICY "Customer read own order tracking" ON public.order_trackings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_trackings.order_id
      AND orders.user_id = auth.uid()
    ) OR public.is_admin()
  );

-- B) Customers CANNOT INSERT, UPDATE, or DELETE tracking data
-- Only Administrators have write and management permissions
CREATE POLICY "Admin full manage order tracking" ON public.order_trackings
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());
