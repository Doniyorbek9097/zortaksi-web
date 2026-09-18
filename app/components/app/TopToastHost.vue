<template>
  <Teleport to="body">
    <Transition name="top-toast">
      <div
        v-if="toast"
        class="fixed inset-x-0 z-[300] flex justify-center px-4 pointer-events-none"
        :style="{ top: 'calc(0.75rem + var(--zt-safe-top, 0px))' }"
        role="status"
        aria-live="polite"
      >
        <div
          class="pointer-events-auto flex items-center gap-3 w-full max-w-sm px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md"
          :class="shellClass"
        >
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white shadow-md"
            :class="iconShellClass"
          >
            <font-awesome-icon :icon="iconName" class="text-sm" />
          </div>
          <p class="min-w-0 flex-1 text-[13px] font-bold leading-snug" :class="textClass">
            {{ toast.message }}
          </p>
          <button
            type="button"
            class="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
            :class="closeClass"
            aria-label="Yopish"
            @click="hide"
          >
            <font-awesome-icon icon="fa-solid fa-times" class="text-xs" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { TopToastVariant } from '~/composables/useTopToast'
import { useTopToast } from '~/composables/useTopToast'

const { toast, hide } = useTopToast()

const variant = computed<TopToastVariant>(() => toast.value?.variant ?? 'info')

const shellClass = computed(() => {
  switch (variant.value) {
    case 'success':
      return 'bg-white/95 dark:bg-slate-900/95 border-emerald-200/80 dark:border-emerald-800/50 shadow-emerald-500/10'
    case 'warning':
      return 'bg-white/95 dark:bg-slate-900/95 border-amber-200/80 dark:border-amber-800/50 shadow-amber-500/10'
    case 'error':
      return 'bg-white/95 dark:bg-slate-900/95 border-red-200/80 dark:border-red-800/50 shadow-red-500/10'
    default:
      return 'bg-white/95 dark:bg-slate-900/95 border-sky-200/80 dark:border-sky-800/50 shadow-sky-500/10'
  }
})

const iconShellClass = computed(() => {
  switch (variant.value) {
    case 'success':
      return 'bg-emerald-500 shadow-emerald-500/30'
    case 'warning':
      return 'bg-amber-500 shadow-amber-500/30'
    case 'error':
      return 'bg-red-500 shadow-red-500/30'
    default:
      return 'bg-sky-500 shadow-sky-500/30'
  }
})

const iconName = computed(() => {
  switch (variant.value) {
    case 'success':
      return 'fa-solid fa-check'
    case 'warning':
      return 'fa-solid fa-circle-exclamation'
    case 'error':
      return 'fa-solid fa-circle-xmark'
    default:
      return 'fa-solid fa-microphone'
  }
})

const textClass = computed(() => 'text-slate-800 dark:text-slate-100')
const closeClass = computed(() => 'text-slate-500 dark:text-slate-400')
</script>

<style scoped>
.top-toast-enter-active,
.top-toast-leave-active {
  transition: opacity 0.26s ease, transform 0.26s ease;
}

.top-toast-enter-from,
.top-toast-leave-to {
  opacity: 0;
  transform: translateY(-14px);
}
</style>
