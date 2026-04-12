-- Row Level Security Policies for CuanPage

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- SERVICES POLICIES (everyone can read, only admin can write)
CREATE POLICY "services_select_all" ON public.services 
  FOR SELECT USING (TRUE);

CREATE POLICY "services_insert_admin" ON public.services 
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "services_update_admin" ON public.services 
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "services_delete_admin" ON public.services 
  FOR DELETE USING (public.is_admin());

-- ORDERS POLICIES
CREATE POLICY "orders_select" ON public.orders 
  FOR SELECT USING (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "orders_insert" ON public.orders 
  FOR INSERT WITH CHECK (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "orders_update" ON public.orders 
  FOR UPDATE USING (public.is_admin());

-- ORDER UPDATES POLICIES
CREATE POLICY "order_updates_select" ON public.order_updates 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_updates.order_id 
      AND (orders.customer_id = auth.uid() OR public.is_admin())
    )
    AND (is_customer_visible = TRUE OR public.is_admin())
  );

CREATE POLICY "order_updates_insert_admin" ON public.order_updates 
  FOR INSERT WITH CHECK (public.is_admin());

-- INVOICES POLICIES
CREATE POLICY "invoices_select" ON public.invoices 
  FOR SELECT USING (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "invoices_insert_admin" ON public.invoices 
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "invoices_update_admin" ON public.invoices 
  FOR UPDATE USING (public.is_admin());

-- INVOICE ITEMS POLICIES
CREATE POLICY "invoice_items_select" ON public.invoice_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND (invoices.customer_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "invoice_items_insert_admin" ON public.invoice_items 
  FOR INSERT WITH CHECK (public.is_admin());

-- PAYMENTS POLICIES
CREATE POLICY "payments_select" ON public.payments 
  FOR SELECT USING (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "payments_insert" ON public.payments 
  FOR INSERT WITH CHECK (customer_id = auth.uid() OR public.is_admin());

-- MESSAGES POLICIES
CREATE POLICY "messages_select" ON public.messages 
  FOR SELECT USING (
    sender_id = auth.uid() OR 
    receiver_id = auth.uid() OR 
    customer_id = auth.uid() OR 
    public.is_admin()
  );

CREATE POLICY "messages_insert" ON public.messages 
  FOR INSERT WITH CHECK (sender_id = auth.uid() OR public.is_admin());

CREATE POLICY "messages_update" ON public.messages 
  FOR UPDATE USING (receiver_id = auth.uid() OR public.is_admin());

-- NOTIFICATIONS POLICIES
CREATE POLICY "notifications_select_own" ON public.notifications 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON public.notifications 
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_admin" ON public.notifications 
  FOR INSERT WITH CHECK (public.is_admin() OR user_id = auth.uid());
