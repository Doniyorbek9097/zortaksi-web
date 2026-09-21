<template>
  <div class="space-y-1.5">
    <label v-if="label" class="px-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
      {{ label }}
    </label>

    <div
      class="flex items-center gap-1 p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
    >
      <button
        v-for="btn in toolbar"
        :key="btn.tag"
        type="button"
        class="min-w-8 h-8 px-2 rounded-lg text-[12px] font-black text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
        :title="btn.title"
        @mousedown.prevent
        @click="onTag(btn.tag)"
      >
        <span v-if="btn.tag === 'b'" class="font-black">B</span>
        <span v-else-if="btn.tag === 'i'" class="italic font-bold">I</span>
        <span v-else-if="btn.tag === 'a'" class="underline font-bold">A</span>
        <span v-else class="font-mono text-[10px] font-bold">code</span>
      </button>
    </div>

    <textarea
      ref="textareaRef"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :maxlength="maxlength"
      class="w-full px-3.5 py-3 rounded-xl text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40 resize-none font-mono leading-relaxed"
      @input="onInput"
    />

    <p v-if="hint" class="px-1 text-[10px] font-semibold text-slate-400 leading-snug">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import {
  sanitizeTelegramLinkUrl,
  wrapTelegramHtmlTag,
  type TelegramHtmlTag,
} from '~/utils/telegramHtmlEditor'

withDefaults(
  defineProps<{
    label?: string
    placeholder?: string
    rows?: number
    maxlength?: number
    hint?: string
  }>(),
  {
    rows: 4,
    hint: 'Telegram HTML: <b>, <i>, <a href="...">, <code>',
  },
)

const modelValue = defineModel<string>({ default: '' })

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const toolbar: Array<{ tag: TelegramHtmlTag; title: string }> = [
  { tag: 'b', title: 'Qalin (b)' },
  { tag: 'i', title: 'Kursiv (i)' },
  { tag: 'a', title: 'Havola (a)' },
  { tag: 'code', title: 'Kod (code)' },
]

const applyWrap = (result: { text: string; selectionStart: number; selectionEnd: number }) => {
  modelValue.value = result.text
  const ta = textareaRef.value
  if (!ta) return
  nextTick(() => {
    ta.focus()
    ta.setSelectionRange(result.selectionStart, result.selectionEnd)
  })
}

const onInput = (e: Event) => {
  modelValue.value = (e.target as HTMLTextAreaElement).value
}

const onTag = (tag: TelegramHtmlTag) => {
  const ta = textareaRef.value
  if (!ta) return
  const start = ta.selectionStart
  const end = ta.selectionEnd

  if (tag === 'a') {
    const url = window.prompt('Havola manzili', 'https://')
    if (!url) return
    const href = sanitizeTelegramLinkUrl(url)
    if (!href) return
    applyWrap(wrapTelegramHtmlTag(modelValue.value, start, end, 'a', `href="${href}"`))
    return
  }

  applyWrap(wrapTelegramHtmlTag(modelValue.value, start, end, tag))
}
</script>
