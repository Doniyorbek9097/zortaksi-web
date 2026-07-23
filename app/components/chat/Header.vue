<template>
  <header
    class="shrink-0 z-30 pt-[env(safe-area-inset-top)]"
    :class="support
      ? 'bg-teal-600 dark:bg-teal-800 border-b border-teal-700/40'
      : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800'"
  >
    <div class="mx-auto w-full max-w-2xl px-3 py-1.5 flex items-center gap-2">
      <button
        type="button"
        class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center active:scale-95 transition-all"
        :class="support
          ? 'text-white/90 hover:bg-white/10'
          : 'text-slate-500 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'"
        aria-label="Orqaga"
        @click="$emit('back')"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" />
      </button>

      <div
        v-if="support"
        class="w-9 h-9 shrink-0 rounded-xl bg-white/15 flex items-center justify-center text-white"
      >
        <font-awesome-icon icon="fa-solid fa-headset" />
      </div>
      <ProfileAvatar v-else :name="name" :src="avatar" :user-id="userId" size="sm" />

      <div class="flex-1 min-w-0 leading-none">
        <p
          class="text-[13px] font-black truncate"
          :class="support ? 'text-white' : 'text-slate-900 dark:text-white'"
        >{{ name }}</p>
        <p
          class="text-[10px] font-medium truncate mt-0.5"
          :class="support
            ? 'text-teal-100'
            : online ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'"
        >{{ support ? (status || 'To\'lov va yordam') : status }}</p>
      </div>

      <span
        v-if="support"
        class="shrink-0 px-2 py-1 rounded-md bg-white/15 text-white text-[10px] font-black uppercase tracking-wide"
      >
        Yordam
      </span>

      <button
        v-else-if="canCall"
        type="button"
        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 active:scale-95 transition-all shrink-0"
        @click="$emit('call')"
      >
        <font-awesome-icon icon="fa-solid fa-phone" />
        Qo'ng'iroq
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  name: string
  status?: string
  online?: boolean
  avatar?: string
  userId?: string
  canCall?: boolean
  support?: boolean
}

withDefaults(defineProps<Props>(), {
  status: '',
  online: false,
  canCall: false,
  support: false,
})

defineEmits<{ back: []; call: [] }>()
</script>
