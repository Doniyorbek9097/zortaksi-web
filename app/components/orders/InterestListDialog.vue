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
                  {{ count }} kishi · bosib chat oching
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
                  <button
                    type="button"
                    class="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/80 active:scale-[0.99] transition-all disabled:opacity-50"
                    :disabled="openingId === u.userId || isSelf(u)"
                    @click="onSelect(u)"
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
                      <p v-if="u.username" class="text-[11px] font-medium text-slate-400 truncate">
                        @{{ u.username }}
                      </p>
                    </div>
                    <font-awesome-icon
                      v-if="openingId === u.userId"
                      icon="fa-solid fa-spinner"
                      class="text-sky-500 animate-spin shrink-0"
                    />
                    <font-awesome-icon
                      v-else-if="!isSelf(u)"
                      icon="fa-solid fa-comments"
                      class="text-slate-300 dark:text-slate-600 shrink-0"
                    />
                  </button>
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
  select: [user: IInterestedUser]
}>()

const openingId = ref<string | null>(null)
const error = ref('')

const close = () => {
  modelValue.value = false
  error.value = ''
  openingId.value = null
}

useHistoryBackClose(modelValue, close, { key: 'ztInterestList' })

const displayName = (u: IInterestedUser) => {
  if (u.name) return u.name
  const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
  return full || u.username || 'Haydovchi'
}

const isSelf = (u: IInterestedUser) =>
  !!props.currentUserId && String(u.userId) === String(props.currentUserId)

const onSelect = (u: IInterestedUser) => {
  if (isSelf(u) || openingId.value) return
  error.value = ''
  openingId.value = u.userId
  emit('select', u)
}

/** Parent navigatsiya tugagach / xato bo'lganda chaqiriladi */
const resetOpening = (errMsg?: string) => {
  openingId.value = null
  if (errMsg) error.value = errMsg
}

defineExpose({ resetOpening, close })
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
