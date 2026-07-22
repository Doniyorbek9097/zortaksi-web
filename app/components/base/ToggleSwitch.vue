<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
    :class="modelValue ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
      :class="modelValue ? 'translate-x-5' : 'translate-x-0.5'"
    />
  </button>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
}

defineProps<Props>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>
