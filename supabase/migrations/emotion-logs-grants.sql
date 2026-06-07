-- ============================================================
-- FIX: "permission denied for table emotion_logs"
--        o "No pudimos cargar tu registro emocional"
-- ============================================================
-- RLS y GRANT son cosas distintas:
--   - RLS  = qué FILAS puede ver cada usuario
--   - GRANT = si el rol puede acceder a la TABLA / VISTA
--
-- Aunque desactives RLS, sin GRANT la API de Supabase
-- seguirá devolviendo "permission denied".
--
-- Ejecuta TODO este script en: Supabase → SQL Editor → Run
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.emotion_logs TO authenticated;
GRANT SELECT ON public.emotion_stats TO authenticated;

-- Si quieres RLS activo (recomendado en producción), descomenta:
-- ALTER TABLE public.emotion_logs ENABLE ROW LEVEL SECURITY;
--
-- DROP POLICY IF EXISTS "emotion_logs: ver propios" ON public.emotion_logs;
-- CREATE POLICY "emotion_logs: ver propios"
--   ON public.emotion_logs FOR SELECT
--   USING (user_id = auth.uid());
--
-- DROP POLICY IF EXISTS "emotion_logs: crear propios" ON public.emotion_logs;
-- CREATE POLICY "emotion_logs: crear propios"
--   ON public.emotion_logs FOR INSERT
--   WITH CHECK (user_id = auth.uid());
--
-- DROP POLICY IF EXISTS "emotion_logs: editar propios" ON public.emotion_logs;
-- CREATE POLICY "emotion_logs: editar propios"
--   ON public.emotion_logs FOR UPDATE
--   USING (user_id = auth.uid());
--
-- DROP POLICY IF EXISTS "emotion_logs: eliminar propios" ON public.emotion_logs;
-- CREATE POLICY "emotion_logs: eliminar propios"
--   ON public.emotion_logs FOR DELETE
--   USING (user_id = auth.uid());

-- Verificar (debe devolver filas, no error):
-- SELECT * FROM public.emotion_logs LIMIT 3;
-- SELECT * FROM public.emotion_stats LIMIT 3;
