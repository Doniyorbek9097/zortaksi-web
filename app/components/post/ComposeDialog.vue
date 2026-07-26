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
            class="w-full md:max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">Xabar yuborish</h3>
                <p class="text-[12px] font-medium text-slate-400 mt-0.5">
                  {{ count }} ta guruhga
                  <span v-if="cost > 0" class="text-amber-500">
                    · {{ cost.toLocaleString('ru-RU') }} so'm
                  </span>
                  <span v-else class="text-emerald-500">· Bepul</span>
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

            <textarea
              v-model="text"
              rows="6"
              placeholder="E'lon matnini yozing…"
              class="mt-4 w-full px-3.5 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />

            <button
              type="button"
              :disabled="loading || !text.trim()"
              class="mt-4 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
              @click="onSend"
            >
              <font-awesome-icon
                :icon="loading ? 'fa-solid fa-spinner' : 'fa-solid fa-paper-plane'"
                :class="loading ? 'animate-spin' : ''"
              />
              Yuborish
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
  count: number
  cost?: number
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
const onSend = () => {
  if (!text.value.trim()) return
  emit('confirm', text.value.trim())
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
