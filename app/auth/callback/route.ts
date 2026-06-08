import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getSiteUrl } from '@/lib/site-url'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const SUCCESS_PATH = '/auth/confirmado'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const origin = getSiteUrl()

  const supabase = await createSupabaseServerClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${SUCCESS_PATH}`)
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    })
    if (!error) {
      return NextResponse.redirect(`${origin}${SUCCESS_PATH}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
