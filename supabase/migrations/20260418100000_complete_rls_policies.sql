-- Complete RLS policies for CuanPage app
-- Run this to ensure all security policies are in place

-- ==================== PROFILES ====================
-- Enable RLS on profiles
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all profiles (for admin customer list)
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT
  USING (true);

-- Policy: Users can update their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ==================== SERVICES ====================
-- Enable RLS on services
ALTER TABLE IF EXISTS public.services ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read services
DROP POLICY IF EXISTS "services_select_all" ON public.services;
CREATE POLICY "services_select_all" ON public.services
  FOR SELECT
  TO authenticated
  USING (true);

-- ==================== INVOICES ====================
-- Enable RLS on invoices
ALTER TABLE IF EXISTS public.invoices ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can view their own invoices
DROP POLICY IF EXISTS "invoices_select_own" ON public.invoices;
CREATE POLICY "invoices_select_own" ON public.invoices
  FOR SELECT
  USING (customer_id = auth.uid());

-- Policy: Customers can view their invoices via joined order
DROP POLICY IF EXISTS "invoices_select_via_order" ON public.invoices;
CREATE POLICY "invoices_select_via_order" ON public.invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = invoices.order_id
        AND o.customer_id = auth.uid()
    )
  );

-- Policy: Admin can select all invoices
DROP POLICY IF EXISTS "invoices_select_admin" ON public.invoices;
CREATE POLICY "invoices_select_admin" ON public.invoices
  FOR SELECT
  USING (public.is_admin());

-- ==================== ORDERS ====================
-- Ensure orders has RLS and proper policies
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can view their own orders (already exists, verify)
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_order" ON public.orders
  FOR SELECT
  USING (customer_id = auth.uid() OR public.is_admin());

-- ==================== NOTIFICATIONS ====================
-- Already has RLS from previous migration, verify policies exist
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

-- Ensure notifications policies exist and are correct
DROP POLICY IF EXISTS "notifications_select_admin" ON public.notifications;
CREATE POLICY "notifications_select_admin" ON public.notifications
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "notifications_insert_admin" ON public.notifications;
CREATE POLICY "notifications_insert_admin" ON public.notifications
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ==================== PAYMENTS ====================
-- Enable RLS on payments
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can view their own payments
DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT
  USING (customer_id = auth.uid());

-- Policy: Admin can view all payments
DROP POLICY IF EXISTS "payments_select_admin" ON public.payments;
CREATE POLICY "payments_select_admin" ON public.payments
  FOR SELECT
  USING (public.is_admin());

-- ==================== MESSAGES ====================
-- Enable RLS on messages
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages they sent or received
DROP POLICY IF EXISTS "messages_select_own" ON public.messages;
CREATE POLICY "messages_select_own" ON public.messages
  FOR SELECT
  USING (
    sender_id = auth.uid() 
    OR receiver_id = auth.uid()
    OR is_internal = true
    OR public.is_admin()
  );

-- Policy: Users can insert messages
DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() 
    OR public.is_admin()
  );

-- ==================== INVOICE ITEMS ====================
-- Enable RLS on invoice_items
ALTER TABLE IF EXISTS public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can view items from their invoices
DROP POLICY IF EXISTS "invoice_items_select_own" ON public.invoice_items;
CREATE POLICY "invoice_items_select_own" ON public.invoice_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices inv
      WHERE inv.id = invoice_items.invoice_id
        AND (inv.customer_id = auth.uid() OR public.is_admin())
    )
  );