<template>
  <div
    class="mb-1.5 rounded-lg px-2.5 py-1.5 border-l-[3px] text-left bg-slate-100 border-sky-500 text-slate-600 dark:bg-slate-600/50 dark:border-sky-400 dark:text-slate-200"
  >
    <p
      class="text-[10px] font-black uppercase tracking-wide text-sky-600 dark:text-sky-300"
    >
      {{ authorLabel }}
    </p>
    <p class="text-[12px] font-bold leading-snug line-clamp-2 mt-0.5">
      {{ text }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    text: string
    out?: boolean
    replyOut?: boolean
  }>(),
  { out: false, replyOut: false },
)

const authorLabel = computed(() => {
  if (props.replyOut) return "O'zingiz"
  return 'Javob'
})
</script>
