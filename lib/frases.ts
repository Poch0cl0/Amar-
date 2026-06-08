import { createSupabaseClient } from '@/lib/supabase'

export type Lang = 'es' | 'en'

export type SystemPhrase = {
  id: number
  phrase_es: string
  phrase_en: string
  category: string
}

export type UserPhrase = {
  id: string
  author_id: string
  phrase_text: string
  category: string
  created_at: string
}

export type SharedPhrase = {
  id: string
  phrase_id: string
  sender_id: string
  recipient_id: string
  shared_at: string
  phrase_text: string
  category: string
  sender_name: string
}

export type BlockedUser = {
  blocked_id: string
  email: string
  display_name: string
  blocked_at: string
}

export const PHRASE_CATEGORIES = [
  { value: 'ansiedad', label: 'Ansiedad' },
  { value: 'autocuidado', label: 'Autocuidado' },
  { value: 'fortaleza', label: 'Fortaleza' },
  { value: 'autoestima', label: 'Autoestima' },
  { value: 'calma', label: 'Calma' },
  { value: 'esperanza', label: 'Esperanza' },
  { value: 'progreso', label: 'Progreso' },
  { value: 'general', label: 'General' },
] as const

export const CATEGORY_LABELS: Record<Lang, Record<string, string>> = {
  es: {
    ansiedad: 'Ansiedad',
    autocuidado: 'Autocuidado',
    fortaleza: 'Fortaleza',
    autoestima: 'Autoestima',
    calma: 'Calma',
    esperanza: 'Esperanza',
    progreso: 'Progreso',
    general: 'General',
  },
  en: {
    ansiedad: 'Anxiety',
    autocuidado: 'Self-care',
    fortaleza: 'Strength',
    autoestima: 'Self-esteem',
    calma: 'Calm',
    esperanza: 'Hope',
    progreso: 'Progress',
    general: 'General',
  },
}

export const MAX_PHRASE_WORDS = 50

export function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

export function isPhraseWithinWordLimit(text: string, max = MAX_PHRASE_WORDS): boolean {
  return countWords(text) <= max
}

export function getCategoryLabel(category: string, lang: Lang = 'es'): string {
  const label = CATEGORY_LABELS[lang][category]
  if (label) return label
  return category.charAt(0).toUpperCase() + category.slice(1)
}

function isBlockedUsersUnavailable(error: { code?: string; message?: string }): boolean {
  return (
    error.code === 'PGRST205' ||
    error.code === '42501' ||
    Boolean(error.message?.includes('permission denied for table blocked_users')) ||
    Boolean(error.message?.includes("Could not find the table 'public.blocked_users'"))
  )
}

export async function getBlockedUsers(): Promise<BlockedUser[]> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase.rpc('get_my_blocked_users')

  if (error) {
    if (isBlockedUsersUnavailable(error)) return []
    throw error
  }

  return (data ?? []) as BlockedUser[]
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  const supabase = createSupabaseClient()

  const { error } = await supabase
    .from('blocked_users')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)

  if (error) {
    if (isBlockedUsersUnavailable(error)) {
      throw new Error('BLOCKED_USERS_PERMISSION_DENIED')
    }
    throw error
  }
}

export async function getBlockedSenderIds(blockerId: string): Promise<string[]> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('blocked_users')
    .select('blocked_id')
    .eq('blocker_id', blockerId)

  if (error) {
    if (isBlockedUsersUnavailable(error)) return []
    throw error
  }
  return (data ?? []).map((row) => row.blocked_id as string)
}

export async function isUserBlockedBy(blockerId: string, blockedId: string): Promise<boolean> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('blocked_users')
    .select('id')
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)
    .maybeSingle()

  if (error) {
    if (isBlockedUsersUnavailable(error)) return false
    throw error
  }
  return Boolean(data)
}

export async function blockUserAndRemoveShares(
  blockerId: string,
  blockedId: string,
): Promise<void> {
  const supabase = createSupabaseClient()

  const { error: blockError } = await supabase.from('blocked_users').upsert(
    { blocker_id: blockerId, blocked_id: blockedId },
    { onConflict: 'blocker_id,blocked_id' },
  )

  if (blockError) {
    if (isBlockedUsersUnavailable(blockError)) {
      throw new Error('BLOCKED_USERS_PERMISSION_DENIED')
    }
    throw blockError
  }

  const { error: deleteError } = await supabase
    .from('shared_phrases')
    .delete()
    .eq('recipient_id', blockerId)
    .eq('sender_id', blockedId)

  if (deleteError) throw deleteError
}
