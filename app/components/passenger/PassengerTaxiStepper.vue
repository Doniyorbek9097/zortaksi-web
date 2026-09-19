<template>
  <div class="w-full">
    <div
      class="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-800/50 border border-white/10"
      role="tablist"
    >
      <button
        v-for="(item, i) in steps"
        :key="item.key"
        type="button"
        class="flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all"
        :class="cellClass(i)"
        :disabled="!canGoBack(i)"
        :title="canGoBack(i) ? `${item.label} — orqaga` : item.label"
        @click="onClick(i)"
      >
        <span
          class="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          :class="iconClass(i)"
        >
          <font-awesome-icon
            v-if="isDone(i)"
            icon="fa-solid fa-check"
            class="text-[10px]"
          />
          <font-awesome-icon
            v-else
            :icon="item.icon"
            class="text-[11px]"
          />
        </span>
        <span class="truncate">{{ item.label }}</span>
      </button>
    </div>
    <div class="mt-1.5 h-0.5 rounded-full bg-white/10 overflow-hidden">
      <div
        class="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-400 transition-all duration-400"
        :style="{ width: progressWidth }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const steps = [
  { key: 'route', label: 'Yo\'l', icon: 'fa-solid fa-map-location-dot' },
  { key: 'phone', label: 'Tel', icon: 'fa-solid fa-phone' },
  { key: 'active', label: 'Kutish', icon: 'fa-solid fa-taxi' },
]

const props = defineProps<{
  current: number
  canGoBack: (index: number) => boolean
}>()

const emit = defineEmits<{ go: [index: number] }>()

const progressWidth = computed(() => {
  const max = Math.max(steps.length - 1, 1)
  const pct = (Math.min(Math.max(props.current, 0), max) / max) * 100
  return `${Math.max(8, pct)}%`
})

const isDone = (i: number) => i < props.current
const isCurrent = (i: number) => i === props.current

function onClick(i: number) {
  if (props.canGoBack(i)) emit('go', i)
}

const cellClass = (i: number) => {
  if (isCurrent(i)) return 'bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40'
  if (isDone(i)) return 'text-emerald-300/90'
  if (props.canGoBack(i)) return 'text-slate-300 hover:bg-white/5 cursor-pointer active:scale-95'
  return 'text-slate-500 cursor-default'
}

const iconClass = (i: number) => {
  if (isCurrent(i)) return 'bg-sky-500 text-white'
  if (isDone(i)) return 'bg-emerald-500/25 text-emerald-300'
  return 'bg-white/10 text-slate-400'
}
</script>
