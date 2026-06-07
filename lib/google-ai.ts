import type { ChatHistoryMessage } from '@/lib/chat'

export type GoogleAiConfig = {
  apiKey: string
  model: string
  baseUrl: string
}

export function getGoogleAiConfig(): GoogleAiConfig | null {
  const apiKey = process.env.GOOGLE_AI_API_KEY?.trim()
  if (!apiKey) return null

  return {
    apiKey,
    model: process.env.GOOGLE_AI_MODEL?.trim() || 'gemini-2.0-flash',
    baseUrl:
      process.env.GOOGLE_AI_BASE_URL?.trim() ||
      'https://generativelanguage.googleapis.com/v1beta',
  }
}

type GeminiContent = {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
}

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> }
    finishReason?: string
  }>
  usageMetadata?: { totalTokenCount?: number }
  error?: { message?: string; status?: string }
}

function mapRole(role: ChatHistoryMessage['role']): 'user' | 'model' {
  return role === 'assistant' ? 'model' : 'user'
}

export async function generateGeminiReply(input: {
  systemPrompt: string
  history: ChatHistoryMessage[]
  message: string
}): Promise<{ content: string; tokens_used: number | null }> {
  const config = getGoogleAiConfig()
  if (!config) {
    throw new Error('GOOGLE_AI_API_KEY no está configurada en el servidor.')
  }

  const contents: GeminiContent[] = [
    ...input.history.map((item) => ({
      role: mapRole(item.role),
      parts: [{ text: item.content }],
    })),
    { role: 'user', parts: [{ text: input.message }] },
  ]

  const url = `${config.baseUrl}/models/${config.model}:generateContent`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': config.apiKey,
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: input.systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    }),
  })

  const data = (await res.json()) as GeminiResponse

  if (!res.ok) {
    throw new Error(data.error?.message ?? 'Error al contactar Google AI.')
  }

  const candidate = data.candidates?.[0]
  const text = candidate?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('')
    .trim()

  if (!text) {
    const reason = candidate?.finishReason
    if (reason && reason !== 'STOP') {
      throw new Error(`Google AI bloqueó la respuesta (${reason}). Intenta reformular tu mensaje.`)
    }
    throw new Error('Google AI no devolvió contenido.')
  }

  return {
    content: text,
    tokens_used: data.usageMetadata?.totalTokenCount ?? null,
  }
}
