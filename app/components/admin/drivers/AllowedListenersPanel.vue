<template>
  <section
    class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
  >
    <h2 class="text-sm font-black text-slate-900 dark:text-white">Tinglovchi userbotlar</h2>
    <p class="text-[11px] font-medium text-slate-500 leading-relaxed">
      Subadmin bot guruhlarida faqat shu ro'yxatdagi tinglovchilarni tanlay oladi.
    </p>

    <div
      v-if="!allCandidates.length"
      class="px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 text-[11px] font-semibold text-amber-700 dark:text-amber-300"
    >
      listenGroups yoqilgan userbot yo'q.
    </div>

    <ul
      v-else
      class="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800"
    >
      <li v-for="c in allCandidates" :key="c.userId">
        <label
          class="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50"
        >
          <input
            type="checkbox"
            class="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
            :checked="selected.has(c.userId)"
            @change="toggle(c.userId, ($event.target as HTMLInputElement).checked)"
          >
          <span class="min-w-0 flex-1 text-[12px] font-bold text-slate-800 dark:text-slate-100 truncate">
            {{ c.label }}{{ c.username ? ` (@${c.username})` : '' }}
          </span>
        </label>
      </li>
    </ul>

    <button
      type="button"
      class="w-full rounded-xl bg-sky-500 text-white font-black py-2.5 text-sm disabled:opacity-50"
      :disabled="saving || !allCandidates.length"
      @click="save"
    >
      {{ saving ? '...' : 'Tinglovchilarni saqlash' }}
    </button>
    <p v-if="message" class="text-[11px] font-bold" :class="messageOk ? 'text-emerald-500' : 'text-red-500'">
      {{ message }}
    </p>
  </section>
</template>

<script setup lang="ts">
import type { ListenerCandidate } from '~/stores/bot-group.store'

const props = defineProps<{
  driverId: string
  allowedIds?: string[] | null
}>()

const emit = defineEmits<{ saved: [] }>()

const allCandidates = ref<ListenerCandidate[]>([])
const selected = ref(new Set<string>())
const saving = ref(false)
const message = ref('')
const messageOk = ref(true)

const syncSelected = () => {
  selected.value = new Set((props.allowedIds || []).map((id) => String(id).trim()).filter(Boolean))
}

watch(
  () => [props.driverId, props.allowedIds] as const,
  () => syncSelected(),
  { immediate: true }
)

const loadCandidates = async () => {
  try {
    const res = await useApi('/bot-groups/listener-candidates')
    if (res?.success) {
      allCandidates.value = (res.data?.candidates ?? []) as ListenerCandidate[]
    }
  } catch {
    allCandidates.value = []
  }
}

onMounted(() => {
  void loadCandidates()
})

const toggle = (userId: string, checked: boolean) => {
  const next = new Set(selected.value)
  if (checked) next.add(userId)
  else next.delete(userId)
  selected.value = next
}

const save = async () => {
  if (!props.driverId) return
  message.value = ''
  saving.value = true
  try {
    const res = await useApi(`/drivers/${encodeURIComponent(props.driverId)}/allowed-listeners`, {
      method: 'PATCH',
      body: { allowedListenerUserIds: [...selected.value] },
    })
    if (!res?.success) throw new Error(res?.message || 'Xato')
    messageOk.value = true
    message.value = 'Tinglovchilar saqlandi'
    emit('saved')
  } catch (e: any) {
    messageOk.value = false
    message.value = e?.response?.data?.message || e?.message || 'Saqlanmadi'
  } finally {
    saving.value = false
  }
}
</script>
