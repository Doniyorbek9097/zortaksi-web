<template>
  <Teleport to="body">
    <Transition name="fp-fade">
      <div
        v-if="open"
        class="fixed inset-0 flex items-end justify-center md:items-center bg-black/40 dark:bg-black/70 backdrop-blur-sm p-0 md:p-4"
        :class="mandatory ? 'z-[10000]' : 'z-[9998]'"
        @click.self="onBackdropClick"
      >
        <Transition name="fp-sheet" appear>
          <div
            v-if="open"
            class="w-full md:max-w-md max-h-[min(85vh,720px)] flex flex-col rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
            @click.stop
          >
            <div class="shrink-0 p-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-2 px-0.5">
                <span class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 inline-flex items-center justify-center shrink-0">
                  <font-awesome-icon icon="fa-solid fa-location-dot" />
                </span>
                <div class="min-w-0 flex-1 leading-none">
                  <p class="text-sm font-black text-slate-900 dark:text-white">
                    {{ mandatory ? 'Yo\'nalish tanlang' : 'Hudud belgilash' }}
                  </p>
                  <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                    {{ mandatory
                      ? 'Davom etish uchun qaysi yo\'nalish buyurtmalarini ko\'rmoqchiligingizni belgilang'
                      : 'Qaysi shahar/tuman buyurtmalarini ko‘rmoqchisiz?' }}
                  </p>
                </div>
                <button
                  v-if="!mandatory"
                  type="button"
                  class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
                  aria-label="Yopish"
                  @click="onCancel"
                >
                  <font-awesome-icon icon="fa-solid fa-times" />
                </button>
              </div>
            </div>

            <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-2.5 space-y-2.5">
              <textarea
                v-model="keywords"
                rows="3"
                placeholder="Masalan: Namangan, Chortoq, Andijon&#10;Bir nechta hududni vergul bilan yozing"
                class="w-full max-h-32 min-h-[96px] px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-sm leading-relaxed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none overflow-y-auto whitespace-pre-wrap break-words"
              />

              <div v-if="presetsLoading" class="flex justify-center py-3">
                <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin text-indigo-500" />
              </div>

              <div v-else-if="presets.length" class="space-y-2">
                <p class="px-0.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Yo'nalish tanlang
                </p>
                <ul class="max-h-[min(36vh,280px)] overflow-y-auto overscroll-contain flex flex-col gap-2 pr-0.5">
                  <li v-for="preset in presets" :key="preset.id">
                    <button
                      type="button"
                      class="w-full inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-left text-[12px] font-bold transition-all active:scale-[0.98]"
                      :class="selectedPresetId === preset.id
                        ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-600'"
                      @click="onPresetClick(preset)"
                    >
                      <font-awesome-icon
                        icon="fa-solid fa-bullhorn"
                        class="text-[10px] shrink-0 opacity-70"
                      />
                      <span class="truncate">{{ preset.title }}</span>
                      <span
                        v-if="preset.keywords?.length"
                        class="ml-auto shrink-0 text-[10px] font-semibold opacity-60"
                      >
                        {{ preset.keywords.length }}
                      </span>
                    </button>
                  </li>
                </ul>
              </div>

              <button
                v-if="!presetsLoading"
                type="button"
                class="w-full inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl border text-[12px] font-black transition-all active:scale-[0.98]"
                :class="allRegionsSelected
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:border-emerald-400 dark:hover:border-emerald-600'"
                @click="onSelectAllRegions"
              >
                <font-awesome-icon icon="fa-solid fa-globe" class="text-[11px]" />
                Barcha joylar
              </button>

              <p v-if="saveError" class="px-0.5 text-[11px] font-bold text-red-500">
                {{ saveError }}
              </p>

              <p class="px-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-snug">
                «Barcha joylar» — hudud filtri yo'q, barcha buyurtmalar ko'rinadi. Yoki alohida yo'nalish tanlang.
              </p>
            </div>

            <div
              class="shrink-0 flex items-center gap-2 p-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
              :style="{ paddingBottom: 'calc(1rem + var(--zt-safe-bottom, 0px))' }"
            >
              <button
                v-if="!mandatory"
                type="button"
                class="flex-1 py-3 rounded-xl text-sm font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
                @click="onCancel"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                class="py-3 rounded-xl text-sm font-black text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
                :class="mandatory ? 'flex-1' : 'flex-1'"
                @click="onSave"
              >
                <font-awesome-icon icon="fa-solid fa-floppy-disk" />
                {{ mandatory ? 'Davom etish' : 'Saqlash' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { parseKeywords } from '~/utils/orderFilterKeywords'

export type BotGroupFilterPreset = {
  id: string
  username: string
  title: string
  keywords: string[]
}

const props = withDefaults(
  defineProps<{ mandatory?: boolean }>(),
  { mandatory: false },
)

const keywords = defineModel<string>({ default: '' })
const botGroupId = defineModel<string | null>('botGroupId', { default: null })

const emit = defineEmits<{ save: []; cancel: [] }>()

const open = ref(true)
const presets = ref<BotGroupFilterPreset[]>([])
const presetsLoading = ref(false)
const selectedPresetId = ref<string | null>(null)
const saveError = ref('')
/** Barcha joylar — kalit so'zsiz, filtrsiz rejim */
const allRegionsSelected = ref(false)

const loadPresets = async () => {
  presetsLoading.value = true
  try {
    const res = await useApi('/bot-groups/filter-presets')
    if (res.success) {
      presets.value = (res.data?.presets ?? []) as BotGroupFilterPreset[]
      syncSelectedPresetFromKeywords()
    }
  } catch (err) {
    console.error('Filter presets load error:', err)
  } finally {
    presetsLoading.value = false
  }
}

const keywordsFromPreset = (preset: BotGroupFilterPreset) =>
  (preset.keywords || []).map((k) => String(k).trim()).filter(Boolean).join(', ')

const syncSelectedPresetFromKeywords = () => {
  const current = String(keywords.value || '').trim()
  if (!current) {
    selectedPresetId.value = null
    return
  }
  const match = presets.value.find((p) => keywordsFromPreset(p) === current)
  selectedPresetId.value = match?.id ?? null
}

const onPresetClick = (preset: BotGroupFilterPreset) => {
  if (!preset.keywords?.length) return
  saveError.value = ''
  allRegionsSelected.value = false
  keywords.value = keywordsFromPreset(preset)
  selectedPresetId.value = preset.id
  botGroupId.value = preset.id
}

const onSelectAllRegions = () => {
  saveError.value = ''
  allRegionsSelected.value = true
  keywords.value = ''
  selectedPresetId.value = null
  botGroupId.value = null
}

watch(keywords, () => {
  saveError.value = ''
  const current = String(keywords.value || '').trim()
  if (!current) {
    selectedPresetId.value = null
    botGroupId.value = null
    return
  }
  allRegionsSelected.value = false
  if (presets.value.length) syncSelectedPresetFromKeywords()
})

let disarmHistory: (() => void) | undefined

if (!props.mandatory) {
  const { disarm } = useHistoryBackClose(
    open,
    () => {
      open.value = false
      emit('cancel')
    },
    { key: 'ztFilterPanel' },
  )
  disarmHistory = disarm
}

const onCancel = () => {
  if (props.mandatory) return
  disarmHistory?.()
  open.value = false
  emit('cancel')
}

const onBackdropClick = () => {
  if (!props.mandatory) onCancel()
}

const onSave = () => {
  const hasKeywords = parseKeywords(keywords.value).length > 0
  if (props.mandatory && !hasKeywords && !allRegionsSelected.value) {
    saveError.value = 'Yo\'nalish tanlang yoki «Barcha joylar» ni bosing'
    return
  }
  saveError.value = ''
  disarmHistory?.()
  open.value = false
  emit('save')
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
  void loadPresets().then(() => {
    if (botGroupId.value) {
      selectedPresetId.value = botGroupId.value
    }
  })
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.fp-fade-enter-active,
.fp-fade-leave-active {
  transition: opacity 0.2s ease;
}
.fp-fade-enter-from,
.fp-fade-leave-to {
  opacity: 0;
}

.fp-sheet-enter-active,
.fp-sheet-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
}
.fp-sheet-enter-from,
.fp-sheet-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
@media (min-width: 768px) {
  .fp-sheet-enter-from,
  .fp-sheet-leave-to {
    transform: scale(0.94);
    opacity: 0;
  }
}
</style>
