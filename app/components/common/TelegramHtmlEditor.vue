<template>
  <div ref="rootRef" :class="compact ? 'flex min-h-0 min-w-0 flex-1 flex-col' : 'space-y-1.5'">
    <label v-if="label" class="px-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
      {{ label }}
    </label>

    <div class="flex min-h-0 min-w-0 flex-1 flex-col">
      <div
        v-if="formatMenu.visible"
        ref="formatMenuRef"
        class="tg-format-menu shrink-0 max-h-[min(34vh,176px)] overflow-y-auto overscroll-y-contain py-0.5 border-b border-slate-200/80 dark:border-slate-600/80 bg-slate-50/95 dark:bg-slate-900/95"
        @mousedown.prevent
        @touchstart.stop
      >
        <button
          v-for="item in visibleFormatMenuItems"
          :key="item.id"
          type="button"
          class="w-full px-2.5 py-1.5 text-left text-[12px] leading-tight font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
          @click="onFormatMenuAction(item.id)"
        >
          <span
            v-if="item.icon"
            class="w-4 text-center text-[11px] text-slate-400 shrink-0"
            aria-hidden="true"
          >
            {{ item.icon }}
          </span>
          <span class="min-w-0 truncate" :class="item.fontPreview ? 'text-[13px] tracking-tight' : ''">
            {{ item.label }}
          </span>
        </button>
      </div>

      <div
        ref="editorRef"
        class="tg-html-editor w-full min-h-0 flex-1 leading-relaxed overflow-y-auto focus:outline-none [min-height:var(--editor-min-h)]"
        :class="[
          compact
            ? 'px-1 py-2.5 text-[15px] bg-transparent border-0 rounded-none'
            : 'px-3.5 py-3 rounded-xl text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500/40',
          { 'tg-html-editor--in-app': suppressNativeSelectionChrome },
          { 'opacity-60 pointer-events-none': disabled },
          editorClass,
        ]"
      :style="editorStyle"
      :data-placeholder="placeholder || ''"
      :contenteditable="!disabled && !readonly"
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
      @mousedown="onEditorMouseDown"
      @mouseup="onEditorMouseUp"
      @keyup="scheduleSelectionMenuUpdate"
      @touchstart.passive="onEditorTouchStart"
      @touchmove.passive="clearLongPressTimer"
      @touchend.passive="onEditorTouchEnd"
      @touchcancel.passive="clearLongPressTimer"
    />
    </div>

    <p v-if="hint && !hideHint" class="px-1 text-[10px] font-semibold text-slate-400 leading-snug">
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
import {
  applyUnicodeFontStyle,
  isUnicodeFontId,
  UNICODE_FONT_MENU,
  type UnicodeFontId,
} from '~/utils/unicodeTextFonts'

type FormatMenuActionId =
  | 'selectAll'
  | 'copy'
  | 'cut'
  | 'paste'
  | 'tg-spoiler'
  | 'blockquote'
  | 'b'
  | 'i'
  | 'a'
  | 'code'
  | 's'
  | 'u'
  | UnicodeFontId

type FormatMenuItem = { id: FormatMenuActionId; label: string; icon: string; fontPreview?: boolean }

const props = withDefaults(
  defineProps<{
    label?: string
    placeholder?: string
    rows?: number
    maxlength?: number
    hint?: string
    hideHint?: boolean
    compact?: boolean
    disabled?: boolean
    readonly?: boolean
    maxHeightPx?: number
    editorClass?: string
  }>(),
  {
    rows: 4,
    hint: 'Matnni belgilang — formatlash menyusi ochiladi. Klaviatura: b, i, a, c, q.',
    hideHint: false,
    compact: false,
    disabled: false,
    readonly: false,
    editorClass: '',
  },
)

const emit = defineEmits<{
  keydown: [KeyboardEvent]
  focus: []
  blur: []
}>()

const modelValue = defineModel<string>({ default: '' })

