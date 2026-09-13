<template>
  <div
    class="rounded-xl border px-3 py-2.5 transition-colors"
    :class="campaign.active
      ? 'border-emerald-300/80 dark:border-emerald-800/50 bg-emerald-50/70 dark:bg-emerald-950/25'
      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <h3 class="text-[14px] font-black text-slate-900 dark:text-white truncate leading-tight">
          {{ campaign.name }}
        </h3>
        <div class="flex items-center gap-1.5 mt-2">
          <button
            type="button"
            class="w-8 h-8 rounded-lg inline-flex items-center justify-center border transition-all active:scale-95 disabled:opacity-50"
            :class="campaign.active
              ? 'border-rose-200 dark:border-rose-900/50 bg-rose-500/10 text-rose-600 dark:text-rose-400'
              : 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'"
            :disabled="busy"
            :title="campaign.active ? 'To\'xtatish' : 'Boshlash'"
            @click="$emit(campaign.active ? 'stop' : 'start')"
          >
            <font-awesome-icon
              :icon="busy ? 'fa-solid fa-spinner' : (campaign.active ? 'fa-solid fa-pause' : 'fa-solid fa-play')"
              :class="busy ? 'animate-spin' : ''"
              class="text-[11px]"
            />
          </button>
          <button
            type="button"
            class="w-8 h-8 rounded-lg inline-flex items-center justify-center border border-rose-200 dark:border-rose-900/50 bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-all active:scale-95 disabled:opacity-50"
            :disabled="busy"
            title="O'chirish"
            @click="$emit('delete')"
          >
            <font-awesome-icon icon="fa-solid fa-trash" class="text-[11px]" />
          </button>
        </div>
      </div>

      <div class="shrink-0 text-right leading-tight">
        <p class="text-[13px] font-black tabular-nums text-slate-800 dark:text-slate-100">
          {{ campaign.intervalMin }} daq
        </p>
        <p class="text-[12px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
          {{ campaign.groupIds.length }} guruh
        </p>
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
  delete: []
}>()
</script>
