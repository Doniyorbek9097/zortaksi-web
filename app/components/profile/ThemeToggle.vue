<template>
  <div class="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      class="py-2 rounded-lg text-[12px] font-black transition-all leading-tight"
      :class="modelValue === opt.value
        ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-sm'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'"
      @click="$emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ThemePreference } from '~/utils/themeChrome'

interface Props {
  modelValue: ThemePreference
}

defineProps<Props>()
defineEmits<{ 'update:modelValue': [value: ThemePreference] }>()

const options: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Tizim' },
  { value: 'light', label: 'Yorug\'' },
  { value: 'dark', label: 'Qorong\'u' },
]
</script>