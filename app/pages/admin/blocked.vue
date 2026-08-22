<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <header class="sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 space-y-3">
      <h1 class="text-base font-black text-slate-900 dark:text-white">Bloklanganlar</h1>
      <AdminSegmentTabs v-model="tab" :tabs="tabs" />
    </header>

    <div v-if="store.isLoading && !store.items.length" class="space-y-3">
      <div
        v-for="n in 4"
        :key="n"
        class="h-24 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"
      />
    </div>

    <BaseEmptyState
      v-else-if="!filtered.length"
      :icon="tab === 'user' ? 'fa-solid fa-user-slash' : 'fa-solid fa-users-slash'"
      :title="tab === 'user' ? 'Bloklangan user yo\'q' : 'Bloklangan guruh yo\'q'"
      tone="slate"
    />

    <div v-else class="space-y-3">
      <article
        v-for="row in filtered"
        :key="row.id"
        class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-sm"
      >
        <div class="flex items-start gap-3">
          <span
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm"
            :class="row.type === 'sender'
              ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600'
              : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600'"
          >
            <font-awesome-icon
              :icon="row.type === 'sender' ? 'fa-solid fa-user' : 'fa-solid fa-users'"
            />
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-black text-slate-900 dark:text-white truncate">
              {{ displayTitle(row) }}
            </p>
            <p v-if="row.username" class="text-[12px] font-medium text-slate-500 truncate">
              @{{ row.username.replace(/^@/, '') }}
            </p>
            <p class="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
              ID: {{ row.targetId }}
            </p>
            <p v-if="row.createdAt" class="text-[10px] text-slate-400 mt-1">
              {{ formatDate(row.createdAt) }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="w-full py-2.5 rounded-xl text-[12px] font-black text-white bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-50"
          :disabled="store.unblockingId === row.id"
          @click="onUnblock(row)"
        >
          <font-awesome-icon
            v-if="store.unblockingId === row.id"
            icon="fa-solid fa-spinner"
            class="animate-spin mr-1"
          />
          Blokdan chiqarish
        </button>
      </article>
    </div>

    <p v-if="error" class="text-center text-[12px] font-bold text-red-500">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { useBlockStore, type BlockRow } from '~/stores/block.store'

definePageMeta({
  layout: 'admin',
})

const store = useBlockStore()
const tab = ref<'user' | 'group'>('user')
const error = ref('')

const tabs = [
  { label: 'User', value: 'user' },
  { label: 'Group', value: 'group' },
]

const apiType = computed(() => (tab.value === 'user' ? 'sender' : 'group') as 'sender' | 'group')

const filtered = computed(() =>
  store.items.filter((row) => row.type === apiType.value)
)

const displayTitle = (row: BlockRow) => {
  const t = String(row.title || '').trim()
  if (t) return t
  const u = String(row.username || '').replace(/^@/, '').trim()
  if (u) return `@${u}`
  return row.targetId
}

const formatDate = (raw: string) => {
  try {
    return new Date(raw).toLocaleString('uz-UZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return raw
  }
}

const load = async () => {
  error.value = ''
  try {
    await store.fetchBlocks(apiType.value)
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Yuklash xato'
  }
}

const onUnblock = async (row: BlockRow) => {
  error.value = ''
  try {
    const res = await store.unblock(row)
    if (!res?.success) {
      error.value = res?.message || 'Blokdan chiqarib bo\'lmadi'
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Blokdan chiqarib bo\'lmadi'
  }
}

watch(tab, () => {
  void load()
})

onMounted(() => {
  void load()
})
</script>
