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

.chat-html :deep(u),
.chat-html :deep(ins) {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.chat-html :deep(s),
.chat-html :deep(strike),
.chat-html :deep(del) {
  text-decoration: line-through;
}

.chat-html :deep(tg-spoiler) {
  border-radius: 0.2rem;
  padding: 0 0.15em;
  background: rgb(148 163 184 / 0.45);
}

.chat-html :deep(blockquote) {
  margin: 0.35em 0;
  padding: 0.2em 0.55em;
  border-left: 3px solid rgb(148 163 184);
  color: inherit;
  opacity: 0.95;
}

.chat-html :deep(i),
.chat-html :deep(em) {
  font-style: italic;
}

.chat-html :deep(code) {
  font-family: ui-monospace, monospace;
  font-size: 0.92em;
  padding: 0.05em 0.25em;
  border-radius: 0.25rem;
  background: rgb(241 245 249);
}

:global(.dark) .chat-html :deep(code) {
  background: rgb(51 65 85);
  color: rgb(241 245 249);
}

:global(.dark) .chat-html--in :deep(a) {
  color: rgb(125 211 252);
}
</style>
