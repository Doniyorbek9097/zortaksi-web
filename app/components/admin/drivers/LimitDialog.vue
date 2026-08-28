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
              <h3 class="text-lg font-black text-slate-900 dark:text-white">
                Custom limit
              </h3>
              <button
                type="button"
                class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
                aria-label="Yopish"
                @click="close"
              >
                <font-awesome-icon icon="fa-solid fa-times" />
              </button>
            </div>

            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {{ name }} — muddat uzaytiriladi va haydovchi faollashtiriladi
            </p>

            <div class="mt-4 grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="px-1 text-[11px] font-bold text-slate-400">Kun</label>
                <input
                  v-model="daysText"
                  type="number"
                  min="0"
                  max="365"
                  placeholder="0"
                  class="w-full px-3.5 py-3 rounded-xl text-base bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
              </div>
              <div class="space-y-1.5">
                <label class="px-1 text-[11px] font-bold text-slate-400">Soat</label>
                <input
                  v-model="hoursText"
                  type="number"
                  min="0"
                  max="720"
                  placeholder="0"
                  class="w-full px-3.5 py-3 rounded-xl text-base bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
              </div>
            </div>

            <button
              type="button"
              :disabled="loading || !canSubmit"
              class="mt-5 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
              @click="onConfirm"
            >
              <font-awesome-icon
                :icon="loading ? 'fa-solid fa-spinner' : 'fa-solid fa-clock'"
                :class="loading ? 'animate-spin' : ''"
              />
              Limit berish
            </button>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  name: string
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  confirm: [payload: { days: number; hours: number }]
}>()

const daysText = ref('')
const hoursText = ref('')

watch(
  () => props.modelValue,
  open => {
    if (open) {
      daysText.value = ''
      hoursText.value = ''
    }
  }
)

const parsedDays = computed(() => Math.max(0, Math.floor(Number(daysText.value) || 0)))
const parsedHours = computed(() => Math.max(0, Math.floor(Number(hoursText.value) || 0)))
const canSubmit = computed(() => parsedDays.value > 0 || parsedHours.value > 0)

const close = () => emit('update:modelValue', false)

const onConfirm = () => {
  if (!canSubmit.value) return
  emit('confirm', { days: parsedDays.value, hours: parsedHours.value })
}

useHistoryBackClose(() => props.modelValue, close, { key: 'ztAdminLimit' })
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
