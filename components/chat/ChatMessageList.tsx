'use client'

import { useEffect, useRef } from 'react'
import { ChatMessageContent } from '@/components/chat/ChatMessageContent'
import { ChatTypingIndicator } from '@/components/chat/ChatTypingIndicator'
import { isUserMessage, type ChatMessage } from '@/lib/chat'

type ChatMessageListProps = {
  messages: ChatMessage[]
  typing?: boolean
  typingLabel: string
}

export function ChatMessageList({ messages, typing = false, typingLabel }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
      {messages.map((message) => {
        const isUser = isUserMessage(message.role)
        return (
          <div
            key={message.id}
            className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                isUser
                  ? 'rounded-br-md bg-earth-800 text-white shadow-sm'
                  : 'rounded-bl-md bg-rose-100 text-earth-900'
              }`}
            >
              <ChatMessageContent content={message.content} role={message.role} isUser={isUser} />
            </div>
          </div>
        )
      })}

      {typing && (
        <div className="flex w-full justify-start">
          <ChatTypingIndicator label={typingLabel} />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
