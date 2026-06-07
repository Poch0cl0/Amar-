-- ============================================================
-- FIX: "permission denied for table blocked_users" (403)
-- ============================================================
-- La tabla puede existir, pero sin GRANT la API devuelve 403.
-- Ejecuta TODO este script en: Supabase → SQL Editor → Run
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocked_users TO authenticated;

-- RLS recomendado (si no lo tienes aún):
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blocked: ver propios" ON public.blocked_users;
CREATE POLICY "blocked: ver propios"
    ON public.blocked_users FOR SELECT
    USING (blocker_id = auth.uid());

DROP POLICY IF EXISTS "blocked: crear propios" ON public.blocked_users;
CREATE POLICY "blocked: crear propios"
    ON public.blocked_users FOR INSERT
    WITH CHECK (blocker_id = auth.uid());

DROP POLICY IF EXISTS "blocked: editar propios" ON public.blocked_users;
CREATE POLICY "blocked: editar propios"
    ON public.blocked_users FOR UPDATE
    USING (blocker_id = auth.uid());

DROP POLICY IF EXISTS "blocked: eliminar propios" ON public.blocked_users;
CREATE POLICY "blocked: eliminar propios"
    ON public.blocked_users FOR DELETE
    USING (blocker_id = auth.uid());

-- Verificar (debe devolver filas o vacío, no error):
-- SELECT * FROM public.blocked_users LIMIT 3;
