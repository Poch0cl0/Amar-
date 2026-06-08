-- Corrige "column reference id is ambiguous" en get_daily_phrase().
-- Ocurre porque RETURNS TABLE (id ...) declara una variable "id" que
-- choca con daily_phrase_state.id en el UPDATE.

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

GRANT EXECUTE ON FUNCTION public.get_daily_phrase() TO anon, authenticated;
