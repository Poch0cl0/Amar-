# Autenticación Supabase

El registro crea la cuenta e inicia sesión de inmediato (sin verificación por correo).

## Configuración requerida en Supabase

1. **Authentication → Providers → Email**
2. Desactivar **Confirm email** (Enable email confirmations)
3. Guardar cambios

Si existía un **Send Email Hook**, desactívalo o elimínalo en **Authentication → Hooks**.

## Error 500 al registrarse

Si ves `POST .../auth/v1/signup 500 (Internal Server Error)`, casi siempre es porque Supabase
sigue intentando enviar un correo o llamar al hook que ya no existe en la app.

**Solución:**

1. **Authentication → Hooks → Send Email** → desactivar o eliminar el hook.
2. **Authentication → Providers → Email** → desactivar **Confirm email**.
3. Guardar y volver a intentar el registro.

También revisa **Authentication → Emails → SMTP Settings**: si hay SMTP mal configurado,
desactívalo o corrígelo (la app ya no envía correos de verificación).

## Recuperación de contraseña

La app envía un correo con enlace a `/recuperar-contrasena/actualizar` usando
`supabase.auth.resetPasswordForEmail`.

### Configuración requerida en Supabase

1. **Authentication → URL Configuration**
   - **Site URL:** `https://amar-gold.vercel.app`
   - **Redirect URLs:** incluir
     - `https://amar-gold.vercel.app/recuperar-contrasena/actualizar`
     - `http://localhost:3000/recuperar-contrasena/actualizar`
     - `https://amar-gold.vercel.app/**`
     - `http://localhost:3000/**`

2. **Authentication → Emails → Reset password**
   - Verifica que la plantilla de recuperación esté activa.
   - Si usas SMTP propio, configúralo en **SMTP Settings**.

3. El usuario recibe el correo, abre el enlace y define su nueva contraseña en Amará.

## Redirect URLs (opcional)

**Authentication → URL Configuration**:

- **Site URL:** `https://amar-gold.vercel.app`
- **Redirect URLs:** `https://amar-gold.vercel.app/**`, `http://localhost:3000/**`
