<template>
  <component
    :is="clickable ? 'button' : 'div'"
    :type="clickable ? 'button' : undefined"
    class="w-full flex items-center gap-3 px-4 py-3.5 text-left"
    :class="clickable ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors' : ''"
    @click="clickable && $emit('click')"
  >
    <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" :class="iconClass">
      <font-awesome-icon :icon="icon" />
    </div>

    <div class="flex-1 min-w-0">
      <p class="text-sm font-black text-slate-900 dark:text-white truncate">{{ title }}</p>
      <p v-if="subtitle" class="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">{{ subtitle }}</p>
    </div>

    <div class="shrink-0">
      <slot name="action">
        <font-awesome-icon icon="fa-solid fa-chevron-right" class="text-slate-300 dark:text-slate-600 text-sm" />
      </slot>
    </div>
  </component>
</template>

<script setup lang="ts">
type Color = 'amber' | 'emerald' | 'sky' | 'violet' | 'slate' | 'red'

interface Props {
  icon: string
  title: string
  subtitle?: string
  color?: Color
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'slate',
  clickable: false,
})

defineEmits<{ click: [] }>()

const colorMap: Record<Color, string> = {
  amber: 'bg-amber-500/10 text-amber-500',
  emerald: 'bg-emerald-500/10 text-emerald-500',
  sky: 'bg-sky-500/10 text-sky-500',
  violet: 'bg-violet-500/10 text-violet-500',
  slate: 'bg-slate-500/10 text-slate-500 dark:text-slate-400',
  red: 'bg-red-500/10 text-red-500',
}

const iconClass = computed(() => colorMap[props.color])
</script>
