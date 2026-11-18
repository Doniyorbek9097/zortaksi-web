<template>
  <div
    class="rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-900 space-y-3"
    :class="compact ? 'p-3' : 'p-4'"
  >
    <p
      class="font-bold text-slate-700 dark:text-slate-200 leading-snug"
      :class="compact ? 'text-[12px]' : 'text-[13px]'"
    >
      Hisoblar, to'lov va xizmatlar uchun Telegram orqali ro'yxatdan o'ting.
    </p>
    <button
      type="button"
      class="w-full rounded-xl text-sm font-black text-white bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] transition-all"
      :class="compact ? 'py-2.5' : 'py-3'"
      @click="emit('connect')"
    >
      Ro'yxatdan o'tish / Kirish
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const emit = defineEmits<{ connect: [] }>()
</script>