<template>
  <div
    class="shrink-0 z-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg"
  >
    <div class="mx-auto w-full max-w-2xl px-3 py-2.5 flex items-center justify-between gap-3">
      <button
        type="button"
        class="inline-flex items-center gap-2 text-[13px] font-bold text-slate-600 dark:text-slate-300"
        @click="$emit('cancel')"
      >
        <font-awesome-icon icon="fa-solid fa-xmark" />
        Bekor qilish
      </button>

      <span class="text-[12px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
        {{ selectedCount }} ta tanlandi
      </span>

      <button
        type="button"
        :disabled="selectedCount === 0 || deleting"
        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-black text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        @click="$emit('delete')"
      >
        <font-awesome-icon :icon="deleting ? 'fa-solid fa-spinner' : 'fa-solid fa-trash'" :class="{ 'animate-spin': deleting }" />
        O'chirish
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  selectedCount?: number
  deleting?: boolean
}

withDefaults(defineProps<Props>(), {
  selectedCount: 0,
  deleting: false,
})

defineEmits<{ cancel: []; delete: [] }>()
</script>
