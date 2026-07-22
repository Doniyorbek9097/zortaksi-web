<template>
  <div class="flex items-center justify-between gap-3">
    <!-- Hammasini belgilash -->
    <button type="button" class="inline-flex items-center gap-2.5 group" @click="$emit('toggle-all')">
      <span
        class="w-5 h-5 rounded-md flex items-center justify-center border-2 transition-colors"
        :class="allSelected
          ? 'bg-indigo-500 border-indigo-500 text-white'
          : 'border-slate-300 dark:border-slate-600 text-transparent group-hover:border-indigo-400'"
      >
        <font-awesome-icon icon="fa-solid fa-check" class="text-[10px]" />
      </span>
      <span class="text-[13px] font-bold text-slate-600 dark:text-slate-300">Hammasini belgilash</span>
    </button>

    <!-- Tozalash -->
    <button
      type="button"
      :disabled="selectedCount === 0"
      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-black text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      @click="$emit('clear')"
    >
      <font-awesome-icon icon="fa-solid fa-trash" />
      Tozalash
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  allSelected?: boolean
  selectedCount?: number
}

withDefaults(defineProps<Props>(), {
  allSelected: false,
  selectedCount: 0,
})

defineEmits<{ 'toggle-all': []; clear: [] }>()
</script>
