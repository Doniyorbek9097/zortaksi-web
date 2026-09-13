<template>
  <div
    class="relative overflow-hidden rounded-xl border"
    :class="campaign.active
      ? 'border-emerald-400/60 dark:border-emerald-700/50 bg-emerald-50/70 dark:bg-emerald-950/25'
      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'"
  >
    <div
      v-if="campaign.active"
      class="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500"
    />

    <div class="px-2.5 py-2 pl-3">
      <div class="flex items-center justify-between gap-2 min-w-0">
        <div class="min-w-0 flex-1 flex items-center gap-1.5">
          <span
            v-if="campaign.active"
            class="shrink-0 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-500 text-white"
          >
            Faol
          </span>
          <h3 class="text-[13px] font-black text-slate-900 dark:text-white truncate">
            {{ campaign.name }}
          </h3>
        </div>
        <p class="shrink-0 text-[9px] font-black text-slate-500 tabular-nums whitespace-nowrap">
          {{ campaign.intervalMin }} daq · {{ campaign.groupIds.length }} guruh
        </p>
      </div>

      <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
        {{ campaign.text }}
      </p>

      <div class="grid grid-cols-3 gap-1 mt-1.5">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-0.5 px-1 py-1.5 rounded-lg text-[9px] font-black transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap min-w-0"
          :class="campaign.active
            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'"
          :disabled="busy"
          @click="$emit(campaign.active ? 'stop' : 'start')"
        >
          <font-awesome-icon
            :icon="busy ? 'fa-solid fa-spinner' : (campaign.active ? 'fa-solid fa-pause' : 'fa-solid fa-play')"
            :class="busy ? 'animate-spin' : ''"
            class="text-[8px] shrink-0"
          />
          <span class="truncate">{{ campaign.active ? "To'xtatish" : 'Boshlash' }}</span>
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
  stop: []
  edit: []
  delete: []
}>()
</script>
