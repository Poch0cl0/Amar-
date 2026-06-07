import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { buildFullSystemPrompt } from '@/lib/chat-context'
import type { ChatHistoryMessage } from '@/lib/chat'
import type { Lang } from '@/lib/i18n'
import { generateOpenAiReply, getOpenAiConfig } from '@/lib/openai'

/**
 * Chat IA con OpenAI API.
 * Clave en https://platform.openai.com/api-keys — solo servidor (OPENAI_API_KEY).
 */
type ChatRequestBody = {
  sessionId?: string
  message?: string
  history?: ChatHistoryMessage[]
  lang?: Lang
}

function getBearerToken(request: Request): string | null {
  const header = request.headers.get('Authorization')
  if (!header?.startsWith('Bearer ')) return null
  return header.slice(7).trim() || null
}

export async function POST(request: Request) {
  try {
    if (!getOpenAiConfig()) {
      return NextResponse.json(
        {
          error:
            'OPENAI_API_KEY no está configurada. Obtén una clave en https://platform.openai.com/api-keys',
        },
        { status: 500 },
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Faltan variables de Supabase.' }, { status: 500 })
    }

    const token = getBearerToken(request)
    if (!token) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })
    const { data: userData, error: authError } = await supabase.auth.getUser(token)
    if (authError || !userData.user) {
      return NextResponse.json({ error: 'Sesión inválida o expirada.' }, { status: 401 })
    }

    const body = (await request.json()) as ChatRequestBody
    const message = body.message?.trim()
    const history = body.history ?? []
    const lang: Lang = body.lang === 'en' ? 'en' : 'es'

    if (!message) {
      return NextResponse.json({ error: 'Se requiere un mensaje.' }, { status: 400 })
    }

    const systemPrompt = await buildFullSystemPrompt(supabase, userData.user.id, lang)

    const reply = await generateOpenAiReply({
      systemPrompt,
      history,
      message,
    })

    return NextResponse.json(reply)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno del servidor de chat.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
