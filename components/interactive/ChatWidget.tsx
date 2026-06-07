'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { MessageCircleIcon } from '@/components/chat/ChatIcons'
import { ChatInput } from '@/components/chat/ChatInput'
import { ChatLoginGate } from '@/components/chat/ChatLoginGate'
import { ChatMessageList } from '@/components/chat/ChatMessageList'
import { ChatSessionSidebar } from '@/components/chat/ChatSessionSidebar'
import { ChatSuggestions } from '@/components/chat/ChatSuggestions'
import { useLocale } from '@/components/providers/LocaleProvider'
import {
  createSession,
  deleteSession,
  deriveSessionTitle,
  fetchSessionMessages,
  fetchUserSessions,
  requestAssistantReply,
  saveMessage,
  type ChatMessage,
  type ChatSession,
  updateSessionTitle,
} from '@/lib/chat'
import { getTranslations } from '@/lib/i18n'
import { createSupabaseClient } from '@/lib/supabase'

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

export function ChatWidget() {
  const { lang } = useLocale()
  const copy = getTranslations(lang).chat

  const [isOpen, setIsOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [typing, setTyping] = useState(false)
  const [error, setError] = useState('')

  const isSendingRef = useRef(false)
  const prevUserIdRef = useRef<string | null>(null)
  const userId = user?.id ?? null

  function resetChatState() {
    setSessions([])
    setActiveSessionId(null)
    setMessages([])
    setInput('')
    setError('')
    setLoading(false)
    setDeleting(false)
    setTyping(false)
    setSidebarOpen(false)
    isSendingRef.current = false
  }

  useEffect(() => {
    const supabase = createSupabaseClient()

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const currentUserId = user?.id ?? null

    if (prevUserIdRef.current !== currentUserId) {
      resetChatState()
      prevUserIdRef.current = currentUserId
    }
  }, [user?.id])

  const loadSessions = useCallback(async () => {
    if (!userId) return
    const data = await fetchUserSessions(userId)
    setSessions(uniqueById(data))
  }, [userId])

  useEffect(() => {
    if (!userId || !isOpen) return

    loadSessions().catch(() => {
      setError(copy.loadError)
    })
  }, [userId, isOpen, loadSessions, copy.loadError])

  useEffect(() => {
    if (!activeSessionId) {
      setMessages([])
      return
    }

    if (isSendingRef.current) return

    let cancelled = false
    const sessionId = activeSessionId

    fetchSessionMessages(sessionId)
      .then((data) => {
        if (!cancelled && !isSendingRef.current) {
          setMessages(uniqueById(data))
        }
      })
      .catch(() => {
        if (!cancelled) setError(copy.loadError)
      })

    return () => {
      cancelled = true
    }
  }, [activeSessionId, userId, copy.loadError])

  async function ensureSession(): Promise<string> {
    if (activeSessionId) return activeSessionId
    if (!userId) throw new Error('No user')

    const session = await createSession(userId, copy.newConversation)
    setSessions((prev) => uniqueById([session, ...prev]))
    setActiveSessionId(session.id)
    return session.id
  }

  async function handleNewConversation() {
    if (!userId) return
    setError('')
    const session = await createSession(userId, copy.newConversation)
    setSessions((prev) => uniqueById([session, ...prev]))
    setActiveSessionId(session.id)
    setMessages([])
    setInput('')
    setSidebarOpen(true)
  }

  async function handleSelectSession(sessionId: string) {
    setError('')
    setActiveSessionId(sessionId)
    setSidebarOpen(true)
  }

  async function handleDeleteSession(sessionId: string) {
    if (!userId || loading || deleting || isSendingRef.current) return

    setError('')
    setDeleting(true)

    try {
      await deleteSession(sessionId)
      const remaining = sessions.filter((session) => session.id !== sessionId)
      setSessions(remaining)

      if (activeSessionId === sessionId) {
        const nextSessionId = remaining[0]?.id ?? null
        setActiveSessionId(nextSessionId)
        if (!nextSessionId) setMessages([])
      }
    } catch {
      setError(copy.deleteError)
    } finally {
      setDeleting(false)
    }
  }

  async function handleSend(presetMessage?: string) {
    const text = (presetMessage ?? input).trim()
    if (!text || !userId || loading || isSendingRef.current) return

    setError('')
    setLoading(true)
    setTyping(true)
    isSendingRef.current = true

    try {
      const supabase = createSupabaseClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) {
        setError(copy.sessionExpired)
        return
      }

      const sessionId = await ensureSession()
      const isFirstUserMessage = messages.filter((m) => m.role === 'user').length === 0

      const userMessage = await saveMessage({
        sessionId,
        userId,
        role: 'user',
        content: text,
      })

      setInput('')
      const messagesWithUser = uniqueById([...messages, userMessage])
      setMessages(messagesWithUser)

      if (isFirstUserMessage) {
        const title = deriveSessionTitle(text)
        await updateSessionTitle(sessionId, title)
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, title } : s)),
        )
      }

      const history = messagesWithUser.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const reply = await requestAssistantReply({
        accessToken,
        sessionId,
        message: text,
        history,
        lang,
      })

      const assistantMessage = await saveMessage({
        sessionId,
        userId,
        role: 'assistant',
        content: reply.content,
        tokensUsed: reply.tokens_used,
      })

      setMessages((prev) => uniqueById([...prev, assistantMessage]))
      await loadSessions()
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.sendError)
    } finally {
      isSendingRef.current = false
      setLoading(false)
      setTyping(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div
          className="flex h-[500px] w-[360px] flex-col overflow-hidden rounded-2xl border border-earth-200 bg-white shadow-soft"
          role="dialog"
          aria-label={copy.title}
        >
          <ChatHeader
            title={copy.title}
            showSidebarToggle={Boolean(user)}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((open) => !open)}
            onClose={() => setIsOpen(false)}
          />

          {!user ? (
            <ChatLoginGate lang={lang} />
          ) : (
            <div className="flex min-h-0 flex-1">
              {sidebarOpen && (
                <ChatSessionSidebar
                  sessions={sessions}
                  activeSessionId={activeSessionId}
                  newConversationLabel={copy.newConversationBtn}
                  defaultTitle={copy.newConversation}
                  deleteLabel={copy.deleteChat}
                  deleteConfirm={copy.deleteConfirm}
                  deleteYes={copy.deleteYes}
                  deleteNo={copy.deleteNo}
                  deleting={deleting}
                  onSelect={handleSelectSession}
                  onNew={handleNewConversation}
                  onDelete={handleDeleteSession}
                />
              )}

              <div className="flex min-w-0 flex-1 flex-col">
                {messages.length === 0 && !typing && (
                  <div className="border-b border-earth-100 px-3 py-3">
                    <p className="mb-2 text-xs text-earth-500">{copy.welcome}</p>
                    <ChatSuggestions
                      lang={lang}
                      disabled={loading}
                      onSelect={(msg) => handleSend(msg)}
                    />
                  </div>
                )}

                <ChatMessageList messages={messages} typing={typing} typingLabel={copy.typing} />

                {error && (
                  <p className="mx-3 mb-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
                    {error}
                  </p>
                )}

                <ChatInput
                  value={input}
                  placeholder={copy.placeholder}
                  disabled={loading}
                  onChange={setInput}
                  onSend={() => handleSend()}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-soft transition hover:-translate-y-0.5 hover:opacity-90"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={copy.openChat}
        aria-expanded={isOpen}
      >
        <MessageCircleIcon className="h-6 w-6" />
        {user && (
          <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-white bg-sage-500" />
        )}
      </button>
    </div>
  )
}
