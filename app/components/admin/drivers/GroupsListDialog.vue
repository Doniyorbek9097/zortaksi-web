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
            class="w-full md:max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl"
          >
            <div class="p-5 pb-3 flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">Guruhlari</h3>
                <p class="text-[11px] font-medium text-slate-400 mt-0.5">
                  Haydovchi a'zo bo'lgan megaguruhlar
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

            <div class="flex-1 overflow-y-auto p-4 space-y-2">
              <p v-if="loading" class="text-center text-sm text-slate-400 py-8">
                <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin mr-2" />
                Yuklanmoqda…
              </p>
              <p v-else-if="error" class="text-center text-sm text-rose-500 py-6">{{ error }}</p>
              <p v-else-if="!groups.length" class="text-center text-sm text-slate-400 py-8">
                Guruh topilmadi yoki Telegram sessiyasi yo'q
              </p>
              <div
                v-for="g in groups"
                :key="g.id"
                class="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/80 dark:bg-slate-950/50"
              >
                <p class="text-sm font-black text-slate-900 dark:text-white truncate">{{ g.title }}</p>
                <p v-if="g.username" class="text-[11px] text-slate-400 mt-0.5">@{{ g.username }}</p>
                <div v-if="g.joinUrl" class="mt-2 flex gap-2 items-center">
                  <input
                    :value="g.joinUrl"
                    readonly
                    class="flex-1 min-w-0 px-2.5 py-2 rounded-lg text-[11px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  >
                  <button
                    type="button"
                    class="shrink-0 px-3 py-2 rounded-lg text-[11px] font-black text-sky-600 dark:text-sky-400 border border-sky-400/40 bg-sky-50 dark:bg-sky-950/40 active:scale-95"
                    @click="copy(g.joinUrl)"
                  >
                    Nusxa
                  </button>
                </div>
                <p v-else class="mt-1.5 text-[10px] text-slate-400">Ommaviy @username yo'q — havola nusxalanmaydi</p>
              </div>
            </div>

            <div class="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                v-if="allJoinUrls.length"
                type="button"
                class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-white bg-sky-500 hover:bg-sky-600 active:scale-[0.98] transition-all"
                @click="copyAll"
              >
                <font-awesome-icon :icon="copiedAll ? 'fa-solid fa-check' : 'fa-solid fa-copy'" />
                {{ copiedAll ? 'Nusxalandi' : 'Nusxa olish' }}
              </button>
              <button
                type="button"
                class="w-full py-3 rounded-xl text-sm font-black text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                @click="refresh"
              >
                Yangilash
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
export type AdminDriverGroupRow = {
  id: string
  title: string
  username?: string
  joinUrl?: string
}

const props = defineProps<{
  modelValue: boolean
  userId: string
}>()

const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const groups = ref<AdminDriverGroupRow[]>([])
const loading = ref(false)
const error = ref('')
const copiedAll = ref(false)
let copiedAllTimer: ReturnType<typeof setTimeout> | null = null

const allJoinUrls = computed(() =>
  groups.value.map((g) => g.joinUrl).filter((u): u is string => !!String(u || '').trim())
)

const close = () => emit('update:modelValue', false)

const load = async () => {
  if (!props.userId) return
  loading.value = true
  error.value = ''
  try {
    const res = await useApi<{ groups: AdminDriverGroupRow[] }>(
      `/drivers/${encodeURIComponent(props.userId)}/groups`
    )
    if (res.success) {
      groups.value = res.data?.groups || []
    } else {
      error.value = res.message || 'Xatolik'
    }
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Yuklab bo\'lmadi'
  } finally {
    loading.value = false
  }
}

const refresh = () => void load()

const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    /* ignore */
  }
}

const copyAll = async () => {
  if (!allJoinUrls.value.length) return
  await copy(allJoinUrls.value.join('\n'))
  copiedAll.value = true
  if (copiedAllTimer) clearTimeout(copiedAllTimer)
  copiedAllTimer = setTimeout(() => {
    copiedAll.value = false
    copiedAllTimer = null
  }, 2000)
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      copiedAll.value = false
      void load()
    } else if (copiedAllTimer) {
      clearTimeout(copiedAllTimer)
      copiedAllTimer = null
    }
  }
)

onBeforeUnmount(() => {
  if (copiedAllTimer) clearTimeout(copiedAllTimer)
})
</script>
