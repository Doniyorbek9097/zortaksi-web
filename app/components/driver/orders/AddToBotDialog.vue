<template>
  <Teleport to="body">
    <Transition name="cd-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-end justify-center md:items-center bg-black/40 dark:bg-black/70 backdrop-blur-sm"
        @click.self="$emit('cancel')"
      >
        <Transition name="cd-sheet" appear>
          <div
            v-if="modelValue"
            class="w-full md:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 md:p-6 max-h-[85vh] flex flex-col"
          >
            <div class="flex items-start justify-between gap-3 shrink-0">
              <div>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">Botga qo'shish</h3>
                <p class="mt-0.5 text-[12px] font-medium text-slate-400 dark:text-slate-500">
                  Hudud kalit so'zlariga guruh username
                </p>
              </div>
              <button
                type="button"
                class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Yopish"
                @click="$emit('cancel')"
              >
                <font-awesome-icon icon="fa-solid fa-times" />
              </button>
            </div>

            <p class="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {{ message }}
            </p>

            <div v-if="!sourceUsername" class="mt-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 px-3 py-2.5 text-[13px] font-semibold text-amber-700 dark:text-amber-300">
              Guruhda @username yo'q — faqat username bo'lgan guruhlar qo'shiladi.
            </div>

            <div v-else-if="loading" class="mt-5 flex justify-center py-8">
              <font-awesome-icon icon="fa-solid fa-spinner" class="animate-spin text-2xl text-indigo-500" />
            </div>

            <div v-else-if="!groups.length" class="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-3 py-4 text-center text-[13px] font-semibold text-slate-500">
              Faol bot guruh topilmadi. Admin paneldan bot qo'shing.
            </div>

            <ul v-else class="mt-4 space-y-2 overflow-y-auto min-h-0 flex-1 -mx-1 px-1">
              <li v-for="g in groups" :key="g.id">
                <button
                  type="button"
                  class="w-full text-left rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 px-3.5 py-3 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/30 active:scale-[0.99] transition-all disabled:opacity-50"
                  :disabled="saving || !sourceUsername"
                  @click="$emit('select', g)"
                >
                  <p class="text-[14px] font-black text-indigo-600 dark:text-indigo-400 truncate">
                    @{{ g.username }}
                  </p>
                  <p v-if="g.title" class="text-[12px] font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {{ g.title }}
                  </p>
                  <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 line-clamp-2">
                    {{ (g.keywords || []).join(', ') || 'Kalit so\'z yo\'q' }}
                  </p>
                </button>
              </li>
            </ul>

            <button
              type="button"
              class="mt-4 w-full py-3 rounded-xl text-sm font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] transition-all shrink-0"
              @click="$emit('cancel')"
            >
              Bekor
            </button>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { BotGroupRow } from '~/stores/bot-group.store'

defineProps<{
  modelValue: boolean
  message: string
  sourceUsername?: string
  groups: BotGroupRow[]
  loading?: boolean
  saving?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
  select: [group: BotGroupRow]
  cancel: []
}>()
</script>

<style scoped>
.cd-fade-enter-active,
.cd-fade-leave-active {
  transition: opacity 0.2s ease;
}
.cd-fade-enter-from,
.cd-fade-leave-to {
  opacity: 0;
}
.cd-sheet-enter-active,
.cd-sheet-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.cd-sheet-enter-from,
.cd-sheet-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
@media (min-width: 768px) {
  .cd-sheet-enter-from,
  .cd-sheet-leave-to {
    transform: translateY(12px) scale(0.98);
  }
}
</style>
