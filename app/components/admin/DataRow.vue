<template>
  <div
    class="flex items-center justify-between gap-3 py-3"
    :class="bordered ? 'border-b border-slate-100 dark:border-slate-800 last:border-0' : ''"
  >
    <p class="text-sm font-semibold text-slate-600 dark:text-slate-300">{{ label }}</p>
    <p class="text-sm font-black text-slate-900 dark:text-white text-right shrink-0">
      <span>{{ formattedAmount }}</span>
      <span v-if="count != null" class="ml-1 font-semibold text-slate-400 dark:text-slate-500">
        ({{ count }})
      </span>
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  amount: number
  count?: number
  bordered?: boolean
  suffix?: string
}

const props = withDefaults(defineProps<Props>(), {
  bordered: true,
  suffix: "so'm",
})

const formattedAmount = computed(
  () => `${props.amount.toLocaleString('ru-RU')} ${props.suffix}`
)
</script>
