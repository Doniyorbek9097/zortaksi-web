<template>
  <div :class="lineClampClass">
    <ChatHtmlText
      v-if="isHtml"
      :html="text"
      class="font-medium text-slate-600 dark:text-slate-300 text-[13px] leading-snug"
    />
    <p
      v-else
      class="font-medium text-slate-600 dark:text-slate-300 leading-snug whitespace-pre-wrap"
    >
      {{ text }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { inferTextFormat } from '~/utils/telegramHtml'

const props = withDefaults(
  defineProps<{
    text?: string
    lineClamp?: 1 | 2 | 3 | null
  }>(),
  { text: '', lineClamp: 2 },
)

const isHtml = computed(() => inferTextFormat(props.text || '') === 'html')

const lineClampClass = computed(() => {
  if (!props.lineClamp) return ''
  if (props.lineClamp === 1) return 'line-clamp-1'
  if (props.lineClamp === 3) return 'line-clamp-3'
  return 'line-clamp-2'
})
</script>
