<template>
  <Teleport to="body">
    <Transition name="cd-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-end justify-center md:items-center bg-black/40 dark:bg-black/70 backdrop-blur-sm"
        @click.self="close"
      >
        <Transition name="cd-sheet" appear>
          <div
            v-if="modelValue"
            class="w-full md:max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 md:p-6"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">
                  Xabar yuborish
                </h3>
                <p class="mt-0.5 text-[12px] font-medium text-slate-400">
                  {{ count }} ta haydovchiga Telegram orqali
                </p>
              </div>
              <button
                type="button"
                class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
                aria-label="Yopish"
                @click="close"
              >
                <font-awesome-icon icon="fa-solid fa-times" />
              </button>
            </div>

            <textarea
              v-model="text"
              rows="5"
              placeholder="Xabar matnini yozing…"
              class="mt-4 w-full px-3.5 py-3 rounded-xl text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            />

            <div class="mt-5 flex items-center gap-3">
              <button
                type="button"
                class="flex-1 py-3 rounded-xl text-sm font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 active:scale-[0.98] transition-all"
                @click="close"
              >
                Bekor
              </button>
              <button
                type="button"
                :disabled="loading || !text.trim()"
                class="flex-[1.4] inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-white bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
                @click="onConfirm"
              >
                <font-awesome-icon
                  :icon="loading ? 'fa-solid fa-spinner' : 'fa-solid fa-paper-plane'"
                  :class="loading ? 'animate-spin' : ''"
                />
                Yuborish
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  count: number
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  confirm: [text: string]
}>()

const text = ref('')

watch(
  () => props.modelValue,
  open => {
    if (open) text.value = ''
  }
)

const close = () => emit('update:modelValue', false)

const onConfirm = () => {
  if (!text.value.trim()) return
  emit('confirm', text.value.trim())
}

useHistoryBackClose(() => props.modelValue, close, { key: 'ztAdminMessage' })
</script>

<style scoped>
.cd-fade-enter-active,
.cd-fade-leave-active { transition: opacity 0.2s ease; }
.cd-fade-enter-from,
.cd-fade-leave-to { opacity: 0; }
.cd-sheet-enter-active,
.cd-sheet-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
}
.cd-sheet-enter-from,
.cd-sheet-leave-to { transform: translateY(100%); opacity: 0; }
@media (min-width: 768px) {
  .cd-sheet-enter-from,
  .cd-sheet-leave-to { transform: scale(0.92); opacity: 0; }
}
</style>
