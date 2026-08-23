<template>
  <div
    class="chat-html whitespace-pre-line break-words text-[15px] leading-relaxed"
    :class="out ? 'chat-html--out' : 'chat-html--in'"
    v-html="safeHtml"
  />
</template>

<script setup lang="ts">
import { sanitizeTelegramHtml } from '~/utils/telegramHtml'

const props = withDefaults(
  defineProps<{
    html?: string
    out?: boolean
  }>(),
  { html: '', out: false },
)

const safeHtml = computed(() => sanitizeTelegramHtml(props.html || ''))
</script>

<style scoped>
.chat-html :deep(a) {
  color: rgb(2 132 199);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.chat-html :deep(b),
.chat-html :deep(strong) {
  font-weight: 800;
}

.chat-html :deep(code) {
  font-family: ui-monospace, monospace;
  font-size: 0.92em;
  padding: 0.05em 0.25em;
  border-radius: 0.25rem;
  background: rgb(241 245 249);
}
</style>
