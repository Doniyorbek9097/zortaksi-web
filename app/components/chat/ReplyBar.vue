<template>
  <div
    v-if="reply"
    class="mx-auto w-full max-w-2xl px-3 pt-2"
  >
    <div
      class="flex items-center gap-2 rounded-xl border px-3 py-2 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800"
    >
      <div
        class="w-8 h-8 shrink-0 rounded-lg bg-sky-500 text-white flex items-center justify-center text-sm"
      >
        <font-awesome-icon icon="fa-solid fa-reply" class="text-[12px]" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-[10px] font-black uppercase tracking-wide text-sky-600 dark:text-sky-400">
          {{ reply.out ? 'O\'zingiz' : 'Javob' }}
        </p>
        <p class="text-[12px] font-bold text-slate-700 dark:text-slate-200 truncate">
          {{ reply.text }}
        </p>
      </div>
      <button
        type="button"
        class="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-slate-400 hover:bg-black/5 dark:hover:bg-white/10"
        aria-label="Javobni bekor qilish"
        @click="$emit('cancel')"
      >
        <font-awesome-icon icon="fa-solid fa-times" class="text-sm" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface ChatReplyTarget {
  id: string
  text: string
  out?: boolean
}

defineProps<{
  reply: ChatReplyTarget | null
}>()

defineEmits<{ cancel: [] }>()
</script>
