import type { Lang } from '@/lib/i18n'
import { createSupabaseClient } from '@/lib/supabase'

export type ChatRole = 'user' | 'assistant'

export type ChatSession = {
  id: string
  user_id: string
  title: string | null
  created_at: string
  updated_at: string
}

export type ChatMessage = {
  id: string
  session_id: string
  user_id: string
  role: ChatRole
  content: string
  tokens_used: number | null
  created_at: string
}

export type ChatHistoryMessage = {
  role: ChatRole
  content: string
}

/** @deprecated Usa ChatHistoryMessage */
export type DeepSeekHistoryMessage = ChatHistoryMessage

export const CHAT_SYSTEM_PROMPT_ES =
  'Eres el asistente de bienestar de Amará. Ayudas con bienestar emocional, estrés y ansiedad. Eres cálido, empático y positivo. Puedes guiar ejercicios de respiración, sugerir frases motivadoras y acompañar emocionalmente. ' +
  'FORMATO OBLIGATORIO: responde solo en texto plano, sin markdown, sin asteriscos, sin guiones de lista ni símbolos de formato. ' +
  'Escribe párrafos cortos y claros. Si das pasos, pon cada paso en su propio párrafo empezando con "1.", "2.", etc., seguido de una frase natural. ' +
  'Separa ideas con líneas en blanco. Responde en español de forma breve y amable. ' +
  'Tienes acceso al catálogo real de Amará (productos, música, ejercicios) y al progreso emocional de la usuaria; úsalos para personalizar tus recomendaciones.'

export const CHAT_SYSTEM_PROMPT_EN =
  'You are Amará\'s wellness assistant. You help with emotional well-being, stress and anxiety. You are warm, empathetic and positive. You can guide breathing exercises, suggest motivational phrases and provide emotional support. ' +
  'MANDATORY FORMAT: reply in plain text only, no markdown, no asterisks, no bullet dashes or formatting symbols. ' +
  'Write short, clear paragraphs. If you give steps, put each step in its own paragraph starting with "1.", "2.", etc., followed by a natural sentence. ' +
  'Separate ideas with blank lines. Respond in English briefly and kindly. ' +
  'You have access to Amará\'s real catalog (products, music, exercises) and the user\'s emotional progress; use them to personalize recommendations.'

export function getChatSystemPrompt(lang: Lang): string {
  return lang === 'en' ? CHAT_SYSTEM_PROMPT_EN : CHAT_SYSTEM_PROMPT_ES
}

export function isUserMessage(role: string): role is 'user' {
  return role.toLowerCase() === 'user'
}

export type QuickSuggestion = {
  id: string
  labelKey: string
  messageKey: string
}

export const QUICK_SUGGESTIONS: QuickSuggestion[] = [
  { id: 'breathe', labelKey: 'suggestionBreathe', messageKey: 'suggestionBreatheMsg' },
  { id: 'anxiety', labelKey: 'suggestionAnxiety', messageKey: 'suggestionAnxietyMsg' },
  { id: 'phrase', labelKey: 'suggestionPhrase', messageKey: 'suggestionPhraseMsg' },
  { id: 'relax', labelKey: 'suggestionRelax', messageKey: 'suggestionRelaxMsg' },
]

export function buildChatMessages(
  history: ChatHistoryMessage[],
  systemPrompt: string,
): { role: string; content: string }[] {
  return [
    { role: 'system', content: systemPrompt },
    ...history.map((msg) => ({ role: msg.role, content: msg.content })),
  ]
}

export function deriveSessionTitle(message: string, maxLength = 40): string {
  const trimmed = message.trim().replace(/\s+/g, ' ')
  if (!trimmed) return 'Nueva conversación'
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength).trim()}…`
}

export async function fetchUserSessions(userId: string): Promise<ChatSession[]> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as ChatSession[]
}

export async function createSession(userId: string, title = 'Nueva conversación'): Promise<ChatSession> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ user_id: userId, title })
    .select('*')
    .single()

  if (error) throw error
  return data as ChatSession
}

export async function fetchSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as ChatMessage[]
}

export async function saveMessage(input: {
  sessionId: string
  userId: string
  role: ChatRole
  content: string
  tokensUsed?: number | null
}): Promise<ChatMessage> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: input.sessionId,
      user_id: input.userId,
      role: input.role,
      content: input.content,
      tokens_used: input.tokensUsed ?? null,
    })
    .select('*')
    .single()

  if (error) throw error

  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', input.sessionId)

  return data as ChatMessage
}

export async function updateSessionTitle(sessionId: string, title: string): Promise<void> {
  const supabase = createSupabaseClient()
  const { error } = await supabase
    .from('chat_sessions')
    .update({ title })
    .eq('id', sessionId)

  if (error) throw error
}

export async function deleteSession(sessionId: string): Promise<void> {
  const supabase = createSupabaseClient()

  const { error: messagesError } = await supabase
    .from('chat_messages')
    .delete()
    .eq('session_id', sessionId)

  if (messagesError) throw messagesError

  const { error: sessionError } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId)

  if (sessionError) throw sessionError
}

export async function requestAssistantReply(input: {
  accessToken: string
  sessionId: string
  message: string
  history: ChatHistoryMessage[]
  lang: Lang
}): Promise<{ content: string; tokens_used: number | null }> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.accessToken}`,
    },
    body: JSON.stringify({
      sessionId: input.sessionId,
      message: input.message,
      history: input.history,
      lang: input.lang,
    }),
  })

  const data = (await res.json()) as {
    content?: string
    tokens_used?: number | null
    error?: string
  }

  if (!res.ok) {
    throw new Error(data.error ?? 'Error al obtener respuesta de la IA.')
  }

  if (!data.content) {
    throw new Error('La IA no devolvió una respuesta.')
  }

  return { content: data.content, tokens_used: data.tokens_used ?? null }
}
