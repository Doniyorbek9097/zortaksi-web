<template>
  <header class="flex items-center justify-between gap-2 sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
    <div class="min-w-0 leading-none">
      <h1 class="text-base font-black text-slate-900 dark:text-white">Chatlar</h1>
      <p class="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 truncate">
        <template v-if="selectionMode">{{ selectedCount }} tanlangan · {{ count }}</template>
        <template v-else>{{ count }} yozishma</template>
      </p>
    </div>

    <div class="flex items-center gap-1 shrink-0">
      <button
        v-if="selectionMode"
        type="button"
        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black text-red-600 dark:text-red-400 bg-red-500/10 active:scale-95 transition-all"
        @click="$emit('cancel-select')"
      >
        <font-awesome-icon icon="fa-solid fa-times" />
        Bekor
      </button>

      <button
        v-else
        type="button"
        class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 active:scale-95 transition-all"
        aria-label="Tanlash"
        @click="$emit('enter-select')"
      >
        <font-awesome-icon icon="fa-solid fa-check" class="text-xs" />
      </button>

      <button
        type="button"
        class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 active:scale-95 transition-all"
        :class="{ 'animate-spin': refreshing }"
        aria-label="Yangilash"
        @click="$emit('refresh')"
      >
        <font-awesome-icon icon="fa-solid fa-rotate" class="text-xs" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  count?: number
  selectionMode?: boolean
  selectedCount?: number
  refreshing?: boolean
}

withDefaults(defineProps<Props>(), {
  count: 0,
  selectionMode: false,
  selectedCount: 0,
  refreshing: false,
})

defineEmits<{
  'enter-select': []
  'cancel-select': []
  refresh: []
}>()
</script>
