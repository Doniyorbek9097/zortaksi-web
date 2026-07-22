<template>
  <label for="phoneInput" class="flex flex-col p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl transition-colors">
    <p v-if="error" class="text-red-500 text-[10px] font-bold uppercase tracking-wider">{{ error }}</p>
    <p v-else class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Telefon raqamingiz</p>
    <div class="flex justify-between items-center">
      <div class="flex gap-2 items-center text-slate-900 dark:text-white">
        <span class="font-bold text-[18px] md:text-[22px] tracking-tight">+998</span>
        <input ref="inputRef" id="phoneInput" :value="formattedPhone" type="tel" placeholder="(__) ___ - __ - __"
          maxlength="14" minlength="14"
          class="w-[150px] md:w-[200px] font-bold text-[18px] md:text-[22px] placeholder:text-slate-300 dark:placeholder:text-slate-600 bg-transparent outline-none border-none selection:bg-emerald-500/30"
          @focus="handleFocus" @input="handleInput" @keydown="restrictInput" />
      </div>

      <LoadingIcon v-if="loading" class="animate-spin fill-slate-400 w-5 h-5" />
      <RefreshSmsIcon v-else @click="handleInput"
        :class="[[disabled ? 'cursor-not-allowed fill-slate-400' : 'fill-emerald-500 hover:scale-110 active:scale-95'], 'w-5 h-5 transition-all cursor-pointer']" />
    </div>
  </label>
</template>

<script setup lang="ts">
import LoadingIcon from "~/assets/icons/time-past.svg"
import RefreshSmsIcon from "~/assets/icons/email-refresh.svg"

const props = defineProps<{ modelValue: string | null, disabled: boolean, loading: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void,
  (e: 'submit', value: string | null): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const rawPhone = ref<string>(props.modelValue?.replace(/\D/g, '').slice(3) || '')
const error = ref<string>('')

// O‘zbekiston operator kodlari
const validCodes = ['90', '91', '93', '94', '95', '97', '98', '99', '33', '55', '88']


onMounted(() => {
  nextTick(() => {
    // faqat mobile input fokus oladi
    inputRef.value?.focus()
  })
})

// Formatlash
const formattedPhone = computed(() => {
  const digits = rawPhone.value.replace(/\D/g, '')
  if (!digits) return ''
  const match = digits.match(/^(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})$/)
  if (!match) return digits

  const [, code, part1, part2, part3] = match
  let formatted = ''

  if (code) formatted += `(${code}${code.length === 2 ? ')' : ''}`
  if (part1) formatted += ` ${part1}`
  if (part2) formatted += `-${part2}`
  if (part3) formatted += `-${part3}`

  return formatted.trim()
})

// Fokusda kursorni oxiriga qo‘yish
const handleFocus = () => {
  setTimeout(() => {
    const input = inputRef.value
    if (input) input.setSelectionRange(input.value.length, input.value.length)
  }, 0)
}

// Faqat raqam kiritish
const restrictInput = (event: KeyboardEvent) => {
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']
  if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
    event.preventDefault()
  }
}

// 🔧 MUHIM QISIM: `rawPhone` ni inputdan har safar yangilab turish
const handleInput = () => {
  const input = inputRef.value;
  if (!input) return;

  const digits = input.value.replace(/\D/g, '')

  rawPhone.value = digits.slice(0, 9)

  if (rawPhone.value.length === 9) {
    const code = rawPhone.value.slice(0, 2)
    if (validCodes.includes(code)) {
      error.value = ''
      emit('submit', `998${rawPhone.value}`)
    } else {
      error.value = 'Operator kodi xato'
      emit('submit', null)
    }
  } else {
    error.value = ''
    emit('submit', null)
  }
}

</script>
