<template>
  <div class="relative space-y-1" >
    <header v-if="label" class="px-1 text-xs">
      {{ label }}
    </header>

    <main :class="fieldClass">
      <slot />
    </main>

    <footer v-if="hint && !props.modelValue" class="text-xs text-red-500">
      {{ hint }}
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: string | number | null
  label?: string
  hint?: string
  required?: boolean
}>()

const isInvalid = ref(false)

/**
 * 🔍 Asosiy validation
 */
const validate = () => {
  if (!props.required) {
    isInvalid.value = false
    return true
  }

  const invalid =
    props.modelValue === null ||
    props.modelValue === undefined ||
    (typeof props.modelValue === 'string' &&
      props.modelValue.trim() === '')

  isInvalid.value = invalid
  return !invalid
}

/**
 * 🔄 modelValue o‘zgarsa qayta tekshiramiz
 */
watch(
  () => props.modelValue,
  () => validate(),
  { immediate: true }
)

/**
 * 🧩 Form contextga validatorni ulaymiz
 */
const registerValidator = inject<
  (fn: () => boolean) => () => void
>('registerValidator')

let unregister: (() => void) | undefined

onMounted(() => {
  unregister = registerValidator?.(validate)
})

onUnmounted(() => {
  unregister?.()
})

/**
 * 🎨 Style
 */
const fieldClass = computed(() => [
  'w-full rounded-xl transition',
  isInvalid.value ? 'ring-1 ring-red-500' : ''
])
</script>
