<template>
  <header class="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
    <div class="mx-auto w-full max-w-2xl px-3 py-2 flex items-center gap-2.5">
      <button
        type="button"
        class="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
        aria-label="Orqaga"
        @click="$emit('back')"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" />
      </button>

      <ProfileAvatar :name="name" :src="avatar" :user-id="userId" size="sm" />

      <div class="flex-1 min-w-0 leading-tight">
        <p class="text-sm font-black text-slate-900 dark:text-white truncate">{{ name }}</p>
        <p
          class="text-[11px] font-medium truncate"
          :class="online ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'"
        >{{ status }}</p>
      </div>

      <button
        v-if="canCall"
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 active:scale-95 transition-all shrink-0"
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
