-- Lista de usuarios bloqueados con correo (para sección Frases)
-- Ejecutar en Supabase → SQL Editor

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
