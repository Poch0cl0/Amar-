-- ============================================================
-- Frase del día + frases de usuario + compartición
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1. Estado de frase del día (global invitados + por usuario)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_phrase_state (
    id          SERIAL PRIMARY KEY,
    user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    phrase_date DATE NOT NULL,
    phrase_id   INT NOT NULL REFERENCES public.motivational_phrases(id),
    blocked_ids INT[] NOT NULL DEFAULT '{}',
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS daily_phrase_one_per_user
    ON public.daily_phrase_state (user_id)
    WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS daily_phrase_global
    ON public.daily_phrase_state ((1))
    WHERE user_id IS NULL;

-- ------------------------------------------------------------
-- 2. Frases creadas por usuarios
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_phrases (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    phrase_text TEXT NOT NULL,
    category    TEXT NOT NULL DEFAULT 'general',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_user_phrases_updated_at
    BEFORE UPDATE ON public.user_phrases
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------
-- 3. Frases compartidas entre usuarios
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shared_phrases (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phrase_id     UUID NOT NULL REFERENCES public.user_phrases(id) ON DELETE CASCADE,
    sender_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    shared_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (phrase_id, recipient_id)
);

-- ------------------------------------------------------------
-- 4. RPC: frase del día con rotación 24h
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_daily_phrase()
RETURNS TABLE (
    id         INT,
    phrase_es  TEXT,
    phrase_en  TEXT,
    category   TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id             UUID := auth.uid();
    v_today               DATE := CURRENT_DATE;
    v_state               public.daily_phrase_state%ROWTYPE;
    v_has_state           BOOLEAN := FALSE;
    v_new_phrase_id       INT;
    v_blocked             INT[];
    v_yesterday_phrase_id INT;
    v_candidates          INT[];
BEGIN
    IF v_user_id IS NULL THEN
        SELECT * INTO v_state
        FROM public.daily_phrase_state
        WHERE user_id IS NULL
        LIMIT 1;
    ELSE
        SELECT * INTO v_state
        FROM public.daily_phrase_state
        WHERE user_id = v_user_id
        LIMIT 1;
    END IF;

    v_has_state := FOUND;

    IF v_has_state AND v_state.phrase_date = v_today THEN
        RETURN QUERY
        SELECT mp.id, mp.phrase_es, mp.phrase_en, mp.category
        FROM public.motivational_phrases mp
        WHERE mp.id = v_state.phrase_id;
        RETURN;
    END IF;

    v_yesterday_phrase_id := CASE WHEN v_has_state THEN v_state.phrase_id ELSE NULL END;
    v_blocked := CASE WHEN v_has_state THEN v_state.blocked_ids ELSE '{}' END;

    SELECT ARRAY_AGG(mp.id) INTO v_candidates
    FROM public.motivational_phrases mp
    WHERE mp.is_active = TRUE
      AND NOT (mp.id = ANY(v_blocked));

    IF v_candidates IS NULL OR COALESCE(array_length(v_candidates, 1), 0) = 0 THEN
        v_blocked := '{}';
        SELECT ARRAY_AGG(mp.id) INTO v_candidates
        FROM public.motivational_phrases mp
        WHERE mp.is_active = TRUE;
    END IF;

    IF v_candidates IS NULL OR COALESCE(array_length(v_candidates, 1), 0) = 0 THEN
        RAISE EXCEPTION 'No hay frases activas en motivational_phrases';
    END IF;

    SELECT c INTO v_new_phrase_id
    FROM unnest(v_candidates) AS c
    WHERE v_yesterday_phrase_id IS NULL OR c <> v_yesterday_phrase_id
    ORDER BY random()
    LIMIT 1;

    IF v_new_phrase_id IS NULL THEN
        SELECT c INTO v_new_phrase_id
        FROM unnest(v_candidates) AS c
        ORDER BY random()
        LIMIT 1;
    END IF;

    v_blocked := array_append(v_blocked, v_new_phrase_id);

    IF v_has_state THEN
        UPDATE public.daily_phrase_state dps
        SET phrase_date = v_today,
            phrase_id = v_new_phrase_id,
            blocked_ids = v_blocked,
            updated_at = NOW()
        WHERE dps.id = v_state.id;
    ELSE
        INSERT INTO public.daily_phrase_state (user_id, phrase_date, phrase_id, blocked_ids)
        VALUES (v_user_id, v_today, v_new_phrase_id, v_blocked);
    END IF;

    RETURN QUERY
    SELECT mp.id, mp.phrase_es, mp.phrase_en, mp.category
    FROM public.motivational_phrases mp
    WHERE mp.id = v_new_phrase_id;
END;
$$;

-- ------------------------------------------------------------
-- 5. RPC: buscar usuario por correo (para compartir)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.find_user_by_email(p_email TEXT)
RETURNS TABLE (
    user_id   UUID,
    full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Debes iniciar sesión para compartir frases';
    END IF;

    RETURN QUERY
    SELECT
        p.id,
        COALESCE(NULLIF(TRIM(p.full_name), ''), p.username)::TEXT
    FROM auth.users u
    JOIN public.profiles p ON p.id = u.id
    WHERE LOWER(u.email) = LOWER(TRIM(p_email))
      AND u.id <> auth.uid();
END;
$$;

-- ------------------------------------------------------------
-- 6. RLS
-- ------------------------------------------------------------
ALTER TABLE public.daily_phrase_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_phrases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_phrase: leer propio o global"
    ON public.daily_phrase_state FOR SELECT
    USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "user_phrases: ver propias o compartidas"
    ON public.user_phrases FOR SELECT
    USING (
        author_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.shared_phrases sp
            WHERE sp.phrase_id = user_phrases.id
              AND sp.recipient_id = auth.uid()
        )
    );

CREATE POLICY "user_phrases: crear propias"
    ON public.user_phrases FOR INSERT
    WITH CHECK (author_id = auth.uid());

CREATE POLICY "user_phrases: editar propias"
    ON public.user_phrases FOR UPDATE
    USING (author_id = auth.uid());

CREATE POLICY "user_phrases: eliminar propias"
    ON public.user_phrases FOR DELETE
    USING (author_id = auth.uid());

CREATE POLICY "shared: ver enviadas o recibidas"
    ON public.shared_phrases FOR SELECT
    USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "shared: enviar propias"
    ON public.shared_phrases FOR INSERT
    WITH CHECK (sender_id = auth.uid());

-- Permitir ver el nombre del remitente en frases compartidas
CREATE POLICY "Perfil: ver remitentes de frases compartidas"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.shared_phrases sp
            WHERE sp.sender_id = profiles.id
              AND sp.recipient_id = auth.uid()
        )
    );

-- ------------------------------------------------------------
-- 7. GRANT
-- ------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.motivational_phrases TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.daily_phrase_state TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_phrases TO authenticated;
GRANT SELECT, INSERT ON public.shared_phrases TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_daily_phrase() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.find_user_by_email(TEXT) TO authenticated;

-- ------------------------------------------------------------
-- 8. Límite de 50 palabras en frases de usuario (opcional)
-- Ejecutar si la tabla user_phrases ya existe:
-- ------------------------------------------------------------
-- ALTER TABLE public.user_phrases
--   ADD CONSTRAINT user_phrases_max_50_words CHECK (
--     COALESCE(array_length(regexp_split_to_array(trim(phrase_text), '\s+'), 1), 0) <= 50
--   );
