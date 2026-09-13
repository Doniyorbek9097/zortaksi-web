<template>
  <div
    class="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 p-2.5 space-y-2"
  >
    <div class="flex items-center justify-between gap-2">
      <p class="text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
        12 soat avto-yuborish
      </p>
      <span
        v-if="campaign.active"
        class="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
      >
        {{ countdownLabel }}
      </span>
    </div>

    <div class="grid grid-cols-3 gap-1.5">
      <div class="rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 px-2 py-1.5 text-center">
        <p class="text-[14px] font-black tabular-nums text-slate-900 dark:text-white">
          {{ campaign.windowTotalPlanned ?? 0 }}
        </p>
        <p class="text-[9px] font-bold text-slate-500">Reja</p>
      </div>
      <div class="rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 px-2 py-1.5 text-center">
        <p class="text-[14px] font-black tabular-nums text-emerald-600 dark:text-emerald-400">
          {{ campaign.windowSent ?? 0 }}
        </p>
        <p class="text-[9px] font-bold text-slate-500">Yuborildi</p>
      </div>
      <div class="rounded-lg bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 px-2 py-1.5 text-center">
        <p class="text-[14px] font-black tabular-nums text-amber-600 dark:text-amber-400">
          {{ campaign.windowRemaining ?? 0 }}
        </p>
        <p class="text-[9px] font-bold text-slate-500">Qoldi</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
      <p>
        Keyingi:
        <span class="font-black text-slate-700 dark:text-slate-200">
          {{ nextRunLabel }}
        </span>
      </p>
      <p class="text-right">
        Interval:
        <span class="font-black text-slate-700 dark:text-slate-200">
          {{ campaign.intervalMin }} daq
        </span>
      </p>
      <p v-if="campaign.windowEndsAt" class="col-span-2">
        Avto to'xtash:
        <span class="font-black text-slate-700 dark:text-slate-200">
          {{ formatCampaignDateTime(campaign.windowEndsAt) }}
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PostCampaign } from '~/stores/post.store'
import { formatCampaignCountdown, formatCampaignDateTime } from '~/utils/postCampaign'

const props = defineProps<{
  campaign: PostCampaign
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
