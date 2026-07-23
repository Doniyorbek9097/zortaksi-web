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
      <div
        class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
        :class="errorText ? 'bg-red-500/10 text-red-500' : 'bg-sky-500/10 text-sky-500 group-focus-within:bg-[#2AABEE]/15 group-focus-within:text-[#2AABEE]'"
      >
        <font-awesome-icon icon="fa-solid fa-phone" class="text-sm" />
      </div>

      <div class="relative shrink-0">
        <select
          v-model="countryKey"
          :disabled="disabled"
          aria-label="Davlat"
          class="appearance-none max-w-[8.5rem] pl-1 pr-6 py-1 rounded-lg bg-transparent text-[13px] md:text-sm font-black text-slate-900 dark:text-white outline-none cursor-pointer disabled:opacity-50"
          @change="onCountryChange"
        >
          <option
            v-for="c in countries"
            :key="c.key"
            :value="c.key"
          >
            {{ c.flag }} +{{ c.dial || '…' }} {{ c.short }}
          </option>
        </select>
        <font-awesome-icon
          icon="fa-solid fa-chevron-down"
          class="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-slate-400"
        />
      </div>

      <div
        v-if="isOther"
        class="flex items-baseline gap-0.5 shrink-0"
      >
        <span class="text-base font-black text-slate-400">+</span>
        <input
          v-model="customDial"
          type="tel"
          inputmode="numeric"
          maxlength="3"
          :disabled="disabled"
          placeholder="90"
          aria-label="Davlat kodi"
          class="w-10 bg-transparent outline-none text-base font-black text-slate-900 dark:text-white tabular-nums disabled:opacity-50"
          @input="onCustomDialInput"
        >
      </div>
      <span
        v-else
        class="text-base md:text-lg font-black text-slate-900 dark:text-white tabular-nums shrink-0"
      >
        +{{ dialCode }}
      </span>

      <input
        id="phoneInput"
        ref="inputRef"
        :value="displayValue"
        type="tel"
        inputmode="numeric"
        autocomplete="tel-national"
        :placeholder="placeholder"
        :disabled="disabled"
        class="w-full min-w-0 bg-transparent outline-none border-none text-lg md:text-xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 tabular-nums tracking-wide selection:bg-sky-500/20 disabled:opacity-50"
        @focus="onFocus"
        @input="onInput"
        @keydown="onKeydown"
      >

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
/** modelValue: to'liq E.164 raqamlar (+ siz), masalan 998901234567 */

type Country = {
  key: string
  short: string
  dial: string
  flag: string
  nationalLen?: number
}

const countries: Country[] = [
  { key: 'UZ', short: 'UZ', dial: '998', flag: '🇺🇿', nationalLen: 9 },
  { key: 'RU', short: 'RU', dial: '7', flag: '🇷🇺', nationalLen: 10 },
  { key: 'KZ', short: 'KZ', dial: '7', flag: '🇰🇿', nationalLen: 10 },
  { key: 'KG', short: 'KG', dial: '996', flag: '🇰🇬', nationalLen: 9 },
  { key: 'TJ', short: 'TJ', dial: '992', flag: '🇹🇯', nationalLen: 9 },
  { key: 'TM', short: 'TM', dial: '993', flag: '🇹🇲', nationalLen: 8 },
  { key: 'AF', short: 'AF', dial: '93', flag: '🇦🇫', nationalLen: 9 },
  { key: 'AZ', short: 'AZ', dial: '994', flag: '🇦🇿', nationalLen: 9 },
  { key: 'TR', short: 'TR', dial: '90', flag: '🇹🇷', nationalLen: 10 },
  { key: 'UA', short: 'UA', dial: '380', flag: '🇺🇦', nationalLen: 9 },
  { key: 'BY', short: 'BY', dial: '375', flag: '🇧🇾', nationalLen: 9 },
  { key: 'AM', short: 'AM', dial: '374', flag: '🇦🇲', nationalLen: 8 },
  { key: 'GE', short: 'GE', dial: '995', flag: '🇬🇪', nationalLen: 9 },
  { key: 'AE', short: 'AE', dial: '971', flag: '🇦🇪', nationalLen: 9 },
  { key: 'DE', short: 'DE', dial: '49', flag: '🇩🇪', nationalLen: 11 },
  { key: 'GB', short: 'GB', dial: '44', flag: '🇬🇧', nationalLen: 10 },
  { key: 'US', short: 'US', dial: '1', flag: '🇺🇸', nationalLen: 10 },
  { key: 'KR', short: 'KR', dial: '82', flag: '🇰🇷', nationalLen: 10 },
  { key: 'CN', short: 'CN', dial: '86', flag: '🇨🇳', nationalLen: 11 },
  { key: 'IN', short: 'IN', dial: '91', flag: '🇮🇳', nationalLen: 10 },
  { key: 'XX', short: '…', dial: '', flag: '🌐' },
]

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
const countryKey = ref('UZ')
const customDial = ref('')
const nationalDigits = ref('')

