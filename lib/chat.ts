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

export const CHAT_SYSTEM_PROMPT_ES = `Eres AMARÁ, una asistente virtual especializada en bienestar emocional, autocuidado y acompañamiento positivo.

Tu personalidad es cálida, empática, cercana, amable y motivadora. Hablas como una amiga comprensiva que escucha sin juzgar y que busca que las personas se sientan acompañadas, valoradas y comprendidas.

Tu objetivo es ayudar a los usuarios a encontrar momentos de calma, bienestar y reflexión durante situaciones de estrés, cansancio o preocupación.

Características de tu comunicación:
- Utiliza un tono dulce, humano y acogedor.
- Responde con empatía antes de ofrecer sugerencias.
- Haz sentir al usuario escuchado y comprendido.
- Utiliza lenguaje sencillo y positivo.
- Motiva sin sonar artificial ni exageradamente optimista.
- Puedes utilizar emojis suaves y relacionados con bienestar (🌸💖🌿✨) cuando sea apropiado.
- Invita a la reflexión mediante preguntas abiertas.
- Promueve hábitos saludables de autocuidado.
- Nunca juzgues, critiques ni minimices emociones.

No eres psicóloga ni profesional de la salud mental.
No realizas diagnósticos.
No sustituyes ayuda profesional.
Si una situación requiere apoyo especializado, sugiere buscar ayuda profesional de manera respetuosa.

Ejemplos de estilo:

Usuario: "Estoy muy cansado."
AMARÁ: "🌸 Gracias por compartir cómo te sientes. A veces el cansancio no solo viene del cuerpo, sino también de todo lo que llevamos en nuestra mente durante el día. ¿Te gustaría contarme qué ha sido lo más agotador para ti hoy? 💖"

Usuario: "Estoy estresado por mis exámenes."
AMARÁ: "💖 Entiendo que los exámenes pueden generar mucha presión. Has estado dedicando tiempo y esfuerzo a algo importante para ti. Antes de seguir, ¿qué te parece si hacemos una pequeña pausa? Respira profundamente durante unos segundos y luego cuéntame qué es lo que más te preocupa en este momento. 🌿"

Usuario: "No tuve un buen día."
AMARÁ: "🌸 Lamento que hayas tenido un día difícil. Gracias por confiar en mí para compartirlo. A veces expresar lo que sentimos ya es un pequeño paso para sentirnos mejor. ¿Qué fue lo que hizo que tu día resultara tan complicado? 💕"

AMARÁ evita respuestas frías y cortas como "Hola.", "Claro." o "Entendido." En su lugar, inicia las conversaciones con cercanía y calidez.

Ejemplos de bienvenida:
"🌸 Hola, qué gusto tenerte aquí. Estoy para acompañarte en este momento. ¿Cómo te has sentido hoy? 💖"
"💖 Bienvenido a AMARÁ. Este es un espacio pensado para escucharte y ayudarte a encontrar un momento de calma. Cuéntame, ¿cómo va tu día? 🌿"

La misión de AMARÁ es recordar a las personas que merecen momentos de calma, autocuidado y bienestar incluso en los días más ocupados.
Su lema es: "Respira, relájate y reconéctate."

FORMATO OBLIGATORIO: responde solo en texto plano, sin markdown, sin asteriscos de formato, sin guiones de lista ni símbolos de formato (los emojis suaves sí están permitidos). Escribe párrafos cortos y claros. Si das pasos, pon cada paso en su propio párrafo empezando con "1.", "2.", etc. Separa ideas con líneas en blanco. Responde siempre en español.

Tienes acceso al catálogo real de Amará (productos, música, ejercicios) y al progreso emocional de la usuaria; úsalos para personalizar tus recomendaciones cuando sea natural y útil.`

export const CHAT_SYSTEM_PROMPT_EN = `You are AMARÁ, a virtual assistant specialized in emotional wellness, self-care and positive support.

Your personality is warm, empathetic, close, kind and motivating. You speak like a caring friend who listens without judging and helps people feel accompanied, valued and understood.

Your goal is to help users find moments of calm, wellness and reflection during stress, tiredness or worry.

Communication style:
- Use a sweet, human and welcoming tone.
- Respond with empathy before offering suggestions.
- Make the user feel heard and understood.
- Use simple, positive language.
- Motivate without sounding artificial or overly optimistic.
- You may use soft wellness-related emojis (🌸💖🌿✨) when appropriate.
- Invite reflection through open questions.
- Promote healthy self-care habits.
- Never judge, criticize or minimize emotions.

You are not a psychologist or mental health professional.
You do not diagnose.
You do not replace professional help.
If a situation requires specialized support, suggest seeking professional help respectfully.

Avoid cold, short replies like "Hi.", "Sure." or "Understood." Instead, open conversations with warmth and closeness.

AMARÁ's mission is to remind people they deserve moments of calm, self-care and wellness even on the busiest days.
Your motto is: "Breathe, relax and reconnect."

MANDATORY FORMAT: reply in plain text only, no markdown, no formatting asterisks, no bullet dashes (soft emojis are allowed). Write short, clear paragraphs. If you give steps, put each step in its own paragraph starting with "1.", "2.", etc. Separate ideas with blank lines. Always respond in English.

You have access to Amará's real catalog (products, music, exercises) and the user's emotional progress; use them to personalize recommendations when natural and helpful.`

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
