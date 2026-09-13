<template>
  <div :class="flat ? 'space-y-3' : ['rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40', compact ? 'p-2 space-y-1.5' : 'p-2.5 space-y-2']">
    <div class="flex items-center justify-between gap-2">
      <p
        class="font-black uppercase tracking-wide text-slate-500 dark:text-slate-400"
        :class="flat ? 'text-[11px]' : compact ? 'text-[9px]' : 'text-[12px]'"
      >
        12 soat avto-yuborish
      </p>
      <span
        v-if="campaign.active"
        class="font-black rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 whitespace-nowrap"
        :class="flat ? 'text-[11px] px-2.5 py-1' : compact ? 'text-[9px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5'"
      >
        {{ countdownLabel }}
      </span>
    </div>

    <div class="grid grid-cols-3 gap-2">
      <div
        class="rounded-xl text-center border"
        :class="[
          flat
            ? 'px-2 py-3 bg-orange-50 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900/50'
            : 'rounded-md bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800',
          !flat && (compact ? 'px-1 py-1' : 'px-2 py-1.5'),
        ]"
      >
        <p
          class="font-black tabular-nums text-slate-900 dark:text-white"
          :class="flat ? 'text-[22px]' : compact ? 'text-[13px]' : 'text-[16px]'"
        >
          {{ campaign.windowTotalPlanned ?? 0 }}
        </p>
        <p class="font-bold text-slate-500" :class="flat ? 'text-[10px] mt-1' : compact ? 'text-[8px]' : 'text-[11px]'">Reja</p>
      </div>
      <div
        class="rounded-xl text-center border"
        :class="[
          flat
            ? 'px-2 py-3 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50'
            : 'rounded-md bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800',
          !flat && (compact ? 'px-1 py-1' : 'px-2 py-1.5'),
        ]"
      >
        <p
          class="font-black tabular-nums text-emerald-600 dark:text-emerald-400"
          :class="flat ? 'text-[22px]' : compact ? 'text-[13px]' : 'text-[16px]'"
        >
          {{ campaign.windowSent ?? 0 }}
        </p>
        <p class="font-bold text-slate-500" :class="flat ? 'text-[10px] mt-1' : compact ? 'text-[8px]' : 'text-[11px]'">Yuborildi</p>
      </div>
      <div
        class="rounded-xl text-center border"
        :class="[
          flat
            ? 'px-2 py-3 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50'
            : 'rounded-md bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800',
          !flat && (compact ? 'px-1 py-1' : 'px-2 py-1.5'),
        ]"
      >
        <p
          class="font-black tabular-nums text-amber-600 dark:text-amber-400"
          :class="flat ? 'text-[22px]' : compact ? 'text-[13px]' : 'text-[16px]'"
        >
          {{ campaign.windowRemaining ?? 0 }}
        </p>
        <p class="font-bold text-slate-500" :class="flat ? 'text-[10px] mt-1' : compact ? 'text-[8px]' : 'text-[11px]'">Qoldi</p>
      </div>
    </div>

    <p
      class="font-semibold text-slate-500 dark:text-slate-400 leading-tight"
      :class="flat ? 'text-[12px]' : compact ? 'text-[9px]' : 'text-[12px]'"
    >
      Keyingi: <span class="font-black text-slate-700 dark:text-slate-200">{{ nextRunLabel }}</span>
      · {{ campaign.intervalMin }} daq
      <template v-if="campaign.windowEndsAt">
        · to'xtash {{ formatCampaignDateTime(campaign.windowEndsAt) }}
      </template>
    </p>
  </div>
</template>

<script setup lang="ts">
import type { PostCampaign } from '~/stores/post.store'
import { formatCampaignCountdown, formatCampaignDateTime } from '~/utils/postCampaign'

const props = defineProps<{
  campaign: PostCampaign
  compact?: boolean
  flat?: boolean
}>()

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 30_000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const countdownLabel = computed(() => {
  void now.value
  return formatCampaignCountdown(props.campaign.windowEndsAt)
})

const nextRunLabel = computed(() => {
  if (!props.campaign.active) return '—'
  const next = props.campaign.nextRunAt
  if (!next) return '—'
  const ms = new Date(next).getTime() - now.value
  if (ms <= 0) return 'hozir'
  const min = Math.ceil(ms / 60_000)
  if (min < 60) return `${min} daq`
  return formatCampaignDateTime(next)
})
</script>
