import type { Lang } from '@/lib/i18n'
import { createSupabaseClient } from '@/lib/supabase'

export type EmotionType =
  | 'muy_feliz'
  | 'feliz'
  | 'calmado'
  | 'ansioso'
  | 'triste'
  | 'muy_triste'
  | 'agradecido'

export type EmotionLog = {
  id: string
  user_id: string
  log_date: string
  emotion: EmotionType
  note: string | null
  mood_score: number | null
  created_at: string
  updated_at: string
}

export type EmotionStats = {
  user_id: string
  month: string
  total_entries: number
  avg_mood: number | null
  happy_days: number
  sad_days: number
  anxious_days: number
  calm_days: number
  grateful_days: number
  best_score: number | null
  lowest_score: number | null
}

export type EmotionSummaryGroup = 'happy' | 'anxious' | 'sad' | 'calm'

export const EMOTION_MIN_YEAR = 2026
export const EMOTION_MIN_MONTH = 0
export const EMOTION_MAX_YEAR = 2027
export const EMOTION_MAX_MONTH = 11
export const EMOTION_MIN_DATE = '2026-01-01'
export const EMOTION_MAX_DATE = '2027-12-31'

export const PICKER_EMOTIONS: EmotionType[] = [
  'feliz',
  'calmado',
  'ansioso',
  'triste',
]

const EMOTION_LABELS: Record<EmotionType, { es: string; en: string }> = {
  muy_feliz: { es: 'Muy feliz', en: 'Very happy' },
  feliz: { es: 'Feliz', en: 'Happy' },
  calmado: { es: 'Tranquila', en: 'Calm' },
  ansioso: { es: 'Ansiosa', en: 'Anxious' },
  triste: { es: 'Triste', en: 'Sad' },
  muy_triste: { es: 'Muy triste', en: 'Very sad' },
  agradecido: { es: 'Agradecido', en: 'Grateful' },
}

export const EMOTION_CELL_COLORS: Record<EmotionType, string> = {
  muy_feliz: 'bg-sage-500',
  feliz: 'bg-rose-200',
  calmado: 'bg-rose-100',
  ansioso: 'bg-rose-400',
  triste: 'bg-earth-400',
  muy_triste: 'bg-earth-500',
  agradecido: 'bg-sage-300',
}

export const LEGEND_ITEMS: { key: string; color: string; emotions: EmotionType[] }[] = [
  { key: 'veryHappy', color: 'bg-sage-500', emotions: ['muy_feliz'] },
  { key: 'calm', color: 'bg-rose-200', emotions: ['calmado', 'feliz'] },
  { key: 'anxious', color: 'bg-rose-400', emotions: ['ansioso'] },
  { key: 'sad', color: 'bg-earth-400', emotions: ['triste', 'muy_triste'] },
]

const SUMMARY_GROUP_MAP: Record<EmotionType, EmotionSummaryGroup> = {
  muy_feliz: 'happy',
  feliz: 'happy',
  agradecido: 'happy',
  ansioso: 'anxious',
  triste: 'sad',
  muy_triste: 'sad',
  calmado: 'calm',
}

const HEATMAP_CLASSES = [
  'bg-rose-50',
  'bg-rose-100',
  'bg-rose-200',
  'bg-rose-300',
  'bg-rose-400',
  'bg-rose-500',
  'bg-rose-500',
  'bg-rose-500',
  'bg-earth-600',
  'bg-earth-700',
]

export function getEmotionLabel(emotion: EmotionType, lang: Lang): string {
  return EMOTION_LABELS[emotion][lang]
}

export function getEmotionColor(emotion: EmotionType): string {
  return EMOTION_CELL_COLORS[emotion]
}

export function getHeatmapIntensityClass(score: number | null | undefined): string {
  if (!score || score < 1) return 'bg-rose-50'
  const index = Math.min(9, Math.max(0, Math.round(score) - 1))
  return HEATMAP_CLASSES[index]
}

