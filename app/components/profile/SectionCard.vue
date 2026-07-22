<template>
  <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
    <div
      v-if="hasHeader"
      class="flex items-start justify-between gap-3 px-4 pt-4"
      :class="subtitle ? 'pb-3' : 'pb-2'"
    >
      <div>
        <h3 class="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          {{ title }}
        </h3>
        <p v-if="subtitle" class="mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {{ subtitle }}
        </p>
      </div>
      <div class="shrink-0 pt-0.5">
        <slot name="header-right">
          <span v-if="badge" class="text-[11px] font-bold text-slate-400 dark:text-slate-500">{{ badge }}</span>
        </slot>
      </div>
    </div>

    <div :class="bodyClass">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSlots } from 'vue'

interface Props {
  title?: string
  subtitle?: string
  badge?: string
  /** Bodyni padding'siz qiladi — ro'yxatlar uchun (elementlar o'z paddingini boshqaradi) */
  noPadding?: boolean
}

const props = defineProps<Props>()
const slots = useSlots()

const hasHeader = computed(() => !!props.title || !!slots['header-right'])

const bodyClass = computed(() => {
  if (props.noPadding) return ''
  return hasHeader.value ? 'px-4 pb-4' : 'p-4'
})
</script>
