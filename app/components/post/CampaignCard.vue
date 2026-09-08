<template>
  <div
    class="rounded-2xl border p-3 space-y-2.5 transition-colors"
    :class="campaign.active
      ? 'border-emerald-300/80 dark:border-emerald-800/50 bg-emerald-50/60 dark:bg-emerald-950/20'
      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <h3 class="text-[13px] font-black text-slate-900 dark:text-white truncate">
            {{ campaign.name }}
          </h3>
          <span
            v-if="campaign.active"
            class="shrink-0 text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-emerald-500 text-white"
          >
            Faol
          </span>
        </div>
        <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-snug">
          {{ campaign.text }}
        </p>
        <p class="text-[10px] font-semibold text-slate-400 mt-1.5">
          {{ campaign.groupIds.length }} guruh · har {{ campaign.intervalMin }} daqiqa
          <span v-if="campaign.lastSent"> · oxirgi: {{ campaign.lastSent }} ta</span>
        </p>
        <p v-if="campaign.lastError" class="text-[10px] font-bold text-rose-500 mt-1">
          {{ campaign.lastError }}
        </p>
      </div>
    </div>

    <div class="flex items-center gap-1.5 flex-wrap">
      <button
        type="button"
        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black transition-all active:scale-95"
        :class="campaign.active
          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'"
        :disabled="busy"
        @click="$emit(campaign.active ? 'stop' : 'start')"
      >
        <font-awesome-icon
          :icon="busy ? 'fa-solid fa-spinner' : (campaign.active ? 'fa-solid fa-pause' : 'fa-solid fa-play')"
          :class="busy ? 'animate-spin' : ''"
          class="text-[9px]"
        />
        {{ campaign.active ? "To'xtatish" : 'Boshlash' }}
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-900/50 bg-sky-500/5 active:scale-95"
        :disabled="busy"
        @click="$emit('edit')"
      >
        <font-awesome-icon icon="fa-solid fa-pen-to-square" class="text-[9px]" />
        Tahrirlash
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black text-white bg-rose-500 hover:bg-rose-600 border border-rose-500 active:scale-95 disabled:opacity-50"
        :disabled="busy"
        @click="$emit('delete')"
      >
        <font-awesome-icon icon="fa-solid fa-trash" class="text-[9px]" />
        O'chirish
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
  stop: []
  edit: []
  delete: []
}>()
</script>
