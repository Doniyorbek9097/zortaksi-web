<template>
  <Teleport to="body">
    <Transition name="cd-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-end justify-center md:items-center bg-black/40 dark:bg-black/70 backdrop-blur-sm"
        @click.self="close"
      >
        <Transition name="cd-sheet" appear>
          <div
            v-if="modelValue"
            class="w-full md:max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 md:p-6"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">Guruh qo'shish</h3>
                <p class="text-[11px] font-medium text-slate-400 mt-0.5">
                  Har bir qatorda havola: t.me/…, @username yoki +invite
                </p>
              </div>
              <button
                type="button"
                class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
                aria-label="Yopish"
                @click="close"
              >
                <font-awesome-icon icon="fa-solid fa-times" />
              </button>
            </div>

            <textarea
              v-model="linksText"
              rows="8"
              placeholder="https://t.me/groupname&#10;https://t.me/+AbCdEf..."
              class="mt-4 w-full px-3.5 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y min-h-[140px]"
              :disabled="busy"
            />

            <p v-if="statusText" class="mt-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {{ statusText }}
            </p>

            <ul v-if="results.length" class="mt-3 max-h-40 overflow-y-auto space-y-1 text-[11px]">
              <li
                v-for="(r, i) in results"
                :key="i"
                class="truncate"
                :class="r.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'"
              >
                {{ r.ok ? '✓' : '✗' }} {{ r.raw }}
                <span v-if="r.already"> (allaqachon a'zo)</span>
                <span v-else-if="r.error"> — {{ r.error }}</span>
              </li>
            </ul>

            <div class="mt-5 space-y-2">
              <button
                type="button"
                :disabled="busy || !linksText.trim()"
                class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
                @click="onSave"
              >
                <font-awesome-icon
                  :icon="busy ? 'fa-solid fa-spinner' : 'fa-solid fa-user-plus'"
                  :class="busy ? 'animate-spin' : ''"
                />
                Saqlash va qo'shilish
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
type JoinResult = { raw: string; ok: boolean; already?: boolean; error?: string }
type JoinJob = {
  running: boolean
  total: number
  done: number
  results: JoinResult[]
}

const props = defineProps<{
  modelValue: boolean
  userId: string
}>()

const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const linksText = ref('')
const busy = ref(false)
const statusText = ref('')
const results = ref<JoinResult[]>([])
let pollTimer: ReturnType<typeof setInterval> | null = null

const close = () => {
  stopPoll()
  emit('update:modelValue', false)
}

const stopPoll = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

const pollStatus = async () => {
  try {
    const res = await useApi<JoinJob | null>(
      `/drivers/${encodeURIComponent(props.userId)}/groups/join-links/status`
    )
    const job = res.data
    if (!job) return
    results.value = job.results || []
    statusText.value = job.running
      ? `Jarayon: ${job.done}/${job.total}`
      : `Tugadi: ${job.done}/${job.total}`
    if (!job.running) {
      busy.value = false
      stopPoll()
    }
  } catch {
  }
}

const onSave = async () => {
  if (!props.userId || !linksText.value.trim()) return
  busy.value = true
  statusText.value = 'Navbatga qo\'yilmoqda…'
  results.value = []
  try {
    const res = await useApi<{ queued: number }>(
      `/drivers/${encodeURIComponent(props.userId)}/groups/join-links`,
      { method: 'POST', body: { links: linksText.value } }
    )
    if (res.success) {
      statusText.value = `${res.data?.queued || 0} ta havola navbatda`
      stopPoll()
      pollTimer = setInterval(() => void pollStatus(), 2000)
      void pollStatus()
    } else {
      statusText.value = res.message || 'Xatolik'
      busy.value = false
    }
  } catch (e: any) {
    statusText.value = e?.data?.message || e?.message || 'Xatolik'
    busy.value = false
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      stopPoll()
      linksText.value = ''
      statusText.value = ''
      results.value = []
      busy.value = false
    }
  }
)

onBeforeUnmount(stopPoll)
</script>
