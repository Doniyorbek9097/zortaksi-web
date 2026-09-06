<template>
  <header
    class="sticky top-0 shrink-0 z-40"
    :style="{ paddingTop: 'var(--zt-safe-top, 0px)' }"
    :class="support
      ? 'bg-teal-600 dark:bg-teal-800 border-b border-teal-700/40'
      : 'bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50'"
  >
    <div class="mx-auto w-full min-w-0 max-w-2xl px-3 py-1.5 flex items-center gap-2">
      <button
        type="button"
        class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center active:scale-95 transition-all"
        :class="support
          ? 'text-white/90 hover:bg-white/10'
          : 'text-slate-500 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/5'"
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
            ? (online ? 'text-emerald-200' : 'text-teal-100')
            : online ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'"
        >{{ status }}</p>
      </div>

      <button
        v-if="showDriverPage"
        type="button"
        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black shrink-0 active:scale-95 transition-all"
        :class="support
          ? 'text-white bg-white/15 hover:bg-white/25'
          : 'text-violet-600 dark:text-violet-400 bg-violet-500/10'"
        @click="$emit('driver-page')"
      >
        <font-awesome-icon icon="fa-solid fa-car" />
        Haydovchi
      </button>

      <button
        v-if="showClearHistory"
        type="button"
        :disabled="clearing"
        class="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
        :class="support
          ? 'text-white/90 bg-white/10 hover:bg-white/20'
          : 'text-red-500 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15 border border-red-200/50 dark:border-red-900/40'"
        aria-label="Chat tarixini tozalash"
        @click="$emit('clear')"
      >
        <font-awesome-icon
          :icon="clearing ? 'fa-solid fa-spinner' : 'fa-solid fa-trash'"
          :class="{ 'animate-spin': clearing }"
          class="text-[14px]"
        />
      </button>
    </div>

    <slot name="actions" />
  </header>
</template>

<script setup lang="ts">
interface Props {
  name: string
  status?: string
  online?: boolean
  avatar?: string
  userId?: string
  support?: boolean
  /** Admin uchun — haydovchi sahifasiga o'tish */
  showDriverPage?: boolean
  showClearHistory?: boolean
  clearing?: boolean
}

withDefaults(defineProps<Props>(), {
  status: '',
  online: false,
  support: false,
  showDriverPage: false,
  showClearHistory: false,
  clearing: false,
})

defineEmits<{ back: []; clear: []; 'driver-page': [] }>()
</script>
