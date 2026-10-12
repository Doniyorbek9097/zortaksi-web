<template>
  <div
    class="flex flex-col items-center justify-center text-center min-h-[55vh] px-4"
    :class="toneClass"
  >
    <font-awesome-icon
      :icon="icon"
      class="text-3xl mb-3 opacity-50"
    />
    <p class="text-sm font-bold max-w-xs">{{ title }}</p>
    <p v-if="subtitle" class="text-[12px] font-medium mt-1.5 max-w-sm opacity-80 leading-relaxed">
      {{ subtitle }}
    </p>
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
  title: string
  subtitle?: string
  tone?: 'muted' | 'slate' | 'amber'
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'fa-solid fa-inbox',
  tone: 'muted',
})

const toneClass = computed(() => {
  if (props.tone === 'slate') return 'text-slate-500'
  if (props.tone === 'amber') return 'text-amber-700/90 dark:text-amber-400/90'
  return 'text-slate-400 dark:text-slate-500'
})
</script>
