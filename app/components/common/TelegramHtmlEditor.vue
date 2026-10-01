<template>
  <div class="space-y-1.5">
    <label v-if="label" class="px-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
      {{ label }}
    </label>

    <div
      ref="editorRef"
      class="tg-html-editor w-full px-3.5 py-3 rounded-xl text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40 leading-relaxed min-h-[var(--editor-min-h)] overflow-y-auto"
      :style="{ '--editor-min-h': `${Math.max(3, rows) * 1.6}rem` }"
      :data-placeholder="placeholder || ''"
      contenteditable="true"
      spellcheck="false"
      @focus="isFocused = true"
      @input="onEditorInput"
      @keydown="onEditorKeydown"
      @paste="onPaste"
      @blur="onEditorBlur"
    />

    <p v-if="hint" class="px-1 text-[10px] font-semibold text-slate-400 leading-snug">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import {
  editorHtmlToTelegramHtml,
  sanitizeTelegramLinkUrl,
  telegramHtmlToEditorHtml,
  type TelegramHtmlTag,
} from '~/utils/telegramHtmlEditor'

const props = withDefaults(
  defineProps<{
    label?: string
    placeholder?: string
    rows?: number
    maxlength?: number
    hint?: string
  }>(),
  {
    rows: 4,
    hint:
      'Matnni belgilang, keyin: b — qalin, i — kursiv, a — havola, c — kod, q — iqtibos. Enter — yangi qator.',
  },
)

const modelValue = defineModel<string>({ default: '' })

const editorRef = ref<HTMLDivElement | null>(null)
const isFocused = ref(false)

const FORMAT_KEY_TO_TAG: Record<string, TelegramHtmlTag> = {
  b: 'b',
  i: 'i',
  a: 'a',
  c: 'code',
  q: 'blockquote',
}

const renderEditorFromModel = (value: string) => {
  const el = editorRef.value
  if (!el) return
  el.innerHTML = telegramHtmlToEditorHtml(value)
}

const syncFromEditor = () => {
  const el = editorRef.value
  if (!el) return

  let next = editorHtmlToTelegramHtml(el.innerHTML)
  if (props.maxlength && next.length > props.maxlength) {
    next = next.slice(0, props.maxlength)
    renderEditorFromModel(next)
  }

  if (next !== modelValue.value) {
    modelValue.value = next
  }
}

const onEditorBlur = () => {
  isFocused.value = false
  syncFromEditor()
}

const onEditorInput = () => {
  syncFromEditor()
}

const selectionIsNonEmpty = (): boolean => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return false
  const range = sel.getRangeAt(0)
  if (!editorRef.value?.contains(range.commonAncestorContainer)) return false
  return !range.collapsed
}

const onEditorKeydown = (e: KeyboardEvent) => {
  if (!e.ctrlKey && !e.metaKey && !e.altKey && selectionIsNonEmpty()) {
    const tag = FORMAT_KEY_TO_TAG[e.key.toLowerCase()]
    if (tag) {
      e.preventDefault()
      applyFormat(tag)
      return
    }
  }

  if (e.key !== 'Enter' || e.shiftKey) return
  e.preventDefault()
  editorRef.value?.focus()
  document.execCommand('insertLineBreak')
  syncFromEditor()
}

const onPaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const pasted = e.clipboardData?.getData('text/plain') || ''
  if (!pasted) return
  document.execCommand('insertText', false, pasted.replace(/\r\n/g, '\n'))
  syncFromEditor()
}

const focusEditor = () => {
  editorRef.value?.focus()
}

const wrapSelectionWithTag = (tag: string, attrs?: Record<string, string>) => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return

  const range = sel.getRangeAt(0)
  if (!editorRef.value?.contains(range.commonAncestorContainer)) return

  const el = document.createElement(tag)
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value)
    }
  }

  if (range.collapsed) {
    el.appendChild(document.createTextNode('matn'))
    range.insertNode(el)
    range.selectNodeContents(el)
    sel.removeAllRanges()
    sel.addRange(range)
    return
  }

  try {
    range.surroundContents(el)
  } catch {
    const fragment = range.extractContents()
    el.appendChild(fragment)
    range.insertNode(el)
  }

  range.setStartAfter(el)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
}

const applyFormat = (tag: TelegramHtmlTag) => {
  focusEditor()

  if (tag === 'a') {
    const url = window.prompt('Havola manzili', 'https://')
    if (!url) return
    const href = sanitizeTelegramLinkUrl(url)
    if (!href) return
    wrapSelectionWithTag('a', { href, target: '_blank', rel: 'noopener noreferrer' })
    syncFromEditor()
    return
  }

  if (tag === 'code') {
    wrapSelectionWithTag('code')
    syncFromEditor()
    return
  }

  if (tag === 'blockquote') {
    wrapSelectionWithTag('blockquote')
    syncFromEditor()
    return
  }

  const cmd = tag === 'b' ? 'bold' : 'italic'
  document.execCommand(cmd, false)
  syncFromEditor()
}

watch(
  () => modelValue.value,
  (value) => {
    if (isFocused.value) return
    const el = editorRef.value
    if (!el) return
    const current = editorHtmlToTelegramHtml(el.innerHTML)
    if (current === String(value || '')) return
    renderEditorFromModel(String(value || ''))
  },
)

onMounted(() => {
  renderEditorFromModel(modelValue.value)
})

onBeforeUnmount(() => {
  syncFromEditor()
})
</script>

<style scoped>
.tg-html-editor:empty::before {
  content: attr(data-placeholder);
  color: rgb(148 163 184);
  pointer-events: none;
}

.tg-html-editor :deep(b),
.tg-html-editor :deep(strong) {
  font-weight: 800;
}

.tg-html-editor :deep(i),
.tg-html-editor :deep(em) {
  font-style: italic;
}

.tg-html-editor :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.92em;
  padding: 0.05em 0.3em;
  border-radius: 0.25rem;
  background: rgb(241 245 249);
}

:global(.dark) .tg-html-editor :deep(code) {
  background: rgb(51 65 85);
  color: rgb(241 245 249);
}

.tg-html-editor :deep(a) {
  color: rgb(2 132 199);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
}

:global(.dark) .tg-html-editor :deep(a) {
  color: rgb(125 211 252);
}

.tg-html-editor :deep(blockquote) {
  margin: 0.35em 0;
  padding: 0.35em 0.65em;
  border-left: 3px solid rgb(148 163 184);
  color: rgb(71 85 105);
}

:global(.dark) .tg-html-editor :deep(blockquote) {
  border-left-color: rgb(100 116 139);
  color: rgb(203 213 225);
}
</style>
