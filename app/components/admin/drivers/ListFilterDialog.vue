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
            class="w-full md:max-w-sm max-h-[min(88vh,640px)] flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl"
          >
            <div class="shrink-0 flex items-start justify-between gap-3 p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">
                  Filter
                </h3>
                <p class="mt-0.5 text-[12px] font-medium text-slate-400">
                  Faqat «Hammasi» tabida qo'llanadi
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

            <ul class="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-2 space-y-1">
              <li>
                <button
                  type="button"
                  class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors active:scale-[0.99]"
                  :class="!draft
                    ? 'bg-sky-50 dark:bg-sky-950/40 ring-1 ring-sky-400/50'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'"
                  @click="draft = ''"
                >
                  <span
                    class="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-sm"
                    :class="!draft
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'"
                  >
                    <font-awesome-icon icon="fa-solid fa-users" />
                  </span>
                  <span class="text-[13px] font-black text-slate-900 dark:text-white">Barchasi</span>
                </button>
              </li>

              <li v-for="opt in DRIVER_SUB_FILTER_OPTIONS" :key="opt.value">
                <button
                  type="button"
                  class="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors active:scale-[0.99]"
                  :class="draft === opt.value
                    ? 'bg-sky-50 dark:bg-sky-950/40 ring-1 ring-sky-400/50'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'"
                  @click="draft = opt.value"
                >
                  <span
                    class="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-sm"
                    :class="draft === opt.value
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'"
                  >
                    <font-awesome-icon :icon="opt.icon" />
                  </span>
                  <span class="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-snug">
                    {{ opt.label }}
                  </span>
                </button>
              </li>
            </ul>

            <div class="shrink-0 flex items-center gap-3 p-5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                class="flex-1 py-3 rounded-xl text-sm font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 active:scale-[0.98] transition-all"
                @click="close"
              >
                Bekor
              </button>
              <button
                type="button"
                class="flex-[1.4] py-3 rounded-xl text-sm font-black text-white bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all"
                @click="apply"
              >
                Qo'llash
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { DriverSubFilter } from '~/stores/driver.store'
import { DRIVER_SUB_FILTER_OPTIONS } from '~/utils/driverSubFilters'

const props = defineProps<{
  modelValue: boolean
  value: DriverSubFilter
}>()

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  apply: [value: DriverSubFilter]
}>()

const draft = ref<DriverSubFilter>('')

watch(
  () => props.modelValue,
  (open) => {
    if (open) draft.value = props.value
  },
)

const close = () => emit('update:modelValue', false)

const apply = () => {
  emit('apply', draft.value)
  close()
}
</script>
