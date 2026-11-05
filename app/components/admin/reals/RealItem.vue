<template>
  <article
    class="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
  >
    <div class="relative aspect-[9/16] max-h-72 bg-black">
      <video :src="videoSrc" class="w-full h-full object-contain" muted playsinline />
      <div class="absolute top-2 right-2 flex gap-1">
        <span
          class="px-2 py-0.5 rounded-md text-[9px] font-black uppercase"
          :class="active ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200'"
        >
          {{ active ? 'Faol' : 'Yashirin' }}
        </span>
        <span class="px-2 py-0.5 rounded-md text-[9px] font-black bg-violet-500 text-white">#{{ sortOrder }}</span>
      </div>
    </div>
    <div class="p-3 space-y-2">
      <p class="text-[14px] font-black text-slate-900 dark:text-white truncate">
        {{ title || 'Real' }}
      </p>
      <p v-if="ctaLabel" class="text-[11px] font-bold text-violet-600 dark:text-violet-400 truncate">
        {{ ctaLabel }}
      </p>
      <p v-if="productPrice" class="text-[12px] font-bold text-amber-600 dark:text-amber-400 truncate">
        {{ productPrice }}
      </p>
      <p v-if="productUrl" class="text-[11px] text-sky-600 dark:text-sky-400 truncate">{{ productUrl }}</p>
      <div class="flex items-center gap-3 text-[11px] font-bold text-slate-500">
        <span class="text-emerald-600"><font-awesome-icon icon="fa-solid fa-thumbs-up" /> {{ likesCount }}</span>
        <span class="text-rose-600"><font-awesome-icon icon="fa-solid fa-thumbs-down" /> {{ dislikesCount }}</span>
      </div>
      <div class="flex gap-2 pt-1">
        <button
          type="button"
          class="flex-1 py-2 rounded-xl text-[11px] font-black bg-amber-50 text-amber-700 border border-amber-200"
          @click="$emit('edit')"
        >
          Tahrir
        </button>
        <button
          type="button"
          class="w-10 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200"
          @click="$emit('delete')"
        >
          <font-awesome-icon icon="fa-solid fa-trash" />
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  ctaLabel?: string
  productPrice?: string
  productUrl?: string
  videoSrc: string
  sortOrder: number
  active: boolean
  likesCount: number
  dislikesCount: number
}>()

defineEmits<{ edit: []; delete: [] }>()
</script>
