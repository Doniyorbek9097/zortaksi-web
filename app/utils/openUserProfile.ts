import { compactQuery } from '~/utils/navigationQuery'

export type OpenUserProfileOptions = {
  userId?: string | null
  name?: string
  avatar?: string
  chatId?: string
  orderId?: string
  phone?: string
  username?: string
}

/** Foydalanuvchi profil sahifasiga o'tish */
export function openUserProfile(opts: OpenUserProfileOptions) {
  const id = String(opts.userId || '').trim()
  if (!id) return

  void navigateTo({
    path: `/driver/user/${encodeURIComponent(id)}`,
    query: compactQuery({
      name: opts.name || undefined,
      avatar: opts.avatar || undefined,
      chatId: opts.chatId || undefined,
      orderId: opts.orderId || undefined,
      phone: opts.phone || undefined,
      username: opts.username || undefined,
    }),
  })
}
