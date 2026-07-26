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
            class="w-full md:max-w-sm max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 md:p-6"
          >
            <div class="flex items-start justify-between gap-3">
              <h3 class="text-lg font-black text-slate-900 dark:text-white">
                Tarif faollashtirish
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
              🧐 Balans:
              <span class="font-black text-sky-500">{{ formattedBalance }} so'm</span>
            </p>

            <div class="mt-4 space-y-2">
              <button
                v-for="t in tariffs"
                :key="t.id"
                type="button"
                class="w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-colors"
                :class="selectedId === t.id
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'"
                @click="selectedId = t.id"
              >
                <span
                  class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                  :class="selectedId === t.id
                    ? 'border-violet-500'
                    : 'border-slate-300 dark:border-slate-600'"
                >
                  <span
                    v-if="selectedId === t.id"
                    class="w-2.5 h-2.5 rounded-full bg-violet-500"
                  />
                </span>
                <span class="flex-1 min-w-0">
                  <span class="block text-sm font-black text-slate-900 dark:text-white">
                    {{ t.name }}
                  </span>
                  <span class="text-[11px] font-medium text-slate-400">
                    {{ t.info || `${t.expireDays} kun` }}
                    <template v-if="t.info"> · {{ t.expireDays }} kun</template>
                  </span>
                </span>
                <span class="text-sm font-black text-sky-500 shrink-0">
                  {{ t.price.toLocaleString('ru-RU') }}
                </span>
              </button>

              <p v-if="!tariffs.length" class="py-4 text-center text-[12px] text-slate-400">
                Avval tarif yarating
              </p>
            </div>

            <label class="mt-4 flex items-start gap-3 cursor-pointer select-none">
              <input
                v-model="deduct"
                type="checkbox"
                class="mt-1 w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              >
              <span>
                <span class="block text-sm font-black text-slate-900 dark:text-white">
                  Balansdan narxini yechish
                </span>
                <span class="text-[11px] font-medium text-slate-400">
                  Yetarli bo'lmasa ham minusga tushadi
                </span>
              </span>
            </label>

            <button
              type="button"
              :disabled="loading || !selectedId"
              class="mt-5 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
              @click="onConfirm"
            >
              <font-awesome-icon
                :icon="loading ? 'fa-solid fa-spinner' : 'fa-solid fa-key'"
                :class="loading ? 'animate-spin' : ''"
              />
              Faollashtirish
            </button>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { TariffRow } from '~/stores/tariff.store'

const props = defineProps<{
  modelValue: boolean
  balance: number
  tariffs: TariffRow[]
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  confirm: [payload: { tariffId: string; deductFromBalance: boolean }]
}>()

const selectedId = ref<string | null>(null)
const deduct = ref(true)

watch(
  () => props.modelValue,
  open => {
    if (open) {
      selectedId.value = props.tariffs[0]?.id ?? null
      deduct.value = true
    }
  }
)

const formattedBalance = computed(() => (props.balance ?? 0).toLocaleString('ru-RU'))

const close = () => emit('update:modelValue', false)

const onConfirm = () => {
  if (!selectedId.value) return
  emit('confirm', {
    tariffId: selectedId.value,
    deductFromBalance: deduct.value,
  })
}

useHistoryBackClose(() => props.modelValue, close, { key: 'ztAdminTariff' })
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
