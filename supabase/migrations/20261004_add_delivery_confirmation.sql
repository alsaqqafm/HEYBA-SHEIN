-- ==============================================================================
-- HEYBA Shein | هيبة شي إن - Proposed Migration for Customer Delivery Confirmation
-- File: supabase/migrations/20261004_add_delivery_confirmation.sql
-- Status: PROPOSED ONLY (NOT APPLIED TO PRODUCTION SUPABASE)
-- Purpose: Add Customer Delivery Confirmation and Points Eligibility tracking columns to orders table
-- ==============================================================================

-- 1. Add delivery confirmation columns to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_confirmed BOOLEAN,
  ADD COLUMN IF NOT EXISTS delivery_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivery_confirmation_note TEXT,
  ADD COLUMN IF NOT EXISTS delivery_confirmation_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS points_awarded BOOLEAN DEFAULT FALSE;

-- 2. Add validation constraint to prevent notes exceeding reasonable length
ALTER TABLE public.orders
  ADD CONSTRAINT check_delivery_confirmation_note_length 
  CHECK (delivery_confirmation_note IS NULL OR length(delivery_confirmation_note) <= 200);

-- 3. Comment on columns for schema documentation
COMMENT ON COLUMN public.orders.delivery_confirmed IS 'True if customer confirmed receipt, False if customer reported non-receipt, NULL if pending';
COMMENT ON COLUMN public.orders.delivery_confirmed_at IS 'Timestamp when the customer confirmed or reported delivery status';
COMMENT ON COLUMN public.orders.delivery_confirmation_note IS 'Optional short note from customer upon non-receipt report (max 4 words)';
COMMENT ON COLUMN public.orders.points_awarded IS 'True if loyalty points have been credited for this confirmed delivery';
