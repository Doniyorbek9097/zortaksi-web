<template>
  <div
    :class="flat
      ? 'space-y-3'
      : [
        'rounded-xl border transition-colors',
        compact ? 'p-2 space-y-1.5' : 'rounded-2xl p-3 space-y-2.5',
        campaign.active
          ? 'border-emerald-300/80 dark:border-emerald-800/50 bg-emerald-50/60 dark:bg-emerald-950/20'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
      ]"
  >
    <div v-if="!hideHeader" class="flex items-center justify-between gap-2 min-w-0">
      <div class="min-w-0 flex-1 flex items-center gap-2">
        <span
          v-if="campaign.active && !hideActiveBadge"
          class="shrink-0 font-black uppercase tracking-wide rounded-full bg-emerald-500 text-white"
          :class="flat ? 'text-[10px] px-2 py-0.5' : compact ? 'text-[8px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5'"
        >
          Faol
        </span>
        <h3
          class="font-black text-slate-900 dark:text-white truncate"
          :class="compactTitle ? 'text-[13px]' : flat ? 'text-[16px]' : compact ? 'text-[13px]' : 'text-[15px]'"
        >
          {{ campaign.name }}
        </h3>
      </div>
      <p
        v-if="compact && !flat"
        class="shrink-0 font-bold text-slate-400 tabular-nums whitespace-nowrap text-[9px]"
      >
        {{ campaign.groupIds.length }}g · {{ campaign.intervalMin }}d
      </p>
      <p
        v-else-if="flat && !hideHeader"
        class="shrink-0 font-bold text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap text-[12px]"
      >
        {{ campaign.groupIds.length }} guruh · {{ campaign.intervalMin }} daq
      </p>
    </div>

    <p
      v-if="!hideText"
      class="font-medium text-slate-600 dark:text-slate-300 leading-snug"
      :class="[
        flat ? 'text-[14px] line-clamp-2' : compact ? 'text-[11px] line-clamp-1' : 'text-[13px] line-clamp-1',
      ]"
    >
      {{ campaign.broadcastText || campaign.text }}
    </p>
    <p
      v-if="campaign.adminAppendText && !hideText"
      class="text-[10px] font-semibold text-violet-600/80 dark:text-violet-400/80 leading-snug"
      :class="flat ? 'px-0.5' : ''"
    >
      + admin qo'shimcha xabar
    </p>

    <p
      v-if="!compact && !flat"
      class="text-[12px] font-semibold text-slate-400"
    >
      {{ campaign.groupIds.length }} guruh · har {{ campaign.intervalMin }} daqiqa
      <span v-if="campaign.lastSent"> · oxirgi: {{ campaign.lastSent }} ta</span>
    </p>

    <p
      v-if="campaign.lastError"
      class="font-bold text-rose-500 line-clamp-2"
      :class="flat ? 'text-[12px]' : compact ? 'text-[10px]' : 'text-[12px]'"
    >
      {{ campaign.lastError }}
    </p>

    <PostCampaignWindowStats
      v-if="showWindowStats"
      :campaign="campaign"
      :compact="compact && !flat"
      :flat="flat"
    />

    <div class="grid grid-cols-3 gap-2">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-1 rounded-xl font-black transition-all active:scale-95 whitespace-nowrap min-w-0"
        :class="[
          flat ? 'px-2 py-2.5 text-[11px]' : compact ? 'px-1 py-1.5 text-[9px]' : 'px-2 py-1.5 text-[11px]',
          campaign.active
            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50',
        ]"
        :disabled="busy"
        @click="$emit(campaign.active ? 'stop' : 'start')"
      >
        <font-awesome-icon
          :icon="busy ? 'fa-solid fa-spinner' : (campaign.active ? 'fa-solid fa-pause' : 'fa-solid fa-play')"
          :class="[busy ? 'animate-spin' : '', flat ? 'text-[10px]' : 'text-[8px]', 'shrink-0']"
        />
        <span class="truncate">{{ campaign.active ? "To'xtatish" : 'Boshlash' }}</span>
      </button>

      <button
        type="button"
        class="inline-flex items-center justify-center gap-1 rounded-xl font-black text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-900/50 bg-sky-500/5 active:scale-95 whitespace-nowrap min-w-0"
        :class="flat ? 'px-2 py-2.5 text-[11px]' : compact ? 'px-1 py-1.5 text-[9px]' : 'px-2 py-1.5 text-[11px]'"
        :disabled="busy"
        @click="onEdit"
      >
        <font-awesome-icon icon="fa-solid fa-pen-to-square" :class="flat ? 'text-[10px]' : 'text-[8px]'" class="shrink-0" />
        <span class="truncate">Tahrirlash</span>
      </button>

      <button
        type="button"
        class="inline-flex items-center justify-center gap-1 rounded-xl font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-200 dark:border-rose-900/50 active:scale-95 disabled:opacity-50 whitespace-nowrap min-w-0"
        :class="flat ? 'px-2 py-2.5 text-[11px]' : compact ? 'px-1 py-1.5 text-[9px]' : 'px-2 py-1.5 text-[11px]'"
        :disabled="busy"
        @click="$emit('delete')"
      >
        <font-awesome-icon icon="fa-solid fa-trash" :class="flat ? 'text-[10px]' : 'text-[8px]'" class="shrink-0" />
        <span class="truncate">O'chirish</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PostCampaign } from '~/stores/post.store'
import { campaignEditPath, campaignHasWindowStats } from '~/utils/postCampaign'

const props = defineProps<{
  campaign: PostCampaign
  busy?: boolean
  compact?: boolean
  /** Dashboard: ichki yashil kartochka yo'q, asosiy kartada kattaroq */
  flat?: boolean
  /** Tashqi kartada sarlavha allaqachon ko'rsatilgan */
  hideHeader?: boolean
  /** Berilsa Tahrirlash to'g'ridan-to'g'ri shu sahifaga o'tadi */
  editTo?: string
  hideActiveBadge?: boolean
  hideText?: boolean
  compactTitle?: boolean
}>()

const emit = defineEmits<{
  start: []
  stop: []
  edit: []
  delete: []
}>()

const showWindowStats = computed(() => campaignHasWindowStats(props.campaign))

const onEdit = () => {
  const path = props.editTo || campaignEditPath(props.campaign.id)
  void navigateTo(path)
  emit('edit')
}
</script>
