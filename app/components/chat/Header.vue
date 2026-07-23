<template>
  <header class="shrink-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-[env(safe-area-inset-top)]">
    <div class="mx-auto w-full max-w-2xl px-3 py-1.5 flex items-center gap-2">
      <button
        type="button"
        class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
        aria-label="Orqaga"
        @click="$emit('back')"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" />
      </button>

      <ProfileAvatar :name="name" :src="avatar" :user-id="userId" size="sm" />

      <div class="flex-1 min-w-0 leading-none">
        <p class="text-[13px] font-black text-slate-900 dark:text-white truncate">{{ name }}</p>
        <p
          class="text-[10px] font-medium truncate mt-0.5"
          :class="online ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'"
        >{{ status }}</p>
      </div>

      <button
        v-if="canCall"
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
}

withDefaults(defineProps<Props>(), {
  status: '',
  online: false,
  canCall: false,
})

defineEmits<{ back: []; call: [] }>()
</script>
