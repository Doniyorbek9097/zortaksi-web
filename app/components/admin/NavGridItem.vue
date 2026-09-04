<template>
  <button
    type="button"
    class="flex items-center gap-2 px-2.5 py-2 rounded-xl border min-w-0 w-full active:scale-[0.98] transition-transform"
    :class="styles.surface"
    @click="$emit('click')"
  >
    <div
      class="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] shrink-0 shadow-sm"
      :class="styles.icon"
    >
      <font-awesome-icon :icon="icon" />
    </div>
    <p
      class="flex-1 min-w-0 text-[11px] font-bold leading-tight text-left line-clamp-2"
      :class="styles.label"
    >
      {{ title }}
    </p>
    <font-awesome-icon
      icon="fa-solid fa-chevron-right"
      class="text-[8px] shrink-0 opacity-35"
      :class="styles.chevron"
    />
  </button>
</template>

<script setup lang="ts">
type Tone = 'green' | 'violet' | 'blue' | 'amber' | 'rose'

interface Props {
  title: string
  icon: string
  tone?: Tone | string
}

const props = withDefaults(defineProps<Props>(), { tone: 'blue' })
defineEmits<{ click: [] }>()

const toneMap: Record<Tone, { surface: string; icon: string; label: string; chevron: string }> = {
  green: {
    surface: 'bg-emerald-50/90 dark:bg-emerald-950/35 border-emerald-100 dark:border-emerald-900/45',
    icon: 'bg-emerald-500 text-white',
    label: 'text-emerald-800 dark:text-emerald-200',
    chevron: 'text-emerald-600 dark:text-emerald-400',
  },
  violet: {
    surface: 'bg-violet-50/90 dark:bg-violet-950/35 border-violet-100 dark:border-violet-900/45',
    icon: 'bg-violet-500 text-white',
    label: 'text-violet-800 dark:text-violet-200',
    chevron: 'text-violet-600 dark:text-violet-400',
  },
  blue: {
    surface: 'bg-sky-50/90 dark:bg-sky-950/35 border-sky-100 dark:border-sky-900/45',
    icon: 'bg-sky-500 text-white',
    label: 'text-sky-800 dark:text-sky-200',
    chevron: 'text-sky-600 dark:text-sky-400',
  },
  amber: {
    surface: 'bg-amber-50/90 dark:bg-amber-950/35 border-amber-100 dark:border-amber-900/45',
    icon: 'bg-amber-500 text-white',
    label: 'text-amber-800 dark:text-amber-200',
    chevron: 'text-amber-600 dark:text-amber-400',
  },
  rose: {
    surface: 'bg-rose-50/90 dark:bg-rose-950/35 border-rose-100 dark:border-rose-900/45',
    icon: 'bg-rose-500 text-white',
    label: 'text-rose-800 dark:text-rose-200',
    chevron: 'text-rose-600 dark:text-rose-400',
  },
}

const styles = computed(() => {
  const key = String(props.tone || 'blue') as Tone
  return toneMap[key] ?? toneMap.blue
})
</script>
