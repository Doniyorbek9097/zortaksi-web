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
                Balansni o'zgartirish
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
              {{ name }}
              <span class="font-black text-sky-500">{{ formattedBalance }} so'm</span>
            </p>

            <div class="mt-4 space-y-1.5">
              <label class="px-1 text-[11px] font-bold text-slate-400">
                Miqdor (+ qo'shish, - ayirish)
              </label>
              <input
                v-model="amountText"
                type="text"
                inputmode="numeric"
                placeholder="Masalan: 50 000 yoki -10 000"
                class="w-full px-3.5 py-3 rounded-xl text-base bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
            </div>

            <div class="mt-5 space-y-2.5">
              <button
                type="button"
                class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-sky-600 dark:text-sky-400 border border-sky-400/50 bg-sky-50/50 dark:bg-sky-950/30 active:scale-[0.98] transition-all"
                @click="$emit('payment')"
              >
                <font-awesome-icon icon="fa-solid fa-wallet" />
                To'lov sahifasida ochish
              </button>

              <button
                type="button"
                :disabled="loading || !parsedAmount"
                class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
                @click="onConfirm"
              >
                <font-awesome-icon
                  :icon="loading ? 'fa-solid fa-spinner' : 'fa-solid fa-wallet'"
                  :class="loading ? 'animate-spin' : ''"
                />
                Tasdiqlash
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
  name: string
  balance: number
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  confirm: [amount: number]
  payment: []
}>()

const amountText = ref('')

watch(
  () => props.modelValue,
  open => {
    if (open) amountText.value = ''
  }
)

const formattedBalance = computed(() => (props.balance ?? 0).toLocaleString('ru-RU'))

const parsedAmount = computed(() => {
  const raw = amountText.value.replace(/\s/g, '').replace(/,/g, '')
  if (!raw || raw === '-' || raw === '+') return null
  const n = Number(raw)
  return Number.isFinite(n) && n !== 0 ? n : null
})

const close = () => emit('update:modelValue', false)

const onConfirm = () => {
  if (parsedAmount.value == null) return
  emit('confirm', parsedAmount.value)
}
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
