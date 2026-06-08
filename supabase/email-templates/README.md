# Plantillas de correo AMARÁ (Supabase)

## Confirmación de registro

1. Abre **Supabase → Authentication → Email Templates → Confirm signup**.
2. **Subject:** `Confirma tu cuenta en AMARÁ 🌸`
3. Pega el contenido de `confirm-signup.html` en el cuerpo del correo.
4. Guarda los cambios.

## URLs de redirección (evitar localhost)

En **Authentication → URL Configuration**:

- **Site URL:** `https://amar-gold.vercel.app`
- **Redirect URLs:**
  - `https://amar-gold.vercel.app/**`
  - `http://localhost:3000/**` (solo desarrollo)

## Remitente "AMARÁ" (opcional)

Con el correo por defecto de Supabase el remitente técnico puede seguir siendo `noreply@...`.
Para que aparezca **AMARÁ** como nombre de remitente, configura **SMTP** en Supabase
(por ejemplo Gmail, Resend o SendGrid) con nombre: `AMARÁ`.

## Variable de entorno en Vercel

```
NEXT_PUBLIC_SITE_URL=https://amar-gold.vercel.app
```
