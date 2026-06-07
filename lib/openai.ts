import type { ChatHistoryMessage } from '@/lib/chat'

export type OpenAiConfig = {
  apiKey: string
  model: string
  baseUrl: string
}

export function getOpenAiConfig(): OpenAiConfig | null {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) return null

  return {
    apiKey,
    model: process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini',
    baseUrl: process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1',
  }
}

type OpenAiMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type OpenAiResponse = {
  choices?: Array<{ message?: { content?: string } }>
  usage?: { total_tokens?: number }
  error?: { message?: string }
}

export async function generateOpenAiReply(input: {
  systemPrompt: string
  history: ChatHistoryMessage[]
  message: string
}): Promise<{ content: string; tokens_used: number | null }> {
  const config = getOpenAiConfig()
  if (!config) {
    throw new Error('OPENAI_API_KEY no está configurada en el servidor.')
  }

  const messages: OpenAiMessage[] = [
    { role: 'system', content: input.systemPrompt },
    ...input.history.map((item) => ({
      role: item.role,
      content: item.content,
    })),
    { role: 'user', content: input.message },
  ]

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.7,
      max_tokens: 800,
    }),
  })

  const data = (await res.json()) as OpenAiResponse

  if (!res.ok) {
    throw new Error(data.error?.message ?? 'Error al contactar OpenAI.')
  }

  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new Error('OpenAI no devolvió contenido.')
  }

  return {
    content,
    tokens_used: data.usage?.total_tokens ?? null,
  }
}
