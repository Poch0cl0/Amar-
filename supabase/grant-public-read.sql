-- ============================================================
-- FIX: "permission denied for table motivational_phrases"
-- ============================================================
-- RLS y GRANT son cosas distintas:
--   - RLS  = qué FILAS puede ver cada usuario
--   - GRANT = si el rol puede acceder a la TABLA
--
-- Aunque desactives RLS, sin GRANT la API de Supabase
-- seguirá devolviendo "permission denied".
--
-- Ejecuta TODO este script en: Supabase → SQL Editor → Run
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.motivational_phrases TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.relaxation_music TO anon, authenticated;
GRANT SELECT ON public.relaxation_exercises TO anon, authenticated;
GRANT SELECT ON public.exercise_steps TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.emotion_logs TO authenticated;
GRANT SELECT ON public.emotion_stats TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocked_users TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_sessions TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.chat_messages TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_random_phrase(TEXT) TO anon, authenticated;

-- Verificar que funcionó (debe devolver filas, no error):
-- SELECT id, phrase_es, category FROM public.motivational_phrases LIMIT 3;
-- SELECT id, name_es, is_active FROM public.products ORDER BY sort_order LIMIT 5;
