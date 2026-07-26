<template>
  <div class="relative group">
    <div class="flex justify-between items-center mb-1.5 px-1">
      <label
        for="phoneInput"
        class="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400"
      >
        {{ label }}
      </label>
      <span
        v-if="errorText"
        class="text-[10px] font-black text-red-500 uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded-full"
      >
        {{ errorText }}
      </span>
    </div>

    <div
      class="relative flex items-center gap-2 rounded-2xl border px-3 py-3 transition-all duration-300"
      :class="[
        errorText
          ? 'border-red-500/40 ring-4 ring-red-500/5 bg-red-500/5'
          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-within:border-sky-500/50 focus-within:ring-4 focus-within:ring-sky-500/10 focus-within:bg-white dark:focus-within:bg-slate-950',
      ]"
    >
      <span class="text-lg font-black text-slate-400 shrink-0 select-none">+</span>

      <input
        id="phoneInput"
        ref="inputRef"
        :value="displayValue"
        type="tel"
        inputmode="numeric"
        autocomplete="tel"
        placeholder="998 90 123 45 67"
        :disabled="disabled"
        class="w-full min-w-0 bg-transparent outline-none border-none text-lg font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 tabular-nums tracking-wide selection:bg-sky-500/20 disabled:opacity-50"
        @focus="onFocus"
        @input="onInput"
        @change="onChange"
        @paste="onPaste"
        @keydown="onKeydown"
      >

      <font-awesome-icon
        v-if="loading"
        icon="fa-solid fa-spinner"
        class="animate-spin text-sky-500 shrink-0"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/** modelValue: to'liq E.164 raqamlar (+ siz), masalan 998901234567 */

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    label?: string
    disabled?: boolean
    loading?: boolean
    error?: string
  }>(),
  {
    modelValue: '',
    label: 'Telefon raqam',
    disabled: false,
    loading: false,
    error: '',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [value: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const localError = ref('')
const digits = ref('')

const errorText = computed(() => props.error || localError.value)

/** O‘qish uchun engil format: 3+3+… */
const displayValue = computed(() => {
  const d = digits.value
  if (!d) return ''
  // UZ: 998 XX XXX XX XX
  if (d.startsWith('998') && d.length <= 12) {
    const rest = d.slice(3)
    const parts = [
      '998',
      rest.slice(0, 2),
      rest.slice(2, 5),
      rest.slice(5, 7),
      rest.slice(7, 9),
    ].filter(Boolean)
    return parts.join(' ')
  }
  return d.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
})

const isComplete = computed(() => /^\d{8,15}$/.test(digits.value))

watch(
  () => props.modelValue,
  (v) => {
    const next = String(v || '').replace(/\D/g, '').slice(0, 15)
    if (next === digits.value) return
    digits.value = next
  },
  { immediate: true }
)

const emitFull = () => {
  emit('update:modelValue', digits.value)
}

const onFocus = () => {
  nextTick(() => {
    const el = inputRef.value
    if (!el) return
    const len = el.value.length
    el.setSelectionRange(len, len)
  })
}

const syncFromElement = (el: HTMLInputElement) => {
  localError.value = ''
  const next = el.value.replace(/\D/g, '').slice(0, 15)
  if (next === digits.value) return false
  digits.value = next
  emitFull()
  return true
}

const moveCaretToEnd = (el: HTMLInputElement) => {
  nextTick(() => {
    const len = displayValue.value.length
    el.setSelectionRange(len, len)
  })
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Enter') return
  e.preventDefault()
  if (isComplete.value) emit('submit', digits.value)
}

const onInput = (e: Event) => {
  const el = e.target as HTMLInputElement
  if (syncFromElement(el)) moveCaretToEnd(el)
}

const onChange = (e: Event) => {
  syncFromElement(e.target as HTMLInputElement)
}

const onPaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const el = e.target as HTMLInputElement
  const pasted = e.clipboardData?.getData('text') || ''
  digits.value = `${digits.value}${pasted}`.replace(/\D/g, '').slice(0, 15)
  emitFull()
  moveCaretToEnd(el)
}

onMounted(() => {
  nextTick(() => inputRef.value?.focus())
})
</script>
