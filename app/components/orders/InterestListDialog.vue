<template>
  <Teleport to="body">
    <Transition name="il-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-end justify-center md:items-center bg-black/40 dark:bg-black/70 backdrop-blur-sm"
        @click.self="close"
      >
        <Transition name="il-sheet" appear>
          <div
            v-if="modelValue"
            class="w-full md:max-w-sm max-h-[70vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            data-no-swipe
            @pointerdown.stop
          >
            <div class="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div class="min-w-0">
                <h3 class="text-lg font-black text-slate-900 dark:text-white">Mijozga bog'lanishdi</h3>
                <p class="mt-0.5 text-[12px] font-medium text-slate-400 dark:text-slate-500">
                  {{ count }} kishi · kartaga bosib yozish · ko'z — suhbatni ko'rish
                </p>
              </div>
              <button
                type="button"
                class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Yopish"
                @click="close"
              >
                <font-awesome-icon icon="fa-solid fa-times" />
              </button>
            </div>

            <div class="flex-1 overflow-y-auto overscroll-contain px-3 py-2">
              <div v-if="loading" class="space-y-2 py-2">
                <div v-for="n in 3" :key="n" class="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              </div>

              <div
                v-else-if="!users.length"
                class="py-10 text-center text-[13px] font-bold text-slate-400"
              >
                Hali hech kim bog'lanmagan
              </div>

              <ul v-else class="space-y-1">
                <li v-for="(u, idx) in users" :key="u.userId">
                  <div
                    class="flex items-center gap-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <button
                      type="button"
                      class="flex-1 min-w-0 flex items-center gap-3 px-2.5 py-2.5 text-left active:scale-[0.99] transition-all disabled:opacity-50"
                      :disabled="!!opening"
                      @click="onChat(u)"
                    >
                      <span class="w-5 text-[11px] font-bold text-slate-400 shrink-0 tabular-nums">
                        {{ idx + 1 }}
                      </span>
                      <ProfileAvatar
                        :name="displayName(u)"
                        :src="u.avatar"
                        :user-id="u.userId"
                        size="sm"
                      />
                      <div class="min-w-0 flex-1">
                        <p class="text-sm font-black text-slate-900 dark:text-white truncate">
                          {{ displayName(u) }}
                          <span v-if="isSelf(u)" class="text-[11px] font-bold text-slate-400">(siz)</span>
                        </p>
                        <p class="text-[11px] font-medium text-slate-400 truncate">
                          {{ isSelf(u) ? 'Mijozga yozish' : 'Haydovchiga yozish' }}
                        </p>
                      </div>
                      <font-awesome-icon
                        v-if="opening?.userId === u.userId && opening.mode === 'chat'"
                        icon="fa-solid fa-spinner"
                        class="text-sky-500 animate-spin shrink-0"
                      />
                      <font-awesome-icon
                        v-else
                        icon="fa-solid fa-comments"
                        class="text-sky-400/70 dark:text-sky-500/50 shrink-0 text-sm"
                      />
                    </button>

                    <button
                      type="button"
                      class="shrink-0 w-10 h-10 mr-1.5 rounded-xl flex items-center justify-center text-sky-600 dark:text-sky-400 bg-sky-500/10 hover:bg-sky-500/15 active:scale-95 transition-all disabled:opacity-50"
                      :disabled="!!opening"
                      aria-label="Suhbatni ko'rish"
                      :title="`Suhbatni ko'rish — ${displayName(u)}`"
                      @click="onView(u)"
                    >
                      <font-awesome-icon
                        v-if="opening?.userId === u.userId && opening.mode === 'view'"
                        icon="fa-solid fa-spinner"
                        class="animate-spin text-sm"
                      />
                      <font-awesome-icon
                        v-else
                        icon="fa-solid fa-eye"
                        class="text-sm"
                      />
                    </button>
                  </div>
                </li>
              </ul>

              <p v-if="error" class="px-2 py-2 text-center text-[12px] font-bold text-red-500">
                {{ error }}
              </p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { IInterestedUser } from '~/types'

const modelValue = defineModel<boolean>({ default: false })

const props = withDefaults(
  defineProps<{
    users?: IInterestedUser[]
    count?: number
    loading?: boolean
    currentUserId?: string
  }>(),
  {
    users: () => [],
    count: 0,
    loading: false,
    currentUserId: '',
  },
)

const emit = defineEmits<{
  chat: [user: IInterestedUser]
  view: [user: IInterestedUser]
}>()

const opening = ref<{ userId: string; mode: 'chat' | 'view' } | null>(null)
const error = ref('')

const close = () => {
  modelValue.value = false
  error.value = ''
  opening.value = null
}

const { disarm } = useHistoryBackClose(modelValue, close, { key: 'ztInterestList' })

const displayName = (u: IInterestedUser) => {
  if (u.name) return u.name
  const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
  return full || u.username || 'Haydovchi'
}

const isSelf = (u: IInterestedUser) =>
  !!props.currentUserId && String(u.userId) === String(props.currentUserId)

const onChat = (u: IInterestedUser) => {
  if (opening.value) return
  error.value = ''
  opening.value = { userId: u.userId, mode: 'chat' }
  emit('chat', u)
}

const onView = (u: IInterestedUser) => {
  if (opening.value) return
  error.value = ''
  opening.value = { userId: u.userId, mode: 'view' }
  emit('view', u)
}

/** Parent navigatsiya tugagach / xato bo'lganda chaqiriladi */
const resetOpening = (errMsg?: string) => {
  opening.value = null
  if (errMsg) error.value = errMsg
}

/** navigateTo oldidan — history.back race bo'lmasin */
const closeForNavigate = () => {
  disarm()
  modelValue.value = false
  error.value = ''
  opening.value = null
}

defineExpose({ resetOpening, close, closeForNavigate })
</script>

<style scoped>
.il-fade-enter-active,
.il-fade-leave-active {
  transition: opacity 0.2s ease;
}
.il-fade-enter-from,
.il-fade-leave-to {
  opacity: 0;
}

.il-sheet-enter-active {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease;
}
.il-sheet-leave-active {
  transition: transform 0.2s ease, opacity 0.15s ease;
}
.il-sheet-enter-from,
.il-sheet-leave-to {
  opacity: 0;
  transform: translateY(24px);
}
@media (min-width: 768px) {
  .il-sheet-enter-from,
  .il-sheet-leave-to {
    transform: scale(0.96);
  }
}
</style>