const editorStyle = computed(() => {
  const minH = `${Math.max(props.compact ? 1.5 : 3, props.rows) * (props.compact ? 1.55 : 1.6)}rem`
  const style: Record<string, string> = { '--editor-min-h': minH }
  if (props.maxHeightPx) style.maxHeight = `${props.maxHeightPx}px`
  return style
})

const rootRef = ref<HTMLDivElement | null>(null)
const editorRef = ref<HTMLDivElement | null>(null)
const formatMenuRef = ref<HTMLDivElement | null>(null)
const isFocused = ref(false)

const formatMenu = reactive({
  visible: false,
})

const formatMenuMode = ref<'selection' | 'hold'>('selection')

const FORMAT_ACTION_ITEMS: FormatMenuItem[] = [
  { id: 'tg-spoiler', label: 'Yashirin', icon: '▦' },
  { id: 'blockquote', label: 'Iqtibos', icon: '❝' },
  { id: 'b', label: 'Qalin', icon: 'B' },
  { id: 'i', label: 'Qiya', icon: 'I' },
  { id: 'a', label: 'Havola', icon: 'A' },
  { id: 'code', label: "Mono bo'shliq", icon: 'M' },
  { id: 's', label: "O'rtasi chizilgan", icon: 'S' },
  { id: 'u', label: "Tagiga chizilgan", icon: 'U' },
]

const UNICODE_FONT_MENU_ITEMS: FormatMenuItem[] = UNICODE_FONT_MENU.map((font) => ({
  id: font.id,
  label: font.label,
  icon: '',
  fontPreview: true,
}))

const visibleFormatMenuItems = computed((): FormatMenuItem[] => {
  if (formatMenuMode.value === 'hold') {
    return [
      { id: 'paste', label: "Qo'shish", icon: '+' },
      { id: 'selectAll', label: 'Hammasi tanlash', icon: '☰' },
    ]
  }
  return [
    { id: 'selectAll', label: 'Hammasi tanlash', icon: '☰' },
    { id: 'copy', label: 'Nusxa olish', icon: '⎘' },
    { id: 'cut', label: 'Kesib olish', icon: '✂' },
    ...FORMAT_ACTION_ITEMS,
    ...UNICODE_FONT_MENU_ITEMS,
  ]
})

const suppressNativeSelectionChrome = ref(false)

const FORMAT_MENU_ACTION_IDS = new Set<FormatMenuActionId>([
  'tg-spoiler',
  'blockquote',
  'b',
  'i',
  'a',
  'code',
  's',
  'u',
])

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
let longPressTimer: ReturnType<typeof setTimeout> | null = null
const LONG_PRESS_MS = 480

const ZWSP = '\u200B'

const hasTextSelectionInEditor = (): boolean => !!getSelectedTextInEditor().trim()

const clearLongPressTimer = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

const showFormatMenuAt = (_clientX: number, _clientY: number, mode: 'selection' | 'hold') => {
  formatMenuMode.value = mode
  formatMenu.visible = true
}

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
  formatMenuMode.value = 'selection'
}

const positionFormatMenu = () => {
  if (!hasTextSelectionInEditor()) {
    if (formatMenuMode.value === 'hold' && formatMenu.visible) return
    hideFormatMenu()
    return
  }

  formatMenuMode.value = 'selection'
  formatMenu.visible = true
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

  let next = editorHtmlToTelegramHtml(el.innerHTML).replaceAll(ZWSP, '')
  if (props.maxlength && next.length > props.maxlength) {
    next = next.slice(0, props.maxlength)
    renderEditorFromModel(next)
  }

  if (next !== modelValue.value) {
    modelValue.value = next
  }
}

const onEditorContextMenu = (e: Event) => {
  if (e instanceof MouseEvent && !hasTextSelectionInEditor()) {
    e.preventDefault()
    showFormatMenuAt(e.clientX, e.clientY, 'hold')
    return
  }
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
  emit('focus')
  isFocused.value = true
  if (hideMenuTimer) {
    clearTimeout(hideMenuTimer)
    hideMenuTimer = null
  }
}

