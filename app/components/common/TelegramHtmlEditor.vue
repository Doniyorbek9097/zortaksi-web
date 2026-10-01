<template>
  <div ref="rootRef" class="space-y-1.5">
    <label v-if="label" class="px-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
      {{ label }}
    </label>

    <Transition name="tg-fmt-bar">
      <div
        v-if="formatMenu.visible"
        ref="formatMenuRef"
        class="flex items-center gap-0.5 overflow-x-auto overscroll-x-contain px-1 py-1 mb-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/95"
        @mousedown.prevent
        @touchstart.stop
      >
        <button
          v-for="item in formatMenuItems"
          :key="item.id"
          type="button"
          class="shrink-0 min-w-[2.125rem] h-[2.125rem] px-1.5 rounded-lg text-[11px] font-black text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 active:scale-95 transition-transform"
          :title="item.label"
          :aria-label="item.label"
          @click="onFormatMenuAction(item.id)"
        >
          {{ item.icon }}
        </button>
      </div>
    </Transition>

    <div
      ref="editorRef"
      class="tg-html-editor w-full px-3.5 py-3 rounded-xl text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40 leading-relaxed min-h-[var(--editor-min-h)] overflow-y-auto"
      :class="{ 'tg-html-editor--in-app': suppressNativeSelectionChrome }"
      :style="{ '--editor-min-h': `${Math.max(3, rows) * 1.6}rem` }"
      :data-placeholder="placeholder || ''"
      contenteditable="true"
      spellcheck="false"
      autocapitalize="off"
      autocomplete="off"
      autocorrect="off"
      @focus="onEditorFocus"
      @input="onEditorInput"
      @keydown="onEditorKeydown"
      @beforeinput="onBeforeInput"
      @paste="onPaste"
      @blur="onEditorBlur"
      @contextmenu="onEditorContextMenu"
      @copy="onEditorCopy"
      @cut="onEditorCut"
      @mouseup="scheduleSelectionMenuUpdate"
      @keyup="scheduleSelectionMenuUpdate"
      @touchend.passive="scheduleSelectionMenuUpdate"
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
import { getTelegramWebApp } from '~/utils/telegramWebApp'

type FormatMenuActionId =
  | 'copy'
  | 'tg-spoiler'
  | 'blockquote'
  | 'b'
  | 'i'
  | 'a'
  | 'code'
  | 's'
  | 'u'

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
    hint: 'Matnni belgilang — formatlash menyusi ochiladi. Klaviatura: b, i, a, c, q.',
  },
)

const modelValue = defineModel<string>({ default: '' })

const rootRef = ref<HTMLDivElement | null>(null)
const editorRef = ref<HTMLDivElement | null>(null)
const formatMenuRef = ref<HTMLDivElement | null>(null)
const isFocused = ref(false)

const formatMenu = reactive({
  visible: false,
})

const suppressNativeSelectionChrome = ref(false)

const formatMenuItems: Array<{ id: FormatMenuActionId; label: string; icon: string }> = [
  { id: 'copy', label: 'Nusxa olish', icon: '⎘' },
  { id: 'tg-spoiler', label: 'Yashirin', icon: '▦' },
  { id: 'blockquote', label: 'Iqtibos', icon: '❝' },
  { id: 'b', label: 'Qalin', icon: 'B' },
  { id: 'i', label: 'Qiya', icon: 'I' },
  { id: 'a', label: 'Havola', icon: 'A' },
  { id: 'code', label: "Mono bo'shliq", icon: 'M' },
  { id: 's', label: "O'rtasi chizilgan", icon: 'S' },
  { id: 'u', label: "Tagiga chizilgan", icon: 'U' },
]

const FORMAT_KEY_TO_TAG: Record<string, TelegramHtmlTag> = {
  b: 'b',
  i: 'i',
  a: 'a',
  c: 'code',
  q: 'blockquote',
}

const FORMAT_KEYS = new Set(Object.keys(FORMAT_KEY_TO_TAG))

let selectionMenuRaf = 0
let hideMenuTimer: ReturnType<typeof setTimeout> | null = null

const getSelectedTextInEditor = (): string => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return ''
  const range = sel.getRangeAt(0)
  if (!editorRef.value?.contains(range.commonAncestorContainer)) return ''
  if (range.collapsed) return ''
  return range.toString()
}

const hideFormatMenu = () => {
  formatMenu.visible = false
}

const positionFormatMenu = () => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) {
    hideFormatMenu()
    return
  }
  const range = sel.getRangeAt(0)
  if (!editorRef.value?.contains(range.commonAncestorContainer) || range.collapsed) {
    hideFormatMenu()
    return
  }
  formatMenu.visible = !!getSelectedTextInEditor().trim()
}

const scheduleSelectionMenuUpdate = () => {
  cancelAnimationFrame(selectionMenuRaf)
  selectionMenuRaf = requestAnimationFrame(() => {
    if (!isFocused.value) return
    positionFormatMenu()
  })
}

