import type { EmotionType } from '@/lib/emotions'

type EmotionIconProps = {
  emotion: EmotionType
  className?: string
}

export function EmotionIcon({ emotion, className = 'h-8 w-8' }: EmotionIconProps) {
  switch (emotion) {
    case 'muy_feliz':
      return (
        <svg className={className} viewBox="0 0 48 48" aria-hidden>
          <circle cx="24" cy="24" r="22" fill="#A8C69F" />
          <circle cx="17" cy="20" r="2.5" fill="#352923" />
          <circle cx="31" cy="20" r="2.5" fill="#352923" />
          <path d="M14 30c3 6 17 6 20 0" stroke="#352923" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'feliz':
      return (
        <svg className={className} viewBox="0 0 48 48" aria-hidden>
          <circle cx="24" cy="24" r="22" fill="#D4A5A5" />
          <circle cx="17" cy="20" r="2.5" fill="#352923" />
          <circle cx="31" cy="20" r="2.5" fill="#352923" />
          <path d="M16 29c2.5 4 13.5 4 16 0" stroke="#352923" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'calmado':
      return (
        <svg className={className} viewBox="0 0 48 48" aria-hidden>
          <circle cx="24" cy="24" r="22" fill="#F5E6E6" />
          <path d="M16 20h4M28 20h4" stroke="#352923" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M18 30h12" stroke="#352923" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    case 'ansioso':
      return (
        <svg className={className} viewBox="0 0 48 48" aria-hidden>
          <circle cx="24" cy="24" r="22" fill="#C48F8F" />
          <circle cx="17" cy="22" r="2.5" fill="#352923" />
          <circle cx="31" cy="22" r="2.5" fill="#352923" />
          <path d="M18 32c2-3 10-3 12 0" stroke="#352923" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M14 14l4 2M34 14l-4 2" stroke="#352923" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'triste':
      return (
        <svg className={className} viewBox="0 0 48 48" aria-hidden>
          <circle cx="24" cy="24" r="22" fill="#8C7568" />
          <circle cx="17" cy="20" r="2.5" fill="#352923" />
          <circle cx="31" cy="20" r="2.5" fill="#352923" />
          <path d="M16 34c2.5-4 13.5-4 16 0" stroke="#352923" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      )
    default:
      return (
        <svg className={className} viewBox="0 0 48 48" aria-hidden>
          <circle cx="24" cy="24" r="22" fill="#F5E6E6" />
          <circle cx="17" cy="20" r="2.5" fill="#352923" />
          <circle cx="31" cy="20" r="2.5" fill="#352923" />
          <path d="M18 30h12" stroke="#352923" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
  }
}
