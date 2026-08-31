import { getClientSiteUrl } from '@/lib/site-url'
import { createSupabaseClient } from '@/lib/supabase'

export function getPasswordRecoveryRedirectUrl(): string {
  return `${getClientSiteUrl()}/recuperar-contrasena/actualizar`
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  const supabase = createSupabaseClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: getPasswordRecoveryRedirectUrl(),
  })

  if (error) throw error
}

export async function updatePasswordAfterRecovery(password: string): Promise<void> {
  const supabase = createSupabaseClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) throw error
}
