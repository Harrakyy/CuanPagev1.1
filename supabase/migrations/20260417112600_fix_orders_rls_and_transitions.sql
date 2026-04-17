-- Keep profile trigger aligned with current remote schema (full_name).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_role TEXT;
BEGIN
  normalized_role := CASE
    WHEN COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer') IN ('admin', 'customer') THEN NEW.raw_user_meta_data ->> 'role'
    WHEN NEW.raw_user_meta_data ->> 'role' = 'user' THEN 'customer'
    ELSE 'customer'
  END;

  INSERT INTO public.profiles (id, full_name, email, whatsapp, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'nama', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'whatsapp', NULL),
    normalized_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    whatsapp = COALESCE(EXCLUDED.whatsapp, public.profiles.whatsapp),
    role = CASE
      WHEN public.profiles.role = 'admin' THEN 'admin'
      ELSE EXCLUDED.role
    END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure customer can insert their own order and admin can insert any order.
DROP POLICY IF EXISTS "orders_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_update" ON public.orders;

CREATE POLICY "orders_insert" ON public.orders
  FOR INSERT
  WITH CHECK (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY "orders_update" ON public.orders
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Enforce valid order status transitions in DB.
CREATE OR REPLACE FUNCTION public.validate_order_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
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