const onEditorBlur = () => {
  emit('blur')
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

const placeCaretAfterFormattedElement = (el: HTMLElement) => {
  const sel = window.getSelection()
  if (!sel) return
  const parent = el.parentNode
  if (!parent) return

  let tail = el.nextSibling
  if (!tail || tail.nodeType !== Node.TEXT_NODE) {
    tail = document.createTextNode(ZWSP)
    parent.insertBefore(tail, el.nextSibling)
  } else if (!(tail.textContent || '').includes(ZWSP)) {
    tail.textContent = `${tail.textContent || ''}${ZWSP}`
  }

  const range = document.createRange()
  const len = tail.textContent?.length || 0
  range.setStart(tail, len)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
}

const wrapSelectionWithTag = (tag: string, attrs?: Record<string, string>): boolean => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return false

  const range = sel.getRangeAt(0)
  if (!editorRef.value?.contains(range.commonAncestorContainer)) return false
  if (range.collapsed) return false

  const el = document.createElement(tag)
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value)
    }
  }

  try {
    range.surroundContents(el)
  } catch {
    const fragment = range.extractContents()
    el.appendChild(fragment)
    range.insertNode(el)
  }

  placeCaretAfterFormattedElement(el)
  return true
}

const placeCaretAfterNode = (node: Node) => {
  const sel = window.getSelection()
  if (!sel) return
  const parent = node.parentNode
  if (!parent) return

  let tail = node.nextSibling
  if (!tail || tail.nodeType !== Node.TEXT_NODE) {
    tail = document.createTextNode(ZWSP)
    parent.insertBefore(tail, node.nextSibling)
  }

  const range = document.createRange()
  const len = tail.textContent?.length || 0
  range.setStart(tail, len)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
}

const replaceSelectionWithPlainText = (text: string): boolean => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return false

  const range = sel.getRangeAt(0)
  if (!editorRef.value?.contains(range.commonAncestorContainer)) return false
  if (range.collapsed) return false

  range.deleteContents()

  const lines = text.split('\n')
  const frag = document.createDocumentFragment()
  let lastNode: Node = frag
  lines.forEach((line, index) => {
    const tn = document.createTextNode(line)
    frag.appendChild(tn)
    lastNode = tn
    if (index < lines.length - 1) {
      const br = document.createElement('br')
      frag.appendChild(br)
      lastNode = br
    }
  })

  range.insertNode(frag)
  placeCaretAfterNode(lastNode)
  return true
}

const applyUnicodeFont = (fontId: UnicodeFontId) => {
  focusEditor()
  if (!hasTextSelectionInEditor()) return
  const selected = getSelectedTextInEditor()
  const converted = applyUnicodeFontStyle(selected, fontId)
  if (replaceSelectionWithPlainText(converted)) syncFromEditor()
}

const applyFormat = (tag: TelegramHtmlTag) => {
  focusEditor()
  if (!hasTextSelectionInEditor()) return

  if (tag === 'a') {
    const url = window.prompt('Havola manzili', 'https://')
    if (!url) return
    const href = sanitizeTelegramLinkUrl(url)
    if (!href) return
    if (wrapSelectionWithTag('a', { href, target: '_blank', rel: 'noopener noreferrer' })) {
      syncFromEditor()
    }
    return
  }

  const wrapTags: TelegramHtmlTag[] = ['code', 'blockquote', 'b', 'i', 'u', 's', 'tg-spoiler']
  if (wrapTags.includes(tag)) {
    if (wrapSelectionWithTag(tag)) syncFromEditor()
  }
}

const selectAllInEditor = () => {
  const el = editorRef.value
  const sel = window.getSelection()
  if (!el || !sel) return
  const range = document.createRange()
  range.selectNodeContents(el)
  sel.removeAllRanges()
  sel.addRange(range)
  formatMenuMode.value = 'selection'
  scheduleSelectionMenuUpdate()
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

const cutSelection = async () => {
  const text = getSelectedTextInEditor()
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    document.execCommand('copy')
  }
  document.execCommand('delete')
  syncFromEditor()
}

