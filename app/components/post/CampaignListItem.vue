<template>
  <div
    class="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-2"
  >
    <div class="flex items-center justify-between gap-2 min-w-0">
      <h3 class="text-[13px] font-black text-slate-900 dark:text-white truncate min-w-0">
        {{ campaign.name }}
      </h3>
      <p class="shrink-0 text-[9px] font-black text-slate-400 tabular-nums whitespace-nowrap">
        {{ campaign.intervalMin }}d · {{ campaign.groupIds.length }}g
      </p>
    </div>

    <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
      {{ campaign.text }}
    </p>

    <p v-if="campaign.lastError" class="text-[10px] font-bold text-rose-500 mt-0.5 line-clamp-1">
      {{ campaign.lastError }}
    </p>

    <div class="grid grid-cols-3 gap-1 mt-1.5">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-0.5 px-1 py-1.5 rounded-lg text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 active:scale-95 disabled:opacity-50 whitespace-nowrap min-w-0"
        :disabled="busy"
        @click="$emit('start')"
      >
        <font-awesome-icon
          :icon="busy ? 'fa-solid fa-spinner' : 'fa-solid fa-play'"
          :class="busy ? 'animate-spin' : ''"
          class="text-[8px] shrink-0"
        />
        <span class="truncate">Boshlash</span>
      </button>
      <button
        type="button"
        class="inline-flex items-center justify-center gap-0.5 px-1 py-1.5 rounded-lg text-[9px] font-black text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-900/50 bg-sky-500/5 active:scale-95 whitespace-nowrap min-w-0"
        :disabled="busy"
        @click="$emit('edit')"
      >
        <font-awesome-icon icon="fa-solid fa-pen-to-square" class="text-[8px] shrink-0" />
        <span class="truncate">Tahrirlash</span>
      </button>
      <button
        type="button"
        class="inline-flex items-center justify-center gap-0.5 px-1 py-1.5 rounded-lg text-[9px] font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 active:scale-95 disabled:opacity-50 whitespace-nowrap min-w-0"
        :disabled="busy"
        @click="$emit('delete')"
      >
        <font-awesome-icon icon="fa-solid fa-trash" class="text-[8px] shrink-0" />
        <span class="truncate">O'chirish</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PostCampaign } from '~/stores/post.store'

defineProps<{
  campaign: PostCampaign
  busy?: boolean
}>()

defineEmits<{
  start: []
  edit: []
  delete: []
}>()
</script>
