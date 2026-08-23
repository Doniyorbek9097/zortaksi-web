import type { AdminSlashCommandItem } from '~/types/adminCommands'

export function useAdminSlashCommands() {
  const commands = ref<AdminSlashCommandItem[]>([])
  const loaded = ref(false)
  const loading = ref(false)

  const load = async () => {
    if (loaded.value || loading.value) return
    loading.value = true
    try {
      const res = await useApi<{ success: boolean; data: AdminSlashCommandItem[] }>(
        '/admin/commands',
      )
      commands.value = res.data ?? []
      loaded.value = true
    } catch {
      commands.value = []
    } finally {
      loading.value = false
    }
  }

  return { commands, loaded, loading, load }
}
