-- ============================================================
-- Permisos para chat IA (chat_sessions + chat_messages)
-- Ejecutar en Supabase → SQL Editor
-- Las tablas ya deben existir en tu proyecto WELLNESS KIT.
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_sessions TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.chat_messages TO authenticated;

-- ------------------------------------------------------------
-- RLS chat_sessions
-- ------------------------------------------------------------
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_sessions: ver propias" ON public.chat_sessions;
CREATE POLICY "chat_sessions: ver propias"
    ON public.chat_sessions FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "chat_sessions: crear propias" ON public.chat_sessions;
CREATE POLICY "chat_sessions: crear propias"
    ON public.chat_sessions FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "chat_sessions: editar propias" ON public.chat_sessions;
CREATE POLICY "chat_sessions: editar propias"
    ON public.chat_sessions FOR UPDATE
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "chat_sessions: eliminar propias" ON public.chat_sessions;
CREATE POLICY "chat_sessions: eliminar propias"
    ON public.chat_sessions FOR DELETE
    USING (user_id = auth.uid());

-- ------------------------------------------------------------
-- RLS chat_messages
-- ------------------------------------------------------------
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_messages: ver propios" ON public.chat_messages;
CREATE POLICY "chat_messages: ver propios"
    ON public.chat_messages FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "chat_messages: crear propios" ON public.chat_messages;
CREATE POLICY "chat_messages: crear propios"
    ON public.chat_messages FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "chat_messages: eliminar propios" ON public.chat_messages;
CREATE POLICY "chat_messages: eliminar propios"
    ON public.chat_messages FOR DELETE
    USING (user_id = auth.uid());

-- Verificar:
-- SELECT * FROM public.chat_sessions LIMIT 3;
-- SELECT * FROM public.chat_messages LIMIT 3;
