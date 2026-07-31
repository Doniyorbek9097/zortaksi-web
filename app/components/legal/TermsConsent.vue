<template>
  <div class="space-y-1.5">
    <label class="flex items-start gap-2.5 cursor-pointer select-none">
      <input
        :checked="modelValue"
        type="checkbox"
        class="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 dark:border-slate-600 text-[#2AABEE] focus:ring-[#2AABEE]/30"
        @change="onChange"
      />
      <span class="text-[11px] leading-snug text-slate-500 dark:text-slate-400">
        <NuxtLink
          to="/terms"
          class="text-sky-500 dark:text-sky-400 font-bold hover:underline"
          @click.stop
        >
          Foydalanish shartlariga
        </NuxtLink>
        roziman
      </span>
    </label>
    <p v-if="hint" class="text-[10px] font-medium text-slate-400 dark:text-slate-500 leading-snug pl-[26px]">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  hint?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const onChange = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).checked)
}
</script>
