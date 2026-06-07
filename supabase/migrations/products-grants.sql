-- ============================================================
-- Permisos de lectura pública para products
-- ============================================================
-- Error: "permission denied for table products"
--
-- Desactivar RLS NO basta. La API de Supabase usa el rol
-- `anon` (visitantes) o `authenticated` (logueados) y ambos
-- necesitan GRANT explícito sobre la tabla.
--
-- Ejecutar en: Supabase Dashboard → SQL Editor → Run
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.products TO anon, authenticated;

-- Opción recomendada: RLS activo + política de solo lectura pública
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read" ON public.products;

CREATE POLICY "products_public_read"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Verificar (debe devolver filas, no error):
-- SELECT id, name_es, is_active FROM public.products ORDER BY sort_order LIMIT 5;
