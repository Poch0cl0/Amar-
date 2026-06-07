import landingContent from '@/data/landing-content.json'

export type LandingContent = typeof landingContent
export type Product = LandingContent['products'][number]
export type Melody = LandingContent['melodies'][number]
export type ProductLine = LandingContent['productLines'][number]
export type Phrase = LandingContent['phrases'][number]

export function getLandingContent() {
  const content = landingContent as LandingContent
  const dayIndex = new Date().getDate() % content.phrases.length

  return {
    ...content,
    dailyPhrase: content.phrases[dayIndex],
  }
}
