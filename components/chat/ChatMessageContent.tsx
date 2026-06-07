'use client'

import { splitAssistantParagraphs } from '@/lib/chat-format'
import type { ChatRole } from '@/lib/chat'

type ChatMessageContentProps = {
  content: string
  role: ChatRole
  isUser?: boolean
}

export function ChatMessageContent({ content, role, isUser }: ChatMessageContentProps) {
  const fromUser = isUser ?? role === 'user'

  if (fromUser) {
    return (
      <p className="whitespace-pre-wrap break-words text-white [text-shadow:0_1px_1px_rgba(0,0,0,0.15)]">
        {content}
      </p>
    )
  }

  const paragraphs = splitAssistantParagraphs(content)

  if (paragraphs.length <= 1) {
    return <p className="whitespace-pre-wrap break-words leading-relaxed">{paragraphs[0] ?? content}</p>
  }

  return (
    <div className="space-y-2.5">
      {paragraphs.map((paragraph, index) => {
        const isStep = /^\d+\.\s/.test(paragraph)

        return (
          <p
            key={`${index}-${paragraph.slice(0, 24)}`}
            className={`break-words leading-relaxed ${isStep ? 'pl-0.5' : ''}`}
          >
            {paragraph}
          </p>
        )
      })}
    </div>
  )
}
