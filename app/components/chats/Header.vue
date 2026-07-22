<template>
  <header class="flex items-center justify-between gap-3">
    <div class="min-w-0">
      <h1 class="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Chatlar</h1>
      <p class="text-[12px] font-medium text-slate-400 dark:text-slate-500 truncate">
        <template v-if="selectionMode">{{ selectedCount }} tanlangan · {{ count }}</template>
        <template v-else>Buyurtmachilar bilan yozishmalar · {{ count }}</template>
      </p>
    </div>

    <div class="flex items-center gap-2 shrink-0">
      <!-- Bekor (selection mode) -->
      <button
        v-if="selectionMode"
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-black text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15 active:scale-95 transition-all"
        @click="$emit('cancel-select')"
      >
        <font-awesome-icon icon="fa-solid fa-times" />
        Bekor
      </button>

      <!-- Tanlash rejimiga kirish -->
      <button
        v-else
        type="button"
        class="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 active:scale-95 transition-all"
        aria-label="Tanlash"
        @click="$emit('enter-select')"
      >
        <font-awesome-icon icon="fa-solid fa-check" />
      </button>

      <!-- Yangilash -->
      <button
        type="button"
        class="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 active:scale-95 transition-all"
        :class="{ 'animate-spin': refreshing }"
        aria-label="Yangilash"
        @click="$emit('refresh')"
      >
        <font-awesome-icon icon="fa-solid fa-rotate" />
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
