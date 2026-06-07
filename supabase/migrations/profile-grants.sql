-- ============================================================
-- Permisos para perfil + fotos de avatar (profiles + storage)
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- 1) Columnas del perfil
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2) Permisos tabla profiles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles: ver propio" ON public.profiles;
CREATE POLICY "profiles: ver propio"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles: crear propio" ON public.profiles;
CREATE POLICY "profiles: crear propio"
    ON public.profiles FOR INSERT
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles: editar propio" ON public.profiles;
CREATE POLICY "profiles: editar propio"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- 3) Bucket público para avatares (ruta: {user_id}/avatar.ext)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 4) Políticas storage.objects para el bucket avatars
DROP POLICY IF EXISTS "avatars: lectura pública" ON storage.objects;
CREATE POLICY "avatars: lectura pública"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars: subir propio" ON storage.objects;
CREATE POLICY "avatars: subir propio"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "avatars: actualizar propio" ON storage.objects;
CREATE POLICY "avatars: actualizar propio"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "avatars: eliminar propio" ON storage.objects;
CREATE POLICY "avatars: eliminar propio"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
