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

            <textarea
              v-model="text"
              rows="5"
              placeholder="E'lon matnini yozing…"
              class="mt-3 w-full px-3.5 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />

            <label class="mt-4 flex items-center gap-2.5 cursor-pointer select-none">
              <input
                v-model="autoRepeat"
                type="checkbox"
                class="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              >
              <span class="text-[12px] font-bold text-slate-700 dark:text-slate-200">
                Avtomatik yuborish (Boshlash/To'xtatish)
              </span>
            </label>

            <div v-if="autoRepeat" class="mt-2 space-y-1">
              <label class="px-1 text-[11px] font-semibold text-slate-500">
                Har necha daqiqada bir marta
              </label>
              <input
                v-model.number="intervalMin"
                type="number"
                min="1"
                max="1440"
                class="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
            </div>

            <div class="mt-4 flex flex-col gap-2">
              <button
                v-if="!isEdit"
                type="button"
                :disabled="loading || !text.trim()"
                class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
                @click="onOnce"
              >
                <font-awesome-icon
                  :icon="loading ? 'fa-solid fa-spinner' : 'fa-solid fa-paper-plane'"
                  :class="loading ? 'animate-spin' : ''"
                />
                Bir marta yuborish
              </button>

              <button
                type="button"
                :disabled="loading || !text.trim() || !name.trim() || (autoRepeat && intervalMin < 1)"
                class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black border active:scale-[0.98] transition-all disabled:opacity-50"
                :class="autoRepeat
                  ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'"
                @click="onSave(autoRepeat)"
              >
                <font-awesome-icon
                  :icon="loading ? 'fa-solid fa-spinner' : (autoRepeat ? 'fa-solid fa-play' : 'fa-solid fa-floppy-disk')"
                  :class="loading ? 'animate-spin' : ''"
                />
                {{ autoRepeat ? 'Saqlash va boshlash' : 'Saqlash' }}
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

const props = defineProps<{
  modelValue: boolean
  count: number
  cost?: number
  loading?: boolean
  editCampaign?: PostCampaign | null
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  once: [text: string]
  save: [payload: { name: string; text: string; autoRepeat: boolean; intervalMin: number }]
}>()

const name = ref('')
const text = ref('')
const autoRepeat = ref(false)
const intervalMin = ref(5)

const isEdit = computed(() => !!props.editCampaign?.id)

watch(
  () => [props.modelValue, props.editCampaign] as const,
  ([open, edit]) => {
    if (!open) return
    if (edit) {
      name.value = edit.name || ''
      text.value = edit.text || ''
      autoRepeat.value = !!edit.active
      intervalMin.value = edit.intervalMin || 5
    } else {
      name.value = ''
      text.value = ''
      autoRepeat.value = false
      intervalMin.value = 5
    }
  }
)

const close = () => emit('update:modelValue', false)

const onOnce = () => {
  if (!text.value.trim()) return
  emit('once', text.value.trim())
}

const onSave = (start: boolean) => {
  if (!text.value.trim() || !name.value.trim()) return
  if (start && intervalMin.value < 1) return
  emit('save', {
    name: name.value.trim(),
    text: text.value.trim(),
    autoRepeat: start,
    intervalMin: Math.max(1, Math.round(intervalMin.value || 5)),
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
