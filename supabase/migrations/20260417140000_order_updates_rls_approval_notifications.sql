-- 1) RLS for order_updates: customer can read own visible updates; admin can read/insert all.
ALTER TABLE IF EXISTS public.order_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_updates_select_customer_visible" ON public.order_updates;
DROP POLICY IF EXISTS "order_updates_select_admin" ON public.order_updates;
DROP POLICY IF EXISTS "order_updates_insert_admin" ON public.order_updates;

CREATE POLICY "order_updates_select_admin" ON public.order_updates
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "order_updates_select_customer_visible" ON public.order_updates
  FOR SELECT
  USING (
    is_customer_visible = true
    AND EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = public.order_updates.order_id
        AND o.customer_id = auth.uid()
    )
  );

CREATE POLICY "order_updates_insert_admin" ON public.order_updates
  FOR INSERT
  WITH CHECK (public.is_admin());

-- 2) Minimal order approval flow columns.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
    CREATE TYPE public.approval_status AS ENUM ('pending_approval', 'approved', 'rejected');
  END IF;
END$$;

ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS approval_status public.approval_status NOT NULL DEFAULT 'pending_approval',
  ADD COLUMN IF NOT EXISTS approved_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS approved_by uuid NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason text NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'orders'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.constraint_name = 'orders_approved_by_fkey'
  ) THEN
    -- no-op
  ELSE
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_approved_by_fkey
      FOREIGN KEY (approved_by) REFERENCES public.profiles(id)
      ON DELETE SET NULL;
  END IF;
END$$;

-- 3) Enforce: status in_progress only after approval_status = 'approved'
CREATE OR REPLACE FUNCTION public.validate_order_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'in_progress' AND NEW.approval_status IS DISTINCT FROM 'approved' THEN
    RAISE EXCEPTION 'Order must be approved before moving to in_progress';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF OLD.status = 'pending' AND NEW.status NOT IN ('in_progress', 'cancelled') THEN
      RAISE EXCEPTION 'Invalid order status transition: % -> %', OLD.status, NEW.status;
    ELSIF OLD.status = 'in_progress' AND NEW.status NOT IN ('review', 'revision', 'cancelled') THEN
      RAISE EXCEPTION 'Invalid order status transition: % -> %', OLD.status, NEW.status;
    ELSIF OLD.status = 'review' AND NEW.status NOT IN ('revision', 'completed', 'cancelled') THEN
      RAISE EXCEPTION 'Invalid order status transition: % -> %', OLD.status, NEW.status;
    ELSIF OLD.status = 'revision' AND NEW.status NOT IN ('in_progress', 'review', 'cancelled') THEN
      RAISE EXCEPTION 'Invalid order status transition: % -> %', OLD.status, NEW.status;
    ELSIF OLD.status IN ('completed', 'cancelled') AND NEW.status <> OLD.status THEN
      RAISE EXCEPTION 'Invalid order status transition: % -> %', OLD.status, NEW.status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_order_status_transition_trigger ON public.orders;
CREATE TRIGGER validate_order_status_transition_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_status_transition();

-- 4) Notifications triggers (minimal in-app).
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_admin" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_admin" ON public.notifications;

CREATE POLICY "notifications_select_admin" ON public.notifications
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "notifications_insert_admin" ON public.notifications
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.notify_order_approval_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  msg TEXT;
BEGIN
  IF NEW.approval_status IS DISTINCT FROM OLD.approval_status THEN
    IF NEW.approval_status = 'approved' THEN
      msg := 'Pesananmu telah di-approve.';
    ELSIF NEW.approval_status = 'rejected' THEN
      msg := 'Pesananmu telah di-reject.' || CASE WHEN NEW.rejection_reason IS NOT NULL AND NEW.rejection_reason <> '' THEN ' Alasan: ' || NEW.rejection_reason ELSE '' END;
    ELSE
      msg := 'Status approval pesanan diperbarui.';
    END IF;

    INSERT INTO public.notifications (user_id, type, message, is_read)
    VALUES (NEW.customer_id, 'order_approval', msg, false);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_notify_order_approval_status_change ON public.orders;
CREATE TRIGGER tr_notify_order_approval_status_change
  AFTER UPDATE OF approval_status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_approval_status_change();

CREATE OR REPLACE FUNCTION public.notify_order_update_visible()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  oid uuid;
  cust uuid;
  ordno text;
BEGIN
  IF NEW.is_customer_visible = true THEN
    oid := NEW.order_id;
    SELECT o.customer_id, o.order_number INTO cust, ordno
    FROM public.orders o
    WHERE o.id = oid;

    IF cust IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, message, is_read)
      VALUES (cust, 'order_update', 'Ada update baru dari admin untuk pesanan ' || COALESCE(ordno, '') || '.', false);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_notify_order_update_visible ON public.order_updates;
CREATE TRIGGER tr_notify_order_update_visible
  AFTER INSERT ON public.order_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_update_visible();

