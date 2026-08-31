'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { LangToggle } from '@/components/common/LangToggle'
import { MobileNavDrawer } from '@/components/layout/MobileNavDrawer'
import { useLocale } from '@/components/providers/LocaleProvider'
import { loginPath } from '@/lib/auth-redirect'
import { getTranslations } from '@/lib/i18n'
import { createSupabaseClient } from '@/lib/supabase'

export function AppHeader() {
  const pathname = usePathname()
  const { lang } = useLocale()
  const headerCopy = getTranslations(lang).header

  const navigation = [
    { label: headerCopy.navHome, to: '/' },
    { label: headerCopy.navPhrases, to: '/frases' },
    { label: headerCopy.navProducts, to: '/productos' },
    { label: headerCopy.navMusic, to: '/melodias' },
    { label: headerCopy.navExercises, to: '/ejercicios' },
    { label: headerCopy.navProgress, to: '/progreso' },
  ]
  const [user, setUser] = useState<User | null>(null)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isTransparent, setIsTransparent] = useState(false)

  useEffect(() => {
    function updateTransparency() {
      setIsTransparent(window.scrollY > 0)
    }

    updateTransparency()
    window.addEventListener('scroll', updateTransparency, { passive: true })
    return () => window.removeEventListener('scroll', updateTransparency)
  }, [])

  useEffect(() => {
    setIsTransparent(window.scrollY > 0)
    setAvatarOpen(false)
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    const supabase = createSupabaseClient()

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => { listener.subscription.unsubscribe() }
  }, [])

  async function handleSignOut() {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    setAvatarOpen(false)
    setMobileMenuOpen(false)
  }

  const displayName = user?.user_metadata?.full_name as string | undefined
  const initials = displayName
    ? getInitials(displayName)
    : user?.email?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-40">
      {/* Mobile bar */}
      <div className="border-b border-earth-100 bg-white md:hidden">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center text-earth-700"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? headerCopy.closeMenu : headerCopy.openMenu}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="font-display text-[1.65rem] leading-none text-earth-900"
          >
            Amará
          </Link>

          {user ? (
            <div
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-rose-200 ring-2 ring-rose-200/80"
              aria-hidden
            >
              {user.user_metadata?.avatar_url ? (
                <Image
                  src={user.user_metadata.avatar_url as string}
                  alt=""
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-rose-600">{initials}</span>
              )}
            </div>
          ) : (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-earth-500"
              aria-hidden
            >
              <UserIcon />
            </div>
          )}
        </nav>
      </div>

      <MobileNavDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        lang={lang}
        onSignOut={handleSignOut}
      />

      {/* Desktop bar */}
      <div
        className={`hidden transition-all duration-300 md:block ${
          isTransparent
            ? 'border-b border-transparent bg-transparent backdrop-blur-none'
            : 'border-b border-earth-200/60 bg-cream/80 backdrop-blur-xl'
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/logo-amara-navbar.png"
              alt="Amará"
              width={1280}
              height={249}
              unoptimized
              className="h-9 w-auto object-contain object-left sm:h-10"
              priority
            />
          </Link>

          <div className="flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = item.to === '/'
                ? pathname === '/'
                : pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={`relative px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'text-earth-900'
                      : 'text-earth-500 hover:text-earth-800'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-rose-300" />
                  )}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <LangToggle />
            {!user ? (
              <Link
                href={loginPath(pathname)}
                className="rounded-full border border-earth-300 px-5 py-2 text-sm font-medium text-earth-700 transition hover:border-rose-300 hover:text-rose-400"
              >
                {headerCopy.signIn}
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setAvatarOpen(v => !v)}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-rose-200 text-xs font-semibold text-rose-600 ring-2 ring-rose-300/40 transition hover:ring-rose-300"
                  aria-label={headerCopy.userMenu}
                >
                  {user.user_metadata?.avatar_url ? (
                    <Image
                      src={user.user_metadata.avatar_url as string}
                      alt="Avatar"
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </button>

                {avatarOpen && (
                  <div className="absolute right-0 top-12 z-50 min-w-[180px] rounded-2xl border border-earth-200 bg-white py-2 shadow-[0_8px_30px_rgba(53,41,35,0.12)]">
                    <Link
                      href="/configuracion"
                      onClick={() => setAvatarOpen(false)}
                      className="block border-b border-earth-100 px-4 pb-2 transition hover:bg-sand-50"
                    >
                      <p className="text-xs font-semibold text-earth-700">
                        {displayName ?? headerCopy.myAccount}
                      </p>
                      <p className="truncate text-xs text-earth-400">{user.email}</p>
                    </Link>
                    <Link
                      href="/configuracion"
                      onClick={() => setAvatarOpen(false)}
                      className="block px-4 py-2 text-sm text-earth-600 transition hover:bg-sand-50 hover:text-earth-900"
                    >
                      {headerCopy.settings}
                    </Link>
                    <Link
                      href="/progreso"
                      onClick={() => setAvatarOpen(false)}
                      className="block px-4 py-2 text-sm text-earth-600 transition hover:bg-sand-50 hover:text-earth-900"
                    >
                      {headerCopy.myProgress}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-rose-400 transition hover:bg-rose-50"
                    >
                      {headerCopy.signOut}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}

function MenuIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
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
