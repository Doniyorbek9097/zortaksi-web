<template>
  <div
    class="mb-1.5 rounded-lg px-2.5 py-1.5 border-l-[3px] text-left"
    :class="
      out
        ? 'bg-white/15 border-white/70 text-white/90'
        : 'bg-slate-100 dark:bg-slate-700/50 border-sky-500 text-slate-600 dark:text-slate-300'
    "
  >
    <p
      class="text-[10px] font-black uppercase tracking-wide"
      :class="out ? 'text-white/75' : 'text-sky-600 dark:text-sky-400'"
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