export function formatDateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = formatDateKey(year, month, 1)
  const lastDay = new Date(year, month + 1, 0).getDate()
  const end = formatDateKey(year, month, lastDay)
  return { start, end }
}

export function getMonthFirstDay(year: number, month: number): string {
  return formatDateKey(year, month, 1)
}

export function buildMonthLogsMap(logs: EmotionLog[]): Map<string, EmotionLog> {
  return new Map(logs.map((log) => [log.log_date, log]))
}

export type EmotionPercentage = {
  group: EmotionSummaryGroup
  percent: number
}

export function computeEmotionPercentages(logs: EmotionLog[]): EmotionPercentage[] {
  if (logs.length === 0) {
    return [
      { group: 'happy', percent: 0 },
      { group: 'calm', percent: 0 },
      { group: 'anxious', percent: 0 },
      { group: 'sad', percent: 0 },
    ]
  }

  const counts: Record<EmotionSummaryGroup, number> = {
    happy: 0,
    anxious: 0,
    sad: 0,
    calm: 0,
  }

  for (const log of logs) {
    counts[SUMMARY_GROUP_MAP[log.emotion]] += 1
  }

  const total = logs.length
  return (['happy', 'calm', 'anxious', 'sad'] as EmotionSummaryGroup[]).map((group) => ({
    group,
    percent: Math.round((counts[group] / total) * 100),
  }))
}

export function isFutureDate(dateKey: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = parseDateKey(dateKey)
  target.setHours(0, 0, 0, 0)
  return target > today
}

export function isBeforeMinDate(dateKey: string): boolean {
  return dateKey < EMOTION_MIN_DATE
}

export function isAfterMaxDate(dateKey: string): boolean {
  return dateKey > EMOTION_MAX_DATE
}

export function isDateRegistrable(dateKey: string): boolean {
  return !isBeforeMinDate(dateKey) && !isAfterMaxDate(dateKey) && !isFutureDate(dateKey)
}

export function getInitialViewMonth(): { year: number; month: number } {
  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth()

  if (year < EMOTION_MIN_YEAR) {
    year = EMOTION_MIN_YEAR
    month = EMOTION_MIN_MONTH
  } else if (year > EMOTION_MAX_YEAR) {
    year = EMOTION_MAX_YEAR
    month = EMOTION_MAX_MONTH
  }

  return { year, month }
}

export function canGoToPrevMonth(year: number, month: number): boolean {
  if (year < EMOTION_MIN_YEAR) return false
  if (year === EMOTION_MIN_YEAR && month <= EMOTION_MIN_MONTH) return false
  return true
}

export function canGoToNextMonth(year: number, month: number): boolean {
  const now = new Date()
  const nextYear = month === 11 ? year + 1 : year
  const nextMonth = month === 11 ? 0 : month + 1

  if (nextYear > EMOTION_MAX_YEAR) return false
  if (nextYear === EMOTION_MAX_YEAR && nextMonth > EMOTION_MAX_MONTH) return false

  const nextMonthStart = new Date(nextYear, nextMonth, 1)
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  if (nextMonthStart > currentMonthStart) return false

  return true
}

export function getSelectableMonthsForCurrentYear(lang: Lang): {
  year: number
  month: number
  label: string
}[] {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  if (currentYear < EMOTION_MIN_YEAR || currentYear > EMOTION_MAX_YEAR) {
    return []
  }

  return Array.from({ length: currentMonth + 1 }, (_, month) => ({
    year: currentYear,
    month,
    label: getMonthNameOnly(month, lang),
  }))
}

export type SidebarStats = {
  registeredDays: number
  happyDays: number
  anxiousDays: number
  avgIntensity: string
}

export function computeSidebarStats(logs: EmotionLog[]): SidebarStats {
  const moodScores = logs
    .map((log) => log.mood_score)
    .filter((score): score is number => score != null)

  const avgIntensity =
    moodScores.length > 0
      ? (moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length).toFixed(1)
      : '—'

  return {
    registeredDays: logs.length,
    happyDays: logs.filter((log) => log.emotion === 'muy_feliz' || log.emotion === 'feliz').length,
    anxiousDays: logs.filter((log) => log.emotion === 'ansioso').length,
    avgIntensity,
  }
}

export function isToday(dateKey: string): boolean {
  const today = new Date()
  const target = parseDateKey(dateKey)
  return (
    today.getFullYear() === target.getFullYear() &&
    today.getMonth() === target.getMonth() &&
    today.getDate() === target.getDate()
  )
}

export async function fetchLogsForMonth(
  userId: string,
  year: number,
  month: number,
): Promise<EmotionLog[]> {
  const supabase = createSupabaseClient()
  const { start, end } = getMonthRange(year, month)

  const { data, error } = await supabase
    .from('emotion_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', start)
    .lte('log_date', end)
    .order('log_date', { ascending: true })

  if (error) throw error
  return (data ?? []) as EmotionLog[]
}

export function computeMonthStatsFromLogs(
  userId: string,
  year: number,
  month: number,
  logs: EmotionLog[],
): EmotionStats {
  const monthKey = getMonthFirstDay(year, month)
  const moodScores = logs
    .map((log) => log.mood_score)
    .filter((score): score is number => score != null)

  const avgMood =
    moodScores.length > 0
      ? Math.round((moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length) * 100) /
        100
      : null

  return {
    user_id: userId,
    month: monthKey,
    total_entries: logs.length,
    avg_mood: avgMood,
    happy_days: logs.filter((log) => log.emotion === 'muy_feliz' || log.emotion === 'feliz').length,
    sad_days: logs.filter((log) => log.emotion === 'triste' || log.emotion === 'muy_triste').length,
    anxious_days: logs.filter((log) => log.emotion === 'ansioso').length,
    calm_days: logs.filter((log) => log.emotion === 'calmado').length,
    grateful_days: logs.filter((log) => log.emotion === 'agradecido').length,
    best_score: moodScores.length > 0 ? Math.max(...moodScores) : null,
    lowest_score: moodScores.length > 0 ? Math.min(...moodScores) : null,
  }
}

export async function fetchMonthStats(
  userId: string,
  year: number,
  month: number,
  logs?: EmotionLog[],
): Promise<EmotionStats | null> {
  const supabase = createSupabaseClient()
  const monthKey = getMonthFirstDay(year, month)

  const { data, error } = await supabase
    .from('emotion_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('month', monthKey)
    .maybeSingle()

  if (error) {
    if (logs) {
      return computeMonthStatsFromLogs(userId, year, month, logs)
    }
    throw error
  }

  if (data) return data as EmotionStats
  if (logs && logs.length > 0) {
    return computeMonthStatsFromLogs(userId, year, month, logs)
  }
  return null
}

export type UpsertEmotionLogInput = {
  user_id: string
  log_date: string
  emotion: EmotionType
  mood_score: number
  note: string | null
}

export async function upsertEmotionLog(input: UpsertEmotionLogInput): Promise<void> {
  const supabase = createSupabaseClient()

  const { error } = await supabase.from('emotion_logs').upsert(
    {
      user_id: input.user_id,
      log_date: input.log_date,
      emotion: input.emotion,
      mood_score: input.mood_score,
      note: input.note?.trim() || null,
    },
    { onConflict: 'user_id,log_date' },
  )

  if (error) throw error
}

export function getMonthLabel(year: number, month: number, lang: Lang): string {
  const date = new Date(year, month, 1)
  return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', {
    month: 'long',
    year: 'numeric',
  })
}

export function getMonthNameOnly(month: number, lang: Lang): string {
  const date = new Date(EMOTION_MIN_YEAR, month, 1)
  return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', { month: 'long' })
}

export function getWeekdayLabels(lang: Lang): string[] {
  const base = lang === 'en' ? 'en-US' : 'es-ES'
  const monday = new Date(2024, 0, 1)
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + index)
    return day.toLocaleDateString(base, { weekday: 'short' }).replace('.', '')
  })
}
