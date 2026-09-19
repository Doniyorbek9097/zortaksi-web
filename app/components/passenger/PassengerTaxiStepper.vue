<template>
  <div class="w-full">
    <div
      class="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm"
      role="tablist"
    >
      <button
        v-for="(item, i) in steps"
        :key="item.key"
        type="button"
        class="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-bold uppercase tracking-wide transition-all"
        :class="cellClass(i)"
        :disabled="!canGoBack(i)"
        :title="canGoBack(i) ? `${item.label} — orqaga` : item.label"
        @click="onClick(i)"
      >
        <span
          class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          :class="iconClass(i)"
        >
          <font-awesome-icon
            v-if="isDone(i)"
            icon="fa-solid fa-check"
            class="text-sm"
          />
          <font-awesome-icon
            v-else
            :icon="item.icon"
            class="text-sm"
          />
        </span>
        <span class="truncate w-full text-center leading-none">{{ item.label }}</span>
      </button>
    </div>
    <div class="mt-2 h-1 rounded-full bg-slate-200 overflow-hidden">
      <div
        class="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-400"
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
  if (isCurrent(i)) return 'bg-amber-50 text-amber-900 ring-1 ring-amber-300'
  if (isDone(i)) return 'text-emerald-700'
  if (props.canGoBack(i)) return 'text-slate-600 hover:bg-slate-50 cursor-pointer active:scale-95'
  return 'text-slate-400 cursor-default'
}

const iconClass = (i: number) => {
  if (isCurrent(i)) return 'bg-amber-400 text-white shadow-sm'
  if (isDone(i)) return 'bg-emerald-100 text-emerald-600'
  return 'bg-slate-100 text-slate-500'
}
</script>