const ensureCaretInEditor = () => {
  const el = editorRef.value
  const sel = window.getSelection()
  if (!el || !sel) return

  if (sel.rangeCount === 0 || !el.contains(sel.anchorNode)) {
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
    sel.removeAllRanges()
    sel.addRange(range)
  }
}

const insertPlainTextAtCaret = (raw: string) => {
  const text = String(raw || '').replace(/\r\n/g, '\n')
  if (!text) return

  focusEditor()
  ensureCaretInEditor()

  const el = editorRef.value
  const sel = window.getSelection()
  if (!el || !sel || sel.rangeCount === 0) return

  const range = sel.getRangeAt(0)
  if (!el.contains(range.commonAncestorContainer)) return

  range.deleteContents()
  const tn = document.createTextNode(text)
  range.insertNode(tn)
  range.setStartAfter(tn)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
  syncFromEditor()
}

const pasteFromClipboard = async () => {
  focusEditor()
  ensureCaretInEditor()

  try {
    if (document.execCommand('paste')) {
      syncFromEditor()
      return
    }
  } catch {
    /* WebView / brauzer */
  }

  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      insertPlainTextAtCaret(text)
      return
    }
  } catch {
    /* ruxsat yo'q */
  }
}

const onFormatMenuAction = async (id: FormatMenuActionId) => {
  if (id === 'selectAll') {
    selectAllInEditor()
    return
  }
  if (id === 'copy') {
    await copySelection()
    hideFormatMenu()
    return
  }
  if (id === 'cut') {
    await cutSelection()
    hideFormatMenu()
    return
  }
  if (id === 'paste') {
    await pasteFromClipboard()
    hideFormatMenu()
    return
  }
  if (isUnicodeFontId(id)) {
    applyUnicodeFont(id)
    hideFormatMenu()
    return
  }
  if (!FORMAT_MENU_ACTION_IDS.has(id as FormatMenuActionId)) return
  applyFormat(id as TelegramHtmlTag)
  hideFormatMenu()
}

const startLongPressMenu = (clientX: number, clientY: number) => {
  if (hasTextSelectionInEditor()) return
  showFormatMenuAt(clientX, clientY, 'hold')
}

const onEditorTouchStart = (e: TouchEvent) => {
  if (hasTextSelectionInEditor()) return
  const touch = e.touches[0]
  if (!touch) return
  clearLongPressTimer()
  const { clientX, clientY } = touch
  longPressTimer = setTimeout(() => startLongPressMenu(clientX, clientY), LONG_PRESS_MS)
}

const onEditorTouchEnd = () => {
  clearLongPressTimer()
  scheduleSelectionMenuUpdate()
}

const onEditorMouseDown = (e: MouseEvent) => {
  if (e.button !== 0 || hasTextSelectionInEditor()) return
  clearLongPressTimer()
  const { clientX, clientY } = e
  longPressTimer = setTimeout(() => startLongPressMenu(clientX, clientY), LONG_PRESS_MS)
}

const onEditorMouseUp = () => {
  clearLongPressTimer()
  scheduleSelectionMenuUpdate()
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
  emit('keydown', e)
  if (props.disabled || props.readonly) return
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
  clearLongPressTimer()
  if (hideMenuTimer) clearTimeout(hideMenuTimer)
  cancelAnimationFrame(selectionMenuRaf)
  syncFromEditor()
  hideFormatMenu()
})

/** Yuborishdan oldin contenteditable → Telegram HTML */
const flushModel = (): string => {
  syncFromEditor()
  return String(modelValue.value || '')
}

defineExpose({
  focus: focusEditor,
  blur: () => editorRef.value?.blur(),
  flushModel,
})
</script>

<style scoped>
.tg-format-menu {
  -webkit-overflow-scrolling: touch;
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
