'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { ReactNode } from 'react'
import { loginPath } from '@/lib/auth-redirect'
import type { Lang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n'

type NavItem = {
  label: string
  to: string
  icon: ReactNode
}

type MobileNavDrawerProps = {
  open: boolean
  onClose: () => void
  user: User | null
  lang: Lang
  onSignOut: () => void
}

export function MobileNavDrawer({ open, onClose, user, lang, onSignOut }: MobileNavDrawerProps) {
  const pathname = usePathname()
  const copy = getTranslations(lang).header

  const navigation: NavItem[] = [
    { label: copy.navHome, to: '/', icon: <HomeIcon /> },
    { label: copy.navPhrases, to: '/frases', icon: <QuotesIcon /> },
    { label: copy.navProducts, to: '/productos', icon: <BagIcon /> },
    { label: copy.navMusic, to: '/melodias', icon: <MusicIcon /> },
    { label: copy.navExercises, to: '/ejercicios', icon: <DumbbellIcon /> },
    { label: copy.navProgress, to: '/progreso', icon: <ChartIcon /> },
  ]

  const displayName = user?.user_metadata?.full_name as string | undefined
  const initials = displayName
    ? getInitials(displayName)
    : user?.email?.slice(0, 2).toUpperCase() ?? '?'

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-earth-950/25 backdrop-blur-[2px]"
        aria-label={copy.closeMenu}
        onClick={onClose}
      />

      <aside className="relative flex h-full w-[min(85vw,20rem)] max-w-[320px] flex-col overflow-hidden rounded-tr-[2.5rem] bg-[#FFF9F7] shadow-soft">
        <div className="shrink-0 flex items-center gap-3 px-6 pb-2 pt-8">
          {user ? (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-rose-200 ring-2 ring-rose-200/80">
              {user.user_metadata?.avatar_url ? (
                <Image
                  src={user.user_metadata.avatar_url as string}
                  alt=""
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-rose-600">{initials}</span>
              )}
            </div>
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-rose-300">
              <Image
                src="/logo-amara.png"
                alt="Amará"
                width={44}
                height={44}
                unoptimized
                className="h-7 w-7 object-contain"
              />
            </div>
          )}
          <div>
            <p className="font-display text-2xl leading-none text-earth-900">Amará</p>
            <p className="mt-1 text-xs text-earth-500">{copy.tagline}</p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          <nav className="flex flex-col gap-1.5 px-4 py-4">
            {navigation.map((item) => {
              const isActive = item.to === '/'
                ? pathname === '/'
                : pathname.startsWith(item.to)

              return (
                <Link
                  key={item.to}
                  href={item.to}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[0.95rem] font-medium transition ${
                    isActive
                      ? 'bg-rose-200/70 text-earth-900'
                      : 'text-earth-700 hover:bg-rose-100/50'
                  }`}
                >
                  <span className={`shrink-0 ${isActive ? 'text-earth-800' : 'text-earth-500'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              )
            })}

            {user && (
              <Link
                href="/configuracion"
                onClick={onClose}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[0.95rem] font-medium transition ${
                  pathname.startsWith('/configuracion')
                    ? 'bg-rose-200/70 text-earth-900'
                    : 'text-earth-700 hover:bg-rose-100/50'
                }`}
              >
                <span className={`shrink-0 ${pathname.startsWith('/configuracion') ? 'text-earth-800' : 'text-earth-500'}`}>
                  <SettingsIcon />
                </span>
                {copy.settings}
              </Link>
            )}
          </nav>
        </div>

        <div className="shrink-0 border-t border-rose-100/80 px-4 pb-8 pt-4">
          {user ? (
            <button
              type="button"
              onClick={() => {
                onSignOut()
                onClose()
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-earth-200 bg-white px-4 py-3.5 text-sm font-semibold text-earth-800 transition hover:border-rose-200 hover:bg-rose-50"
            >
              <LogOutIcon />
              {copy.signOut}
            </button>
          ) : (
            <Link
              href={loginPath(pathname)}
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-earth-200 bg-white px-4 py-3.5 text-sm font-semibold text-earth-800 transition hover:border-rose-200 hover:bg-rose-50"
            >
              {copy.signIn}
            </Link>
          )}
        </div>
      </aside>
    </div>
  )
}

function SettingsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

function QuotesIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7.05 9.75H5.1c.15-1.65 1.05-3.3 2.55-4.2L6.6 3.9C4.35 5.25 3 7.65 3 10.5v3h4.05V9.75zm9.9 0h-1.95c.15-1.65 1.05-3.3 2.55-4.2l-.95-1.65c-2.25 1.35-3.6 3.75-3.6 6.6v3H18V9.75z" />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

function MusicIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 11-1.632 2.163L9 18.75V9.75m0 0l10.5-3M9 9v9.75" />
    </svg>
  )
}

function DumbbellIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 9v6m10.5-6v6M4.5 9.75h15M7.5 9.75h9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75v4.5c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75v-4.5a.75.75 0 00-.75-.75h-.75a.75.75 0 00-.75.75zm16.5 0v4.5c0 .414-.336.75-.75.75h-.75a.75.75 0 01-.75-.75v-4.5a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75z" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  )
}

function LogOutIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  )
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return parts[0]?.slice(0, 2).toUpperCase() ?? '?'
}
