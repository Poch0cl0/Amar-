-- ============================================================
-- Registro emocional + estadísticas mensuales
-- Ejecutar en Supabase → SQL Editor
-- Si la tabla ya existe en tu proyecto WELLNESS KIT,
-- ejecuta solo las secciones de RLS y GRANT que falten.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Enum de emociones
-- ------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'emotion_type') THEN
        CREATE TYPE public.emotion_type AS ENUM (
            'muy_feliz',
            'feliz',
            'calmado',
            'ansioso',
            'triste',
            'muy_triste',
            'agradecido'
        );
    END IF;
END $$;

-- ------------------------------------------------------------
-- 2. Tabla emotion_logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emotion_logs (
    id          UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    emotion     public.emotion_type NOT NULL,
    note        TEXT,
    mood_score  SMALLINT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT emotion_logs_user_id_log_date_key UNIQUE (user_id, log_date),
    CONSTRAINT emotion_logs_mood_score_check CHECK (
        mood_score IS NULL OR (mood_score >= 1 AND mood_score <= 10)
    )
);

CREATE INDEX IF NOT EXISTS idx_emotion_logs_user_date
    ON public.emotion_logs USING btree (user_id, log_date DESC);

DROP TRIGGER IF EXISTS trg_emotion_logs_updated_at ON public.emotion_logs;
CREATE TRIGGER trg_emotion_logs_updated_at
    BEFORE UPDATE ON public.emotion_logs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------
-- 3. Vista emotion_stats
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW public.emotion_stats AS
SELECT
    user_id,
    date_trunc('month', log_date::timestamptz)::date AS month,
    count(*) AS total_entries,
    round(avg(mood_score), 2) AS avg_mood,
    count(*) FILTER (
        WHERE emotion = ANY (ARRAY['muy_feliz'::public.emotion_type, 'feliz'::public.emotion_type])
    ) AS happy_days,
    count(*) FILTER (
        WHERE emotion = ANY (ARRAY['muy_triste'::public.emotion_type, 'triste'::public.emotion_type])
    ) AS sad_days,
    count(*) FILTER (
        WHERE emotion = 'ansioso'::public.emotion_type
    ) AS anxious_days,
    count(*) FILTER (
        WHERE emotion = 'calmado'::public.emotion_type
    ) AS calm_days,
    count(*) FILTER (
        WHERE emotion = 'agradecido'::public.emotion_type
    ) AS grateful_days,
    max(mood_score) AS best_score,
    min(mood_score) AS lowest_score
FROM public.emotion_logs
GROUP BY user_id, date_trunc('month', log_date::timestamptz);

-- ------------------------------------------------------------
-- 4. RLS
-- ------------------------------------------------------------
ALTER TABLE public.emotion_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "emotion_logs: ver propios" ON public.emotion_logs;
CREATE POLICY "emotion_logs: ver propios"
    ON public.emotion_logs FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "emotion_logs: crear propios" ON public.emotion_logs;
CREATE POLICY "emotion_logs: crear propios"
    ON public.emotion_logs FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "emotion_logs: editar propios" ON public.emotion_logs;
CREATE POLICY "emotion_logs: editar propios"
    ON public.emotion_logs FOR UPDATE
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "emotion_logs: eliminar propios" ON public.emotion_logs;
CREATE POLICY "emotion_logs: eliminar propios"
    ON public.emotion_logs FOR DELETE
    USING (user_id = auth.uid());

-- ------------------------------------------------------------
-- 5. GRANT
-- ------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emotion_logs TO authenticated;
GRANT SELECT ON public.emotion_stats TO authenticated;
