<template>
  <header class="sticky top-0 z-30 -mx-4 px-4 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-lg font-black tracking-tight truncate leading-none min-w-0">
        <span class="text-sky-500">Zo'r</span>
        <span class="text-slate-900 dark:text-white"> Taksi</span>
      </h1>
      <button
        v-if="actionButton !== 'none'"
        type="button"
        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-black active:scale-95 transition-transform shrink-0"
        :class="effectiveAction === 'download'
          ? 'text-sky-600 dark:text-sky-400 bg-sky-500/10'
          : 'text-amber-600 dark:text-amber-400 bg-amber-500/10'"
        @click="onAction"
      >
        <font-awesome-icon
          :icon="effectiveAction === 'download' ? 'fa-solid fa-download' : 'fa-solid fa-gift'"
          class="text-xs"
        />
        {{ effectiveAction === 'download' ? 'Yuklab olish' : 'Bonus' }}
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    actionButton?: 'download' | 'bonus' | 'none'
  }>(),
  { actionButton: 'bonus' }
)

const emit = defineEmits<{ bonus: []; download: [] }>()
const { showDownloadButton } = useApkDownload()

/** Brauzerda — yuklab olish; Flutter/PWA da — bonus */
const effectiveAction = computed<'download' | 'bonus'>(() => {
  if (props.actionButton === 'download') {
    return showDownloadButton.value ? 'download' : 'bonus'
  }
  if (props.actionButton === 'bonus') return 'bonus'
  return 'bonus'
})

function onAction() {
  if (effectiveAction.value === 'download') emit('download')
  else emit('bonus')
}
</script>
