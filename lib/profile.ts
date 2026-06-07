import { createSupabaseClient } from '@/lib/supabase'

const AVATAR_BUCKET = 'avatars'

export type UserProfile = {
  id: string
  full_name: string | null
  username: string | null
  bio: string | null
  location: string | null
  avatar_url: string | null
}

export type ProfileFormData = {
  fullName: string
  bio: string
  location: string
  avatarUrl: string | null
}

export type ProfileSaveOptions = {
  email?: string | null
}

function deriveUsername(
  email: string | null | undefined,
  fullName: string,
  userId: string,
): string {
  const fromEmail = email
    ?.split('@')[0]
    ?.replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase()

  if (fromEmail && fromEmail.length >= 3) return fromEmail.slice(0, 30)

  const fromName = fullName
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase()

  if (fromName.length >= 3) return fromName.slice(0, 30)

  return `user_${userId.replace(/-/g, '').slice(0, 12)}`
}

function isMissingColumnError(error: { message?: string; code?: string }): boolean {
  const message = error.message?.toLowerCase() ?? ''
  return (
    error.code === '42703' ||
    message.includes('column') ||
    message.includes('does not exist')
  )
}

function isPermissionError(error: { message?: string; code?: string }): boolean {
  const message = error.message?.toLowerCase() ?? ''
  return (
    error.code === '42501' ||
    message.includes('permission denied') ||
    message.includes('row-level security')
  )
}

function isStorageError(error: { message?: string; code?: string; statusCode?: string | number }): boolean {
  const message = error.message?.toLowerCase() ?? ''
  return (
    message.includes('bucket') ||
    message.includes('storage') ||
    message.includes('not found') ||
    error.statusCode === '403' ||
    error.statusCode === 404
  )
}

export function getProfileErrorMessage(
  error: unknown,
  copy: {
    profileSaveError: string
    profilePermissionError: string
    profileMigrationHint: string
  },
): string {
  if (!error || typeof error !== 'object') return copy.profileSaveError

  const err = error as { message?: string; code?: string }
  if (isPermissionError(err)) {
    return `${copy.profilePermissionError} ${copy.profileMigrationHint}`
  }

  if (isMissingColumnError(err)) {
    return copy.profileMigrationHint
  }

  if (typeof err.message === 'string' && err.message.trim()) {
    return err.message
  }

  return copy.profileSaveError
}

export function getAvatarErrorMessage(
  error: unknown,
  copy: {
    avatarUploadError: string
    avatarStorageError: string
    profileMigrationHint: string
  },
): string {
  if (!error || typeof error !== 'object') return copy.avatarUploadError

  const err = error as { message?: string; code?: string; statusCode?: string | number }

  if (isStorageError(err) || isPermissionError(err)) {
    return `${copy.avatarStorageError} ${copy.profileMigrationHint}`
  }

  if (typeof err.message === 'string' && err.message.trim()) {
    return err.message
  }

  return copy.avatarUploadError
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, bio, location, avatar_url')
    .eq('id', userId)
    .maybeSingle()

  if (!error) {
    return (data as UserProfile | null) ?? null
  }

  if (isMissingColumnError(error)) {
    const { data: base, error: baseError } = await supabase
      .from('profiles')
      .select('id, full_name, username')
      .eq('id', userId)
      .maybeSingle()

    if (baseError) throw baseError

    if (!base) return null

    return {
      ...(base as Pick<UserProfile, 'id' | 'full_name' | 'username'>),
      bio: null,
      location: null,
      avatar_url: null,
    }
  }

  throw error
}

async function updateProfileRow(
  userId: string,
  payload: Record<string, string | null>,
): Promise<void> {
  const supabase = createSupabaseClient()
  const { error } = await supabase.from('profiles').update(payload).eq('id', userId)
  if (error) throw error
}

async function insertProfileRow(
  userId: string,
  payload: Record<string, string | null>,
): Promise<void> {
  const supabase = createSupabaseClient()
  const { error } = await supabase.from('profiles').insert({ id: userId, ...payload })
  if (error) throw error
}

export async function saveUserProfile(
  userId: string,
  input: ProfileFormData,
  options?: ProfileSaveOptions,
): Promise<void> {
  const supabase = createSupabaseClient()
  const fullName = input.fullName.trim()
  const bio = input.bio.trim() || null
  const location = input.location.trim() || null
  const avatarUrl = input.avatarUrl?.trim() || null

  const fullPayload = {
    full_name: fullName || null,
    bio,
    location,
    avatar_url: avatarUrl,
  }

  const basePayload = {
    full_name: fullName || null,
    avatar_url: avatarUrl,
  }

  const { data: existing, error: fetchError } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', userId)
    .maybeSingle()

  if (fetchError && !isPermissionError(fetchError)) {
    throw fetchError
  }

  const profileExists = Boolean(existing?.id)

  if (profileExists) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update(fullPayload)
      .eq('id', userId)

    if (updateError) {
      if (isMissingColumnError(updateError)) {
        await updateProfileRow(userId, basePayload)
      } else {
        throw updateError
      }
    }
  } else {
    const username = deriveUsername(options?.email, fullName, userId)
    const insertFull = { username, ...fullPayload }
    const insertBase = { username, ...basePayload }

    const { error: insertError } = await supabase.from('profiles').insert(insertFull)

    if (insertError) {
      if (insertError.code === '23505') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(fullPayload)
          .eq('id', userId)

        if (updateError) {
          if (isMissingColumnError(updateError)) {
            await updateProfileRow(userId, basePayload)
          } else {
            throw updateError
          }
        }
      } else if (isMissingColumnError(insertError)) {
        await insertProfileRow(userId, insertBase)
      } else {
        throw insertError
      }
    }
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: fullName || null,
      avatar_url: avatarUrl,
    },
  })

  if (authError) throw authError
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const supabase = createSupabaseClient()
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension) ? extension : 'jpg'
  const path = `${userId}/avatar.${safeExt}`

  await supabase.storage.from(AVATAR_BUCKET).remove([path])

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
  return `${data.publicUrl}?t=${Date.now()}`
}

export async function changePassword(input: {
  email: string
  currentPassword: string
  newPassword: string
}): Promise<void> {
  const supabase = createSupabaseClient()

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.currentPassword,
  })

  if (verifyError) {
    throw new Error('INVALID_CURRENT_PASSWORD')
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: input.newPassword,
  })

  if (updateError) throw updateError
}

export function getProfileDisplayName(
  profile: UserProfile | null,
  metadata?: Record<string, unknown>,
  email?: string | null,
): string {
  const fromProfile = profile?.full_name?.trim()
  if (fromProfile) return fromProfile

  const fromMeta = typeof metadata?.full_name === 'string' ? metadata.full_name.trim() : ''
  if (fromMeta) return fromMeta

  return email?.split('@')[0] ?? ''
}

export function getProfileAvatarUrl(
  profile: UserProfile | null,
  metadata?: Record<string, unknown>,
): string | null {
  const fromProfile = profile?.avatar_url?.trim()
  if (fromProfile) return fromProfile

  const fromMeta = typeof metadata?.avatar_url === 'string' ? metadata.avatar_url.trim() : ''
  return fromMeta || null
}
