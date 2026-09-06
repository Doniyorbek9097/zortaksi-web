<template>
  <article
    class="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
  >
    <div class="relative aspect-[3/1] bg-slate-100 dark:bg-slate-800">
      <img :src="imageSrc" :alt="name" class="w-full h-full object-cover">
      <div class="absolute inset-x-0 bottom-0 px-3 py-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
        <p class="text-[13px] font-black text-white truncate">{{ name }}</p>
      </div>
      <div class="absolute top-2 right-2 flex items-center gap-1.5">
        <span
          class="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide backdrop-blur-sm"
          :class="active
            ? 'bg-emerald-500/90 text-white'
            : 'bg-slate-800/70 text-slate-200'"
        >
          {{ active ? 'Faol' : 'Yashirin' }}
        </span>
        <span
          class="px-2 py-0.5 rounded-md text-[9px] font-black tabular-nums bg-violet-500/90 text-white backdrop-blur-sm"
        >
          #{{ sortOrder }}
        </span>
      </div>
    </div>

    <div class="p-3 flex items-center justify-between gap-3">
      <div class="min-w-0 flex-1">
        <div v-if="targetUrl" class="flex items-center gap-1.5 min-w-0">
          <font-awesome-icon icon="fa-solid fa-link" class="text-[10px] text-sky-500 shrink-0" />
          <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
            {{ targetUrl }}
          </p>
        </div>
        <p v-else class="text-[11px] font-semibold text-slate-400 italic">
          Havola yo'q
        </p>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-[11px] font-black border transition-all active:scale-95 bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/60"
          @click="$emit('edit')"
        >
          <font-awesome-icon icon="fa-solid fa-pen-to-square" class="text-[10px]" />
          Tahrir
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center w-9 h-9 rounded-xl border transition-all active:scale-95 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/60"
          @click="$emit('delete')"
        >
          <font-awesome-icon icon="fa-solid fa-trash" class="text-[10px]" />
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  targetUrl?: string
  imageSrc: string
  sortOrder: number
  active: boolean
}>()

defineEmits<{ edit: []; delete: [] }>()
</script>
