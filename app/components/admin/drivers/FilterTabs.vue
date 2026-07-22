<template>
  <div class="flex gap-2 overflow-x-auto pb-0.5 -mx-0.5 px-0.5">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-black shrink-0 border transition-all active:scale-95"
      :class="model === tab.value ? activeClass(tab.tone) : idleClass"
      @click="model = tab.value"
    >
      <font-awesome-icon :icon="tab.icon" class="text-[11px]" />
      <span>{{ tab.label }}</span>
      <span v-if="tab.count != null" class="opacity-80">{{ tab.count }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
type Tone = 'sky' | 'amber' | 'emerald'

export interface DriverFilterTab {
  value: string
  label: string
  icon: string
  count?: number
  tone?: Tone
}

defineProps<{ tabs: DriverFilterTab[] }>()
const model = defineModel<string>({ required: true })

const idleClass =
  'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'

const activeClass = (tone: Tone = 'sky') => {
  const map: Record<Tone, string> = {
    sky: 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 text-sky-600 dark:text-sky-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 border-amber-400 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 text-emerald-600 dark:text-emerald-400',
  }
  return map[tone]
}
</script>
