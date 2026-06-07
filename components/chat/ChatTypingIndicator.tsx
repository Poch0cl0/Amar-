'use client'

type ChatTypingIndicatorProps = {
  label: string
}

export function ChatTypingIndicator({ label }: ChatTypingIndicatorProps) {
  return (
    <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-rose-100 px-4 py-3 text-sm text-earth-900">
        <span className="inline-flex items-center gap-1">
          {label}
          <span className="inline-flex gap-0.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-rose-400 [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-rose-400 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-rose-400 [animation-delay:300ms]" />
          </span>
        </span>
    </div>
  )
}
