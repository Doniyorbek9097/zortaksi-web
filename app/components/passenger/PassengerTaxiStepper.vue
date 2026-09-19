<template>
  <div class="w-full space-y-2.5">
    <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 px-0.5">
      <span>Qadam {{ current + 1 }} / {{ steps.length }}</span>
      <span class="text-amber-600 dark:text-amber-400">{{ steps[current]?.label }}</span>
    </div>

    <div
      class="relative h-1.5 rounded-full bg-slate-200/90 dark:bg-slate-800 overflow-hidden"
      role="progressbar"
      :aria-valuenow="current + 1"
      :aria-valuemin="1"
      :aria-valuemax="steps.length"
    >
      <div
        class="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-500 transition-all duration-500 ease-out"
        :style="{ width: progressWidth }"
      />
    </div>

    <div class="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800">
      <button
        v-for="(item, i) in steps"
        :key="item.key"
        type="button"
        class="relative flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl transition-all duration-300"
        :class="cellClass(i)"
        :disabled="!canGoBack(i)"
        :title="canGoBack(i) ? `${item.label} — orqaga` : item.label"
        @click="emit('go', i)"
      >
        <span
          class="w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all duration-300"
          :class="iconShellClass(i)"
        >
          <font-awesome-icon
            v-if="isDone(i)"
            icon="fa-solid fa-check"
            class="text-[13px]"
          />
          <font-awesome-icon
            v-else
            :icon="item.icon"
            class="text-[14px]"
          />
        </span>
        <span class="text-[9px] font-black uppercase tracking-wide leading-none text-center">
          {{ item.label }}
        </span>
        <span
          v-if="i === current"
          class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
export type PassengerTaxiStepKey = 'route' | 'phone' | 'active'

const steps: { key: PassengerTaxiStepKey; label: string; icon: string }[] = [
  { key: 'route', label: 'Marshrut', icon: 'fa-solid fa-map-location-dot' },
  { key: 'phone', label: 'Telefon', icon: 'fa-solid fa-phone' },
  { key: 'active', label: 'Kutish', icon: 'fa-solid fa-taxi' },
]

const props = defineProps<{
  current: number
  canGoBack: (index: number) => boolean
}>()

const emit = defineEmits<{
  go: [index: number]
}>()

const progressWidth = computed(() => {
  const max = Math.max(steps.length - 1, 1)
  const pct = (Math.min(Math.max(props.current, 0), max) / max) * 100
  return `${Math.max(12, pct)}%`
})

const isDone = (i: number) => i < props.current
const isCurrent = (i: number) => i === props.current

const cellClass = (i: number) => {
  if (isCurrent(i)) {
    return 'bg-white dark:bg-slate-800 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/40 scale-[1.02] z-[1]'
  }
  if (props.canGoBack(i)) {
    return 'cursor-pointer hover:bg-white/70 dark:hover:bg-slate-800/80 active:scale-95'
  }
  if (isDone(i)) {
    return 'text-emerald-700 dark:text-emerald-300'
  }
  return 'text-slate-400 opacity-55 cursor-default'
}

const iconShellClass = (i: number) => {
  if (isCurrent(i)) {
    return 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30'
  }
  if (isDone(i)) {
    return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/25'
  }
  return 'bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
}
</script>
