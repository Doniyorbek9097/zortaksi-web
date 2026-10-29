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
                  Hudud va tarif barcha tablarda; holat — faqat «Hammasi»da
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

            <div class="shrink-0 px-5 py-3 space-y-3 border-b border-slate-100 dark:border-slate-800">
              <label class="block space-y-1.5">
                <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">Hudud</span>
                <select
                  v-model="draftRegionSlug"
                  class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 text-[13px] font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-400/40"
                  :disabled="regionsLoading"
                >
                  <option value="">Barcha hududlar</option>
                  <option v-for="r in regions" :key="r.slug" :value="r.slug">
                    {{ r.title }}
                  </option>
                </select>
              </label>

              <label class="block space-y-1.5">
                <span class="text-[11px] font-black uppercase tracking-wide text-slate-400">Tarif</span>
                <select
                  v-model="draftTariffSlug"
                  class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2.5 text-[13px] font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-400/40"
                >
                  <option value="">Barcha tariflar</option>
                  <option v-for="t in tariffs" :key="t.slug" :value="t.slug">
                    {{ t.name }}
                  </option>
                </select>
              </label>
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
                  <span class="text-[13px] font-black text-slate-900 dark:text-white">Holat: barchasi</span>
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
import type { TariffRow } from '~/stores/tariff.store'
import { DRIVER_SUB_FILTER_OPTIONS } from '~/utils/driverSubFilters'

type RegionRow = { slug: string; title: string }

export type DriverListFilterApply = {
  subFilter: DriverSubFilter
  tariffSlug: string
  regionSlug: string
}

const props = defineProps<{
  modelValue: boolean
  value: DriverSubFilter
  tariffSlug: string
  regionSlug: string
  tariffs: TariffRow[]
}>()

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  apply: [value: DriverListFilterApply]
}>()

const draft = ref<DriverSubFilter>('')
const draftTariffSlug = ref('')
const draftRegionSlug = ref('')
const regions = ref<RegionRow[]>([])
const regionsLoading = ref(false)

const loadRegions = async () => {
  if (regions.value.length) return
  regionsLoading.value = true
  try {
    const res = await useApi('/bot-regions')
    regions.value = res?.data?.regions ?? []
  } catch {
    regions.value = []
  } finally {
    regionsLoading.value = false
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    draft.value = props.value
    draftTariffSlug.value = props.tariffSlug
    draftRegionSlug.value = props.regionSlug
    void loadRegions()
  },
)

const close = () => emit('update:modelValue', false)

const apply = () => {
  emit('apply', {
    subFilter: draft.value,
    tariffSlug: draftTariffSlug.value.trim(),
    regionSlug: draftRegionSlug.value.trim(),
  })
  close()
}
</script>
