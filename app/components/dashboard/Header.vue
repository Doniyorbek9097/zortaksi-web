<template>
  <header class="sticky top-0 z-30 -mx-4 px-4 py-2.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-xl sm:text-2xl font-black tracking-tight truncate leading-none min-w-0">
        <span class="text-sky-500">Zo'r</span>
        <span class="text-slate-900 dark:text-white"> Taksi</span>
      </h1>

      <button
        v-if="actionButton !== 'none'"
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-sm shrink-0 border"
        :class="actionClass"
        @click="onAction"
      >
        <font-awesome-icon :icon="actionIcon" />
        {{ actionLabel }}
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    actionButton?: 'download' | 'bonus' | 'help' | 'none'
  }>(),
  { actionButton: 'bonus' },
)

const emit = defineEmits<{ bonus: []; download: []; help: [] }>()
const { showDownloadButton } = useApkDownload()

type HeaderAction = 'download' | 'bonus' | 'help'

const effectiveAction = computed<HeaderAction>(() => {
  if (props.actionButton === 'download') {
    return showDownloadButton.value ? 'download' : 'help'
  }
  if (props.actionButton === 'help') return 'help'
  if (props.actionButton === 'bonus') return 'bonus'
  return 'bonus'
})

const actionClass = computed(() => {
  if (effectiveAction.value === 'download') {
    return 'bg-sky-500/10 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400'
  }
  if (effectiveAction.value === 'help') {
    return 'bg-gradient-to-r from-violet-600/12 via-indigo-600/10 to-violet-600/12 dark:from-[#1a1030] dark:via-[#151028] dark:to-[#1a1030] border-violet-300/70 dark:border-violet-500/30 text-violet-700 dark:text-violet-200 shadow-md shadow-violet-500/10'
  }
  return 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-amber-500'
})

const actionIcon = computed(() => {
  if (effectiveAction.value === 'download') return 'fa-solid fa-download'
  if (effectiveAction.value === 'help') return 'fa-solid fa-headset'
  return 'fa-solid fa-gift'
})

const actionLabel = computed(() => {
  if (effectiveAction.value === 'download') return 'Yuklab olish'
  if (effectiveAction.value === 'help') return 'Yordam'
  return 'Bonus'
})

function onAction() {
  if (effectiveAction.value === 'download') emit('download')
  else if (effectiveAction.value === 'help') emit('help')
  else emit('bonus')
}
</script>
