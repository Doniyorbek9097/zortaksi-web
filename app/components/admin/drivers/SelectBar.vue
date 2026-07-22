<template>
  <div class="flex items-center justify-between gap-3 flex-wrap">
    <p class="text-[13px] font-bold text-slate-500 dark:text-slate-400">
      {{ count }} ta
      <span v-if="selectedCount" class="text-sky-500">· {{ selectedCount }} tanlandi</span>
    </p>
    <div class="flex items-center gap-2">
      <button
        v-if="selectedCount > 0"
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-black border border-sky-400 text-sky-600 bg-sky-50 dark:bg-sky-950/30 dark:text-sky-400 active:scale-95 transition-all"
        @click="$emit('message')"
      >
        <font-awesome-icon icon="fa-solid fa-paper-plane" class="text-[10px]" />
        Xabar yuborish
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-black border transition-all active:scale-95"
        :class="allSelected
          ? 'border-sky-400 text-sky-600 bg-sky-50 dark:bg-sky-950/30 dark:text-sky-400'
          : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900'"
        @click="$emit('toggle-all')"
      >
        <font-awesome-icon
          icon="fa-solid fa-check"
          class="text-[10px]"
          :class="allSelected ? 'opacity-100' : 'opacity-40'"
        />
        Hammasini belgilash
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  count: number
  selectedCount?: number
  allSelected?: boolean
}>()
defineEmits<{ 'toggle-all': []; message: [] }>()
</script>
