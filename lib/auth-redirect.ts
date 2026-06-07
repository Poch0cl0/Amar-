export function safeRedirect(path: string | null | undefined): string {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/login')) {
    return '/'
  }
  return path
}

export function loginPath(currentPath: string): string {
  if (currentPath === '/login') return '/login'
  return `/login?redirect=${encodeURIComponent(currentPath)}`
}
