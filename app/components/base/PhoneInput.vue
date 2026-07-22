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
      class="relative flex items-center gap-2.5 rounded-2xl border px-4 py-3.5 transition-all duration-300"
      :class="[
        errorText
          ? 'border-red-500/40 ring-4 ring-red-500/5 bg-red-500/5'
          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-within:border-sky-500/50 focus-within:ring-4 focus-within:ring-sky-500/10 focus-within:bg-white dark:focus-within:bg-slate-950',
      ]"
    >
      <div
        class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
        :class="errorText ? 'bg-red-500/10 text-red-500' : 'bg-sky-500/10 text-sky-500 group-focus-within:bg-[#2AABEE]/15 group-focus-within:text-[#2AABEE]'"
      >
        <font-awesome-icon icon="fa-solid fa-phone" class="text-sm" />
      </div>

      <div class="flex items-baseline gap-2 min-w-0 flex-1">
        <span class="text-lg md:text-xl font-black text-slate-900 dark:text-white tabular-nums shrink-0">
          +998
        </span>
        <input
          id="phoneInput"
          ref="inputRef"
          :value="displayValue"
          type="tel"
          inputmode="numeric"
          autocomplete="tel-national"
          placeholder="(90) 123-45-67"
          maxlength="14"
          :disabled="disabled"
          class="w-full min-w-0 bg-transparent outline-none border-none text-lg md:text-xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 tabular-nums tracking-wide selection:bg-sky-500/20 disabled:opacity-50"
          @focus="onFocus"
          @input="onInput"
          @keydown="onKeydown"
        >
      </div>

      <font-awesome-icon
        v-if="loading"
        icon="fa-solid fa-spinner"
        class="animate-spin text-sky-500 shrink-0"
      />
      <span
        v-else-if="isComplete"
        class="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0"
      >
        <font-awesome-icon icon="fa-solid fa-check" class="text-[10px]" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
/** modelValue: faqat milliy 9 raqam (masalan 901234567) yoki to'liq 998... */

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

const nationalDigits = computed(() => {
  let d = String(props.modelValue || '').replace(/\D/g, '')
  if (d.startsWith('998')) d = d.slice(3)
  return d.slice(0, 9)
})

/** (90) 123-45-67 */
const displayValue = computed(() => {
  const digits = nationalDigits.value
  if (!digits) return ''
  const a = digits.slice(0, 2)
  const b = digits.slice(2, 5)
  const c = digits.slice(5, 7)
  const d = digits.slice(7, 9)
  let out = ''
  if (a) out += `(${a}`
  if (a.length === 2) out += ')'
  if (b) out += ` ${b}`
  if (c) out += `-${c}`
  if (d) out += `-${d}`
  return out
})

const isComplete = computed(() => nationalDigits.value.length === 9)
const errorText = computed(() => props.error || localError.value)

const emitValue = (national: string) => {
  emit('update:modelValue', national)
}

const onFocus = () => {
  nextTick(() => {
    const el = inputRef.value
    if (!el) return
    const len = el.value.length
    el.setSelectionRange(len, len)
  })
}

const onKeydown = (e: KeyboardEvent) => {
  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter']
  if (e.key === 'Enter') {
    e.preventDefault()
    if (isComplete.value) emit('submit', `998${nationalDigits.value}`)
    return
  }
  if (!/[0-9]/.test(e.key) && !allowed.includes(e.key)) {
    e.preventDefault()
  }
}

const onInput = (e: Event) => {
  const el = e.target as HTMLInputElement
  const digits = el.value.replace(/\D/g, '').slice(0, 9)
  localError.value = ''
  emitValue(digits)
  nextTick(() => {
    const len = displayValue.value.length
    el.setSelectionRange(len, len)
  })
}

onMounted(() => {
  nextTick(() => inputRef.value?.focus())
})
</script>
