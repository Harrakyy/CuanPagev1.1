-- CuanPage Row Level Security Policies
-- Run this after creating the schema

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROFILES POLICIES
-- ============================================
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admin can read all profiles
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin can update all profiles
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- Users can insert their own profile (for signup)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- SERVICES POLICIES (public read, admin write)
-- ============================================
DROP POLICY IF EXISTS "services_select_all" ON public.services;
DROP POLICY IF EXISTS "services_insert_admin" ON public.services;
DROP POLICY IF EXISTS "services_update_admin" ON public.services;
DROP POLICY IF EXISTS "services_delete_admin" ON public.services;

-- Everyone can read active services
CREATE POLICY "services_select_all" ON public.services
  FOR SELECT USING (is_active = TRUE OR public.is_admin());

-- Only admin can insert services
CREATE POLICY "services_insert_admin" ON public.services
  FOR INSERT WITH CHECK (public.is_admin());

-- Only admin can update services
CREATE POLICY "services_update_admin" ON public.services
  FOR UPDATE USING (public.is_admin());

-- Only admin can delete services
CREATE POLICY "services_delete_admin" ON public.services
  FOR DELETE USING (public.is_admin());

-- ============================================
-- ORDERS POLICIES
-- ============================================
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
DROP POLICY IF EXISTS "orders_select_admin" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_admin" ON public.orders;
DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;

-- Customers can see their own orders
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (customer_id = auth.uid());

-- Admin can see all orders
CREATE POLICY "orders_select_admin" ON public.orders
  FOR SELECT USING (public.is_admin());

-- Only admin can create orders
CREATE POLICY "orders_insert_admin" ON public.orders
  FOR INSERT WITH CHECK (public.is_admin());

-- Only admin can update orders
CREATE POLICY "orders_update_admin" ON public.orders
  FOR UPDATE USING (public.is_admin());

-- ============================================
-- ORDER_UPDATES POLICIES
-- ============================================
DROP POLICY IF EXISTS "order_updates_select_own" ON public.order_updates;
DROP POLICY IF EXISTS "order_updates_select_admin" ON public.order_updates;
DROP POLICY IF EXISTS "order_updates_insert_admin" ON public.order_updates;

-- Customers can see visible updates on their orders
CREATE POLICY "order_updates_select_own" ON public.order_updates
  FOR SELECT USING (
    is_customer_visible = TRUE AND
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_updates.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Admin can see all order updates
CREATE POLICY "order_updates_select_admin" ON public.order_updates
  FOR SELECT USING (public.is_admin());

-- Only admin can create order updates
CREATE POLICY "order_updates_insert_admin" ON public.order_updates
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================
-- INVOICES POLICIES
-- ============================================
DROP POLICY IF EXISTS "invoices_select_own" ON public.invoices;
DROP POLICY IF EXISTS "invoices_select_admin" ON public.invoices;
DROP POLICY IF EXISTS "invoices_insert_admin" ON public.invoices;
DROP POLICY IF EXISTS "invoices_update_admin" ON public.invoices;

-- Customers can see their own invoices
CREATE POLICY "invoices_select_own" ON public.invoices
  FOR SELECT USING (customer_id = auth.uid());

-- Admin can see all invoices
CREATE POLICY "invoices_select_admin" ON public.invoices
  FOR SELECT USING (public.is_admin());

-- Only admin can create invoices
CREATE POLICY "invoices_insert_admin" ON public.invoices
  FOR INSERT WITH CHECK (public.is_admin());

-- Only admin can update invoices
CREATE POLICY "invoices_update_admin" ON public.invoices
  FOR UPDATE USING (public.is_admin());

-- ============================================
-- INVOICE_ITEMS POLICIES
-- ============================================
DROP POLICY IF EXISTS "invoice_items_select_own" ON public.invoice_items;
DROP POLICY IF EXISTS "invoice_items_select_admin" ON public.invoice_items;
DROP POLICY IF EXISTS "invoice_items_insert_admin" ON public.invoice_items;

-- Customers can see items on their invoices
CREATE POLICY "invoice_items_select_own" ON public.invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.customer_id = auth.uid()
    )
  );

-- Admin can see all invoice items
CREATE POLICY "invoice_items_select_admin" ON public.invoice_items
  FOR SELECT USING (public.is_admin());

-- Only admin can create invoice items
CREATE POLICY "invoice_items_insert_admin" ON public.invoice_items
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================
-- PAYMENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
DROP POLICY IF EXISTS "payments_select_admin" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_admin" ON public.payments;

-- Customers can see their own payments
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (customer_id = auth.uid());

-- Admin can see all payments
CREATE POLICY "payments_select_admin" ON public.payments
  FOR SELECT USING (public.is_admin());

-- Only admin can record payments
CREATE POLICY "payments_insert_admin" ON public.payments
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================
-- MESSAGES POLICIES
-- ============================================
DROP POLICY IF EXISTS "messages_select_own" ON public.messages;
DROP POLICY IF EXISTS "messages_select_admin" ON public.messages;
DROP POLICY IF EXISTS "messages_insert" ON public.messages;
DROP POLICY IF EXISTS "messages_update_read" ON public.messages;

-- Users can see messages they sent or received (non-internal)
CREATE POLICY "messages_select_own" ON public.messages
  FOR SELECT USING (
    (sender_id = auth.uid() OR receiver_id = auth.uid()) AND is_internal = FALSE
  );

-- Admin can see all messages including internal
CREATE POLICY "messages_select_admin" ON public.messages
  FOR SELECT USING (public.is_admin());

-- Users can send messages
CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Recipients can mark messages as read
CREATE POLICY "messages_update_read" ON public.messages
  FOR UPDATE USING (receiver_id = auth.uid());

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_admin" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;

-- Users can see their own notifications
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

-- Admin can create notifications for anyone
CREATE POLICY "notifications_insert_admin" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin() OR user_id = auth.uid());

-- Users can update (mark read) their own notifications
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());
