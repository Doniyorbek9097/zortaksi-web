<template>
  <div class="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      class="py-2.5 rounded-lg text-sm font-black transition-all"
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
export type ScriptType = 'latin' | 'cyrillic'

interface Props {
  modelValue: ScriptType
}

defineProps<Props>()
defineEmits<{ 'update:modelValue': [value: ScriptType] }>()

const options: { value: ScriptType; label: string }[] = [
  { value: 'latin', label: 'Lotin' },
  { value: 'cyrillic', label: 'Kirill' },
]
</script>
