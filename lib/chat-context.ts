import type { SupabaseClient } from '@supabase/supabase-js'
import exercisesData from '@/data/exercises.json'
import musicData from '@/data/music.json'
import productsData from '@/data/products.json'
import type { Exercise } from '@/lib/exercises'
import { getEmotionLabel, type EmotionType } from '@/lib/emotions'
import { getChatSystemPrompt } from '@/lib/chat'
import type { Lang } from '@/lib/i18n'

type ProductItem = {
  id: number
  name_es: string
  name_en: string
  description_es: string
  description_en: string
  is_active?: boolean
}

type MusicItem = {
  id: number
  title_es: string
  title_en: string
  description_es: string
  description_en: string
  tags_es: string[]
  tags_en: string[]
  sort_order: number
}

function pickLang<T extends string>(lang: Lang, es: T, en: T): T {
  return lang === 'en' ? en : es
}

export function buildAmaraCatalogContext(lang: Lang): string {
  const products = (productsData as ProductItem[]).filter((item) => item.is_active !== false)
  const music = [...(musicData as MusicItem[])].sort((a, b) => a.sort_order - b.sort_order)
  const exercises = [...(exercisesData as Exercise[])].sort((a, b) => a.sort_order - b.sort_order)

  const productsBlock = products
    .map((product) => {
      const name = pickLang(lang, product.name_es, product.name_en)
      const description = pickLang(lang, product.description_es, product.description_en)
      return `- ${name}: ${description}`
    })
    .join('\n')

  const musicBlock = music
    .map((track) => {
      const title = pickLang(lang, track.title_es, track.title_en)
      const description = pickLang(lang, track.description_es, track.description_en)
      const tags = pickLang(lang, track.tags_es.join(', '), track.tags_en.join(', '))
      return `- ${title} (${tags}): ${description}`
    })
    .join('\n')

  const exercisesBlock = exercises
    .map((exercise) => {
      const title = pickLang(lang, exercise.title_es, exercise.title_en)
      const description = pickLang(lang, exercise.description_es, exercise.description_en)
      return `- ${title} (${exercise.duration_min} min): ${description}`
    })
    .join('\n')

  if (lang === 'en') {
    return (
      'AMARÁ CATALOG (use this real information when recommending products, music or exercises):\n' +
      `Products (wellness kit — page /productos):\n${productsBlock}\n\n` +
      `Music (page /melodias):\n${musicBlock}\n\n` +
      `Exercises (page /ejercicios):\n${exercisesBlock}\n\n` +
      'When relevant, recommend specific items from this catalog and mention users can find them in the corresponding Amará section.'
    )
  }

  return (
    'CATÁLOGO AMARÁ (usa esta información real al recomendar productos, música o ejercicios):\n' +
    `Productos (kit de bienestar — sección /productos):\n${productsBlock}\n\n` +
    `Música (sección /melodias):\n${musicBlock}\n\n` +
    `Ejercicios (sección /ejercicios):\n${exercisesBlock}\n\n` +
    'Cuando sea relevante, recomienda elementos concretos de este catálogo e indica que el usuario puede encontrarlos en la sección correspondiente de Amará.'
  )
}

type EmotionLogRow = {
  log_date: string
  emotion: EmotionType
  mood_score: number | null
  note: string | null
}

export async function buildUserProgressContext(
  supabase: SupabaseClient,
  userId: string,
  lang: Lang,
): Promise<string> {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`

  const { data: recentLogs, error: logsError } = await supabase
    .from('emotion_logs')
    .select('log_date, emotion, mood_score, note')
    .eq('user_id', userId)
    .order('log_date', { ascending: false })
    .limit(7)

  if (logsError) {
    return lang === 'en'
      ? 'USER PROGRESS: unavailable right now. Encourage the user to log emotions in /progreso.'
      : 'PROGRESO DEL USUARIO: no disponible ahora. Invita a registrar emociones en /progreso.'
  }

  const logs = (recentLogs ?? []) as EmotionLogRow[]

  const { data: monthLogs } = await supabase
    .from('emotion_logs')
    .select('emotion, mood_score')
    .eq('user_id', userId)
    .gte('log_date', monthStart)

  const monthEntries = monthLogs ?? []
  const moodScores = monthEntries
    .map((log) => log.mood_score)
    .filter((score): score is number => score != null)

  const avgMood =
    moodScores.length > 0
      ? Math.round((moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length) * 10) / 10
      : null

  if (logs.length === 0) {
    return lang === 'en'
      ? 'USER PROGRESS: no emotion logs yet. The user can track feelings in /progreso. Be supportive and suggest starting today.'
      : 'PROGRESO DEL USUARIO: aún no hay registros emocionales. La usuaria puede llevar su calendario en /progreso. Sé comprensiva e invita a empezar hoy.'
  }

  const recentBlock = logs
    .map((log) => {
      const emotion = getEmotionLabel(log.emotion, lang)
      const intensity = log.mood_score != null ? `, intensidad ${log.mood_score}/10` : ''
      const note = log.note?.trim() ? ` — nota: ${log.note.trim()}` : ''
      return `- ${log.log_date}: ${emotion}${intensity}${note}`
    })
    .join('\n')

  const happyDays = monthEntries.filter((log) => log.emotion === 'feliz' || log.emotion === 'muy_feliz').length
  const calmDays = monthEntries.filter((log) => log.emotion === 'calmado').length
  const anxiousDays = monthEntries.filter((log) => log.emotion === 'ansioso').length
  const sadDays = monthEntries.filter((log) => log.emotion === 'triste' || log.emotion === 'muy_triste').length

  if (lang === 'en') {
    return (
      'PRIVATE USER PROGRESS (only for this authenticated user — personalize gently, never share with others):\n' +
      `Current month entries: ${monthEntries.length}. Average intensity: ${avgMood ?? 'n/a'}/10. ` +
      `Happy days: ${happyDays}, calm: ${calmDays}, anxious: ${anxiousDays}, sad: ${sadDays}.\n` +
      `Last records:\n${recentBlock}\n` +
      'Use this context to tailor support. If they seem anxious or sad lately, prioritize calming exercises and music from the catalog.'
    )
  }

  return (
    'PROGRESO PRIVADO DE LA USUARIA (solo para esta usuaria autenticada — personaliza con tacto, nunca compartas con otros):\n' +
    `Registros del mes actual: ${monthEntries.length}. Intensidad promedio: ${avgMood ?? 'n/d'}/10. ` +
    `Días felices: ${happyDays}, tranquilos: ${calmDays}, ansiosos: ${anxiousDays}, tristes: ${sadDays}.\n` +
    `Últimos registros:\n${recentBlock}\n` +
    'Usa este contexto para acompañar mejor. Si ha estado ansiosa o triste, prioriza ejercicios y música calmantes del catálogo.'
  )
}

export async function buildFullSystemPrompt(
  supabase: SupabaseClient,
  userId: string,
  lang: Lang,
): Promise<string> {
  const base = getChatSystemPrompt(lang)
  const catalog = buildAmaraCatalogContext(lang)
  const progress = await buildUserProgressContext(supabase, userId, lang)

  return `${base}\n\n${catalog}\n\n${progress}`
}
