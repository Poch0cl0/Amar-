-- Permisos para bloquear usuarios y eliminar frases compartidas recibidas
-- Ejecutar en Supabase → SQL Editor

-- 1. Permitir al destinatario eliminar frases que le enviaron
DROP POLICY IF EXISTS "shared: eliminar recibidas" ON public.shared_phrases;
CREATE POLICY "shared: eliminar recibidas"
    ON public.shared_phrases FOR DELETE
    USING (recipient_id = auth.uid());

GRANT DELETE ON public.shared_phrases TO authenticated;

-- 2. RPC atómico para bloquear (evita fallos de RLS en el cliente)
CREATE OR REPLACE FUNCTION public.block_phrase_sender(p_blocked_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Debes iniciar sesión';
    END IF;

    IF p_blocked_id = auth.uid() THEN
        RAISE EXCEPTION 'No puedes bloquearte a ti mismo';
    END IF;

    INSERT INTO public.blocked_users (blocker_id, blocked_id)
    VALUES (auth.uid(), p_blocked_id)
    ON CONFLICT (blocker_id, blocked_id) DO NOTHING;

    DELETE FROM public.shared_phrases
    WHERE recipient_id = auth.uid()
      AND sender_id = p_blocked_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.block_phrase_sender(UUID) TO authenticated;

-- 3. RPC para listar bloqueados con correo (si aún no existe)
CREATE OR REPLACE FUNCTION public.get_my_blocked_users()
RETURNS TABLE (
    blocked_id   UUID,
    email        TEXT,
    display_name TEXT,
    blocked_at   TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Debes iniciar sesión';
    END IF;

    RETURN QUERY
    SELECT
        bu.blocked_id,
        u.email::TEXT,
        COALESCE(NULLIF(TRIM(p.full_name), ''), p.username, u.email)::TEXT,
        bu.created_at
    FROM public.blocked_users bu
    JOIN auth.users u ON u.id = bu.blocked_id
    JOIN public.profiles p ON p.id = bu.blocked_id
    WHERE bu.blocker_id = auth.uid()
    ORDER BY bu.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_blocked_users() TO authenticated;