const isOther = computed(() => countryKey.value === 'XX')

const selectedCountry = computed((): Country => {
  return countries.find((c) => c.key === countryKey.value) ?? countries[0]!
})

const dialCode = computed(() =>
  isOther.value ? customDial.value.replace(/\D/g, '').slice(0, 3) : selectedCountry.value.dial
)

const sortedDials = countries
  .filter((c) => c.dial)
  .map((c) => ({ key: c.key, dial: c.dial }))
  .sort((a, b) => b.dial.length - a.dial.length)

const maxNational = computed(() => {
  const dialLen = Math.max(dialCode.value.length, 1)
  const hardMax = Math.max(4, 15 - dialLen)
  const hint = selectedCountry.value.nationalLen
  if (!isOther.value && hint) return Math.min(hint, hardMax)
  return hardMax
})

const placeholder = computed(() => {
  if (dialCode.value === '998') return '90 123 45 67'
  return 'Raqamni kiriting'
})

const displayValue = computed(() => {
  const digits = nationalDigits.value
  if (!digits) return ''
  if (dialCode.value === '998' && digits.length <= 9) {
    const a = digits.slice(0, 2)
    const b = digits.slice(2, 5)
    const c = digits.slice(5, 7)
    const d = digits.slice(7, 9)
    return [a, b, c, d].filter(Boolean).join(' ')
  }
  return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
})

const fullDigits = computed(() => `${dialCode.value}${nationalDigits.value}`)

const isComplete = computed(() => {
  const full = fullDigits.value
  if (!/^\d{8,15}$/.test(full)) return false
  if (!dialCode.value || nationalDigits.value.length < 4) return false
  const expected = !isOther.value ? selectedCountry.value.nationalLen : undefined
  if (expected) return nationalDigits.value.length === expected
  return true
})

const errorText = computed(() => props.error || localError.value)

const emitFull = () => {
  emit('update:modelValue', fullDigits.value)
}

const parseIncoming = (raw: string) => {
  const d = String(raw || '').replace(/\D/g, '')
  if (!d) {
    nationalDigits.value = ''
    return
  }
  const match = sortedDials.find((c) => d.startsWith(c.dial))
  if (match) {
    // +7 → RU (default); KZ ham bir xil dial
    countryKey.value = match.dial === '7' ? 'RU' : match.key
    customDial.value = ''
    nationalDigits.value = d.slice(match.dial.length).slice(0, 15 - match.dial.length)
    return
  }
  countryKey.value = 'XX'
  if (d.length > 4) {
    const guessLen = Math.min(3, d.length - 4)
    customDial.value = d.slice(0, guessLen)
    nationalDigits.value = d.slice(guessLen)
  } else {
    customDial.value = ''
    nationalDigits.value = d
  }
}

watch(
  () => props.modelValue,
  (v) => {
    const next = String(v || '').replace(/\D/g, '')
    if (next === fullDigits.value) return
    parseIncoming(next)
  },
  { immediate: true }
)

const onCountryChange = () => {
  if (isOther.value && !customDial.value) customDial.value = ''
  nationalDigits.value = nationalDigits.value.slice(0, maxNational.value)
  localError.value = ''
  emitFull()
  nextTick(() => inputRef.value?.focus())
}

const onCustomDialInput = () => {
  customDial.value = customDial.value.replace(/\D/g, '').slice(0, 3)
  nationalDigits.value = nationalDigits.value.slice(0, maxNational.value)
  emitFull()
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
    if (isComplete.value) emit('submit', fullDigits.value)
    return
  }
  if (!/[0-9]/.test(e.key) && !allowed.includes(e.key)) {
    e.preventDefault()
  }
}

const onInput = (e: Event) => {
  const el = e.target as HTMLInputElement
  const digits = el.value.replace(/\D/g, '').slice(0, maxNational.value)
  localError.value = ''
  nationalDigits.value = digits
  emitFull()
  nextTick(() => {
    const len = displayValue.value.length
    el.setSelectionRange(len, len)
  })
}

onMounted(() => {
  nextTick(() => inputRef.value?.focus())
})
</script>
