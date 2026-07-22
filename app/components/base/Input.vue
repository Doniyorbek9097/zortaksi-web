<template>
  <div class="relative space-y-[2px]">
    <span v-if="props.label" class="px-1 text-xs">{{ props.label }}</span>
    <!-- TEXTAREA -->
    <textarea v-if="type === 'textarea'" v-bind="$attrs" ref="textareaRef" v-model="localModelValue"
      :placeholder="placeholder" :disabled="disabled" :rows="4" :class="fieldClass" />

    <!-- INPUT (default) -->
    <div v-else class="relative">
      <input v-if="!type || type !== 'textarea'" v-bind="$attrs" ref="inputRef" v-model="localModelValue" type="text"
        :inputmode="inputMode" @input="handleInput" :placeholder="placeholder" :disabled="disabled"
        :class="fieldClass" />

      <span v-if="isPrice && currency" class="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
        {{ currency }}
      </span>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, inject, onMounted, onUnmounted, nextTick, computed } from 'vue'

const props = defineProps<{
  modelValue: string | number | null
  placeholder?: string
  label?: string
  type?: string
  disabled?: boolean
  required?: boolean
  autofocus?: boolean

  isPrice?: boolean
  currency?: 'UZS' | 'USD' | null
  min?: number
  max?: number
  decimal?: boolean
}>()


const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const inputMode = computed<'text' | 'numeric'>(() => {
  if (props.isPrice) return 'numeric'
  if (props.type === 'number') return 'numeric'
  return 'text'
})

const handleInput = (e: Event) => {
  if (props.isPrice || props.type === 'number') {
    onPriceInput(e)
    return
  }
}

const localModelValue = ref(
  props.modelValue !== null ? String(props.modelValue) : ''
)
const isInvalid = ref(false)

const onlyNumbers = (v: string) =>
  v.replace(/[^\d.]/g, '')

const formatPrice = (v: number) => {
  if (!v) return ''
  return v.toLocaleString('ru-RU')
}

const parsePrice = (v: string) => {
  const n = Number(onlyNumbers(v))
  return isNaN(n) ? null : n
}


// Sync v-model
watch(
  () => props.modelValue,
  v => {
    if (props.type === 'number' && typeof v === 'number') {
      localModelValue.value = String(v)
    } else if (props.isPrice && typeof v === 'number') {
      localModelValue.value = formatPrice(v)
    } else {
      localModelValue.value = v !== null ? String(v) : ''
    }
  },
  { immediate: true }
)

watch(localModelValue, v => {
  if (!props.isPrice) {
    emit('update:modelValue', v)
    return
  }

  const parsed = parsePrice(v)

  if (parsed === null) {
    emit('update:modelValue', null)
    return
  }

  if (props.min && parsed < props.min) return
  if (props.max && parsed > props.max) return

  emit('update:modelValue', parsed)
})


const onPriceInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const raw = onlyNumbers(target.value)
  // ✅ MUHIM: agar bo‘sh bo‘lsa — tozalaymiz
  if (raw === '') {
    localModelValue.value = ''
    emit('update:modelValue', null)
    return
  }

  let num = Number(raw)

  if (isNaN(num)) {
    localModelValue.value = ''
    emit('update:modelValue', null)
    return
  }

  // Min / Max
  if (props.min !== undefined && num < props.min) return
  if (props.max !== undefined && num > props.max) num = props.max

  // 🔑 FARQ SHU YERDA
  if (props.type === 'number') {
    // formatlamaymiz
    localModelValue.value = String(num)
  } else {
    // isPrice bo‘lsa formatlaymiz
    localModelValue.value = formatPrice(num)
  }

  emit('update:modelValue', num)
}

// Validation
const validate = () => {
  let invalid = false

  if (props.required) {
    if (props.isPrice) {
      invalid =
        props.modelValue === null ||
        props.modelValue === undefined ||
        props.modelValue === "" ||
        Number(props.modelValue) < 0
    } else {
      invalid = !localModelValue.value.trim()
    }

  }

  isInvalid.value = invalid

  if (invalid) {
    inputRef.value?.focus()
  }

  return !invalid
}

const registerValidator = inject<
  (fn: () => boolean) => () => void
>('registerValidator')

let unregister: (() => void) | undefined

onMounted(() => {
  unregister = registerValidator?.(() => validate())

  // Autofocus
  if (props.autofocus) {
    nextTick(() => {
      if (props.type === 'textarea') {
        textareaRef.value?.focus()
      } else {
        inputRef.value?.focus()
      }
    })
  }
})

onUnmounted(() => {
  unregister?.()
})

// Shared styles
const fieldClass = computed(() => [
  'w-full px-3.5 py-3 rounded-xl text-base placeholder:text-xs',
  'bg-white dark:bg-gray-900',
  'text-gray-900 dark:text-gray-100',
  'placeholder-gray-400 dark:placeholder-gray-500',
  'border transition',
  'focus:outline-none focus:ring-2',
  isInvalid.value
    ? 'border-red-500 focus:ring-red-500'
    : 'border-gray-300 dark:border-gray-700 focus:ring-indigo-500'
])
</script>
