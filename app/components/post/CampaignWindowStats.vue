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

    <div
      class="rounded-xl text-center border"
      :class="[
        flat
          ? 'px-3 py-3 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50'
          : 'rounded-md bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800',
        !flat && (compact ? 'px-2 py-2' : 'px-3 py-2.5'),
      ]"
    >
      <p
        class="font-black tabular-nums text-emerald-600 dark:text-emerald-400"
        :class="flat ? 'text-[26px]' : compact ? 'text-[18px]' : 'text-[22px]'"
      >
        {{ campaign.windowSent ?? 0 }}
      </p>
      <p
        class="font-bold text-slate-500"
        :class="flat ? 'text-[11px] mt-1' : compact ? 'text-[9px]' : 'text-[11px]'"
      >
        Yuborilgan xabar (12 soat)
      </p>
    </div>

    <p
      class="font-semibold text-slate-500 dark:text-slate-400 leading-tight"
      :class="flat ? 'text-[12px]' : compact ? 'text-[9px]' : 'text-[12px]'"
    >
      Keyingi yuborish: <span class="font-black text-slate-700 dark:text-slate-200">{{ nextRunLabel }}</span>
      · har {{ intervalMin }} daqiqa
      <template v-if="campaign.windowEndsAt">
        · to'xtash {{ formatCampaignDateTime(campaign.windowEndsAt) }}
      </template>
    </p>
  </div>
</template>

<script setup lang="ts">
import type { PostCampaign } from '~/stores/post.store'
import {
  formatCampaignCountdown,
  formatCampaignDateTime,
  campaignIntervalMin,
} from '~/utils/postCampaign'

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
  }, 15_000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const countdownLabel = computed(() => {
  void now.value
  return formatCampaignCountdown(props.campaign.windowEndsAt)
})

const intervalMin = computed(() => campaignIntervalMin(props.campaign))

const nextRunLabel = computed(() => {
  void now.value
  if (!props.campaign.active) return '—'
  const at = props.campaign.nextRunAt
  if (!at) return '—'
  const ms = new Date(at).getTime() - Date.now()
  if (ms <= 0) return 'hozir'
  const m = Math.ceil(ms / 60_000)
  if (m < 60) return `${m} daq`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return rm > 0 ? `${h}s ${rm}d` : `${h}s`
})
</script>
