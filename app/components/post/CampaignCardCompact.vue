<template>
  <div
    class="relative overflow-hidden rounded-2xl border shadow-sm"
    :class="campaign.active
      ? 'border-emerald-400/60 dark:border-emerald-700/50 bg-gradient-to-br from-emerald-50 via-white to-teal-50/80 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/20'
      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'"
  >
    <div
      v-if="campaign.active"
      class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500"
    />

    <div class="px-3.5 py-3 pl-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 min-w-0">
            <span
              v-if="campaign.active"
              class="inline-flex items-center gap-1 shrink-0 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500 text-white"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Faol
            </span>
            <h3 class="text-[15px] font-black text-slate-900 dark:text-white truncate">
              {{ campaign.name }}
            </h3>
          </div>
          <p class="text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            {{ campaign.text }}
          </p>
        </div>

        <div class="shrink-0 flex flex-col items-end gap-1">
          <span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-[12px] font-black text-slate-700 dark:text-slate-200 tabular-nums">
            <font-awesome-icon icon="fa-solid fa-clock" class="text-[10px] text-amber-500" />
            {{ campaign.intervalMin }} daq
          </span>
          <span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-[12px] font-black text-slate-700 dark:text-slate-200 tabular-nums">
            <font-awesome-icon icon="fa-solid fa-users" class="text-[10px] text-sky-500" />
            {{ campaign.groupIds.length }} guruh
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2 mt-3">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black transition-all active:scale-95 disabled:opacity-50"
          :class="campaign.active
            ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/25'
            : 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'"
          :disabled="busy"
          @click="$emit(campaign.active ? 'stop' : 'start')"
        >
          <font-awesome-icon
            :icon="busy ? 'fa-solid fa-spinner' : (campaign.active ? 'fa-solid fa-pause' : 'fa-solid fa-play')"
            :class="busy ? 'animate-spin' : ''"
            class="text-[10px]"
          />
          {{ campaign.active ? "To'xtatish" : 'Boshlash' }}
        </button>
        <button
          type="button"
          class="w-9 h-9 rounded-xl inline-flex items-center justify-center border border-rose-200 dark:border-rose-900/50 bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-all active:scale-95 disabled:opacity-50"
          :disabled="busy"
          title="O'chirish"
          @click="$emit('delete')"
        >
          <font-awesome-icon icon="fa-solid fa-trash" class="text-[11px]" />
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
  delete: []
}>()
</script>
