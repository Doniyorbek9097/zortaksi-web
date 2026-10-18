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
            class="w-full md:max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 max-h-[90vh] overflow-y-auto"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">
                  {{ isEdit ? 'Xabarni tahrirlash' : 'Xabar yuborish' }}
                </h3>
                <p class="text-[12px] font-medium text-slate-400 mt-0.5">
                  {{ count }} ta guruhga
                  <span v-if="cost && cost > 0" class="text-amber-500">
                    · {{ cost.toLocaleString('ru-RU') }} so'm
                  </span>
                </p>
              </div>
              <button
                type="button"
                class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400"
                @click="close"
              >
                <font-awesome-icon icon="fa-solid fa-times" />
              </button>
            </div>

            <div class="mt-4 space-y-1">
              <label class="px-1 text-[11px] font-semibold text-slate-500">Xabar nomi</label>
              <input
                v-model="name"
                type="text"
                maxlength="80"
                placeholder="Masalan: Toshkent-Namangan"
                class="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
            </div>

            <CommonTelegramHtmlEditor
              v-model="text"
              class="mt-3"
              label="E'lon matni"
              toolbar="static"
              :rows="5"
              hide-hint
              placeholder="E'lon matnini yozing…"
            />

            <div class="mt-4 space-y-1">
              <label class="px-1 text-[11px] font-semibold text-slate-500">
                Har necha daqiqada qayta yuborilsin
              </label>
              <input
                v-model.number="intervalMin"
                type="number"
                :min="MIN_POST_INTERVAL_MIN"
                :max="MAX_POST_INTERVAL_MIN"
                class="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
              <p class="px-1 text-[10px] font-semibold text-slate-400 leading-snug">
                Birinchi yuborish darhol. Keyin har {{ intervalMin }} daqiqada barcha tanlangan guruhlarga yuboriladi. 12 soatdan keyin avtomatik to'xtaydi.
              </p>
            </div>

            <div class="mt-4">
              <button
                type="button"
                :disabled="loading || !text.trim() || !name.trim() || intervalMin < MIN_POST_INTERVAL_MIN"
                class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black border active:scale-[0.98] transition-all disabled:opacity-50 bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600"
                @click="onSave"
              >
                <font-awesome-icon
                  :icon="loading ? 'fa-solid fa-spinner' : 'fa-solid fa-play'"
                  :class="loading ? 'animate-spin' : ''"
                />
                {{ isEdit ? 'Saqlash' : 'Saqlash va boshlash' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { PostCampaign } from '~/stores/post.store'
import {
  DEFAULT_POST_INTERVAL_MIN,
  MAX_POST_INTERVAL_MIN,
  MIN_POST_INTERVAL_MIN,
} from '~/stores/post.store'

const props = defineProps<{
  modelValue: boolean
  count: number
  cost?: number
  loading?: boolean
  editCampaign?: PostCampaign | null
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  save: [payload: { name: string; text: string; autoRepeat: boolean; intervalMin: number }]
}>()

const name = ref('')
const text = ref('')
const intervalMin = ref(DEFAULT_POST_INTERVAL_MIN)

const isEdit = computed(() => !!props.editCampaign?.id)

watch(
  () => [props.modelValue, props.editCampaign] as const,
  ([open, edit]) => {
    if (!open) return
    if (edit) {
      name.value = edit.name || ''
      text.value = edit.text || ''
      intervalMin.value = Math.max(
        MIN_POST_INTERVAL_MIN,
        edit.intervalMin || edit.postsAfterThreshold || DEFAULT_POST_INTERVAL_MIN,
      )
    } else {
      name.value = ''
      text.value = ''
      intervalMin.value = DEFAULT_POST_INTERVAL_MIN
    }
  }
)

const close = () => emit('update:modelValue', false)

const onSave = () => {
  if (!text.value.trim() || !name.value.trim()) return
  if (intervalMin.value < MIN_POST_INTERVAL_MIN) return
  const mins = Math.max(
    MIN_POST_INTERVAL_MIN,
    Math.min(MAX_POST_INTERVAL_MIN, Math.round(intervalMin.value || DEFAULT_POST_INTERVAL_MIN)),
  )
  emit('save', {
    name: name.value.trim(),
    text: text.value.trim(),
    autoRepeat: true,
    intervalMin: mins,
  })
}

useHistoryBackClose(() => props.modelValue, close, { key: 'ztCompose' })
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
</style>
