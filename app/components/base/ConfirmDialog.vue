<template>
  <Teleport to="body">
    <Transition name="cd-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-end justify-center md:items-center bg-black/40 dark:bg-black/70 backdrop-blur-sm"
        @click.self="onCancel"
      >
        <Transition name="cd-sheet" appear>
          <div
            v-if="modelValue"
            class="w-full md:max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 md:p-6"
          >
            <!-- Header -->
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">{{ title }}</h3>
                <p v-if="description" class="mt-0.5 text-[12px] font-medium text-slate-400 dark:text-slate-500">
                  {{ description }}
                </p>
              </div>
              <button
                type="button"
                class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Yopish"
                @click="onCancel"
              >
                <font-awesome-icon icon="fa-solid fa-times" />
              </button>
            </div>

            <!-- Message -->
            <p
              v-if="message"
              class="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line"
            >
              {{ message }}
            </p>

            <!-- Slot (ixtiyoriy qo'shimcha kontent) -->
            <slot />

            <!-- Buttons -->
            <div class="mt-6 flex items-center gap-3">
              <button
                type="button"
                class="flex-1 py-3 rounded-xl text-sm font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] transition-all"
                @click="onCancel"
              >
                {{ cancelText }}
              </button>
              <button
                type="button"
                :disabled="loading"
                class="flex-[1.4] py-3 rounded-xl text-sm font-black text-white active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                :class="confirmClass"
                @click="onConfirm"
              >
                <font-awesome-icon v-if="loading" icon="fa-solid fa-spinner" class="animate-spin mr-1" />
                {{ confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
type Variant = 'danger' | 'primary' | 'success' | 'warning'

interface Props {
  modelValue: boolean
  title?: string
  message?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: Variant
  /** true bo'lsa — tasdiqlash tugmasi loading holatida (parent async ish qilsa) */
  loading?: boolean
  /** false bo'lsa — tasdiqlangach oyna avtomatik yopilmaydi (parent yopadi) */
  closeOnConfirm?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Tasdiqlaysizmi?',
  confirmText: 'Tasdiqlash',
  cancelText: 'Bekor',
  variant: 'danger',
  loading: false,
  closeOnConfirm: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const variantMap: Record<Variant, string> = {
  danger: 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30',
  primary: 'bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/30',
  success: 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30',
  warning: 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/30',
}

const confirmClass = computed(() => variantMap[props.variant])

const onCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}

const onConfirm = () => {
  emit('confirm')
  if (props.closeOnConfirm) emit('update:modelValue', false)
}

useHistoryBackClose(
  () => props.modelValue,
  () => {
    emit('cancel')
    emit('update:modelValue', false)
  },
  { key: 'ztConfirm' },
)
</script>

<style scoped>
.cd-fade-enter-active,
.cd-fade-leave-active {
  transition: opacity 0.2s ease;
}
.cd-fade-enter-from,
.cd-fade-leave-to {
  opacity: 0;
}

.cd-sheet-enter-active,
.cd-sheet-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
}
.cd-sheet-enter-from,
.cd-sheet-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (min-width: 768px) {
  .cd-sheet-enter-from,
  .cd-sheet-leave-to {
    transform: scale(0.92);
    opacity: 0;
  }
}
</style>
