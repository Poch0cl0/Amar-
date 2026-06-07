-- ============================================================
-- Bloqueo de usuarios en frases compartidas
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.blocked_users (
    id          UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    blocker_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT blocked_users_unique_pair UNIQUE (blocker_id, blocked_id),
    CONSTRAINT blocked_users_no_self CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker
    ON public.blocked_users (blocker_id);

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blocked: ver propios" ON public.blocked_users;
CREATE POLICY "blocked: ver propios"
    ON public.blocked_users FOR SELECT
    USING (blocker_id = auth.uid());

DROP POLICY IF EXISTS "blocked: crear propios" ON public.blocked_users;
CREATE POLICY "blocked: crear propios"
    ON public.blocked_users FOR INSERT
    WITH CHECK (blocker_id = auth.uid());

DROP POLICY IF EXISTS "blocked: eliminar propios" ON public.blocked_users;
CREATE POLICY "blocked: eliminar propios"
    ON public.blocked_users FOR DELETE
    USING (blocker_id = auth.uid());

-- ------------------------------------------------------------
-- GRANT
-- ------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocked_users TO authenticated;

DROP POLICY IF EXISTS "blocked: editar propios" ON public.blocked_users;
CREATE POLICY "blocked: editar propios"
    ON public.blocked_users FOR UPDATE
    USING (blocker_id = auth.uid());
