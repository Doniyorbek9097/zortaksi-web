<template>
  <div
    class="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-3 shadow-sm"
  >
    <div class="flex items-start gap-3">
      <div
        class="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500"
      >
        <font-awesome-icon icon="fa-solid fa-bullhorn" class="text-sm" />
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <h3 class="text-[14px] font-black text-slate-900 dark:text-white truncate leading-tight">
            {{ campaign.name }}
          </h3>
          <div class="shrink-0 flex items-center gap-1">
            <span class="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 tabular-nums">
              {{ campaign.intervalMin }}d
            </span>
            <span class="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-400 tabular-nums">
              {{ campaign.groupIds.length }}g
            </span>
          </div>
        </div>

        <p class="text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-snug">
          {{ campaign.text }}
        </p>

        <p v-if="campaign.lastError" class="text-[11px] font-bold text-rose-500 mt-1 line-clamp-1">
          {{ campaign.lastError }}
        </p>

        <div class="flex items-center gap-1.5 mt-2.5 flex-wrap">
          <button
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 active:scale-95 disabled:opacity-50"
            :disabled="busy"
            @click="$emit('start')"
          >
            <font-awesome-icon
              :icon="busy ? 'fa-solid fa-spinner' : 'fa-solid fa-play'"
              :class="busy ? 'animate-spin' : ''"
              class="text-[9px]"
            />
            Boshlash
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
            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 active:scale-95 disabled:opacity-50"
            :disabled="busy"
            @click="$emit('delete')"
          >
            <font-awesome-icon icon="fa-solid fa-trash" class="text-[9px]" />
            O'chirish
          </button>
        </div>
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
  edit: []
  delete: []
}>()
</script>