const onDocumentSelectionChange = () => {
  if (!isFocused.value) return
  scheduleSelectionMenuUpdate()
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

const onEditorContextMenu = (e: Event) => {
  if (!suppressNativeSelectionChrome.value) return
  e.preventDefault()
}

const onEditorCopy = (e: ClipboardEvent) => {
  if (!suppressNativeSelectionChrome.value) return
  e.preventDefault()
}

const onEditorCut = (e: ClipboardEvent) => {
  if (!suppressNativeSelectionChrome.value) return
  e.preventDefault()
}

const onEditorFocus = () => {
  isFocused.value = true
  if (hideMenuTimer) {
    clearTimeout(hideMenuTimer)
    hideMenuTimer = null
  }
}

const onEditorBlur = () => {
  isFocused.value = false
  syncFromEditor()
  hideMenuTimer = setTimeout(hideFormatMenu, 150)
}

const onEditorInput = () => {
  syncFromEditor()
  scheduleSelectionMenuUpdate()
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

  const wrapTags: TelegramHtmlTag[] = ['code', 'blockquote', 'b', 'i', 'u', 's', 'tg-spoiler']
  if (wrapTags.includes(tag)) {
    wrapSelectionWithTag(tag)
    syncFromEditor()
  }
}

const copySelection = async () => {
  const text = getSelectedTextInEditor()
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    document.execCommand('copy')
  }
}

const onFormatMenuAction = async (id: FormatMenuActionId) => {
  if (id === 'copy') {
    await copySelection()
    hideFormatMenu()
    return
  }
  applyFormat(id)
  hideFormatMenu()
}

const tryApplyFormatShortcut = (e: { key?: string; data?: string | null; isComposing?: boolean }) => {
  if (e.isComposing) return false
  const raw = e.key ?? e.data ?? ''
  if (raw.length !== 1) return false
  const key = raw.toLowerCase()
  if (!FORMAT_KEYS.has(key)) return false
  if (!getSelectedTextInEditor().trim()) return false
  applyFormat(FORMAT_KEY_TO_TAG[key]!)
  return true
}

const onBeforeInput = (e: InputEvent) => {
  if (e.getModifierState('Control') || e.getModifierState('Meta') || e.getModifierState('Alt')) return
  if (e.inputType !== 'insertText' && e.inputType !== 'insertReplacementText') return
  if (!tryApplyFormatShortcut(e)) return
  e.preventDefault()
}

const onEditorKeydown = (e: KeyboardEvent) => {
  if (e.isComposing) return

  const key = e.key.length === 1 ? e.key.toLowerCase() : ''
  if ((e.ctrlKey || e.metaKey) && (key === 'b' || key === 'i' || key === 'u')) {
    e.preventDefault()
    return
  }

  if (!e.ctrlKey && !e.metaKey && !e.altKey && FORMAT_KEYS.has(key) && getSelectedTextInEditor().trim()) {
    e.preventDefault()
    e.stopPropagation()
    tryApplyFormatShortcut(e)
    hideFormatMenu()
    return
  }

  if (e.key !== 'Enter' || e.shiftKey) return
  e.preventDefault()
  editorRef.value?.focus()
  document.execCommand('insertLineBreak')
  syncFromEditor()
}

const onDocumentPointerDown = (e: MouseEvent) => {
  const target = e.target as Node
  if (formatMenuRef.value?.contains(target)) return
  if (editorRef.value?.contains(target)) return
  hideFormatMenu()
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

const detectInAppShell = () => {
  if (!import.meta.client) return false
  const tg = getTelegramWebApp()
  if (tg?.initData) return true
  if (document.documentElement.dataset.ztEmbed === 'webview') return true
  const p = String(tg?.platform || '')
  return !!p && p !== 'unknown'
}

onMounted(() => {
  suppressNativeSelectionChrome.value = detectInAppShell()
  renderEditorFromModel(modelValue.value)
  document.addEventListener('selectionchange', onDocumentSelectionChange)
  document.addEventListener('mousedown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', onDocumentSelectionChange)
  document.removeEventListener('mousedown', onDocumentPointerDown)
  if (hideMenuTimer) clearTimeout(hideMenuTimer)
  cancelAnimationFrame(selectionMenuRaf)
  syncFromEditor()
  hideFormatMenu()
})
</script>

<style scoped>
.tg-fmt-bar-enter-active,
.tg-fmt-bar-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.tg-fmt-bar-enter-from,
.tg-fmt-bar-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.tg-html-editor--in-app {
  -webkit-touch-callout: none;
  -webkit-user-select: text;
  user-select: text;
  touch-action: manipulation;
}

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

.tg-html-editor :deep(u),
.tg-html-editor :deep(ins) {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.tg-html-editor :deep(s),
.tg-html-editor :deep(strike),
.tg-html-editor :deep(del) {
  text-decoration: line-through;
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

.tg-html-editor :deep(tg-spoiler) {
  border-radius: 0.2rem;
  padding: 0 0.15em;
  background: rgb(148 163 184 / 0.45);
  color: transparent;
  text-shadow: 0 0 8px rgb(15 23 42 / 0.85);
}

.tg-html-editor :deep(tg-spoiler:hover),
.tg-html-editor :deep(tg-spoiler:focus) {
  color: inherit;
  text-shadow: none;
  background: rgb(148 163 184 / 0.25);
}

:global(.dark) .tg-html-editor :deep(tg-spoiler) {
  background: rgb(71 85 105 / 0.7);
  text-shadow: 0 0 8px rgb(0 0 0 / 0.9);
}
</style>
