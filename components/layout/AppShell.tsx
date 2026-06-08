'use client'

import { AppFooter } from '@/components/layout/AppFooter'
import { AppHeader } from '@/components/layout/AppHeader'
import { ChatWidget } from '@/components/interactive/ChatWidget'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <main>{children}</main>
      <AppFooter />
      <ChatWidget />
    </>
  )
}
