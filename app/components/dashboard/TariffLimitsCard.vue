<template>
  <section
    class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
  >
    <div
      class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-sky-50 via-violet-50 to-fuchsia-50 dark:from-sky-950/30 dark:via-violet-950/25 dark:to-fuchsia-950/20"
    >
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 via-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-sm shadow-sm shrink-0"
          >
            <font-awesome-icon icon="fa-solid fa-gauge-high" />
          </div>
          <div>
            <p class="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-tight">
              Tarif limitlari
            </p>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              Buyurtma va auto e'lon — jonli qolgan vaqt
            </p>
          </div>
        </div>
        <div class="flex flex-col gap-1 shrink-0 items-end">
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase"
            :class="orderActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'"
          >
            <font-awesome-icon icon="fa-solid fa-tags" class="text-[8px]" />
            Buyurtma
          </span>
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase"
            :class="postActive ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'"
          >
            <font-awesome-icon icon="fa-solid fa-bullhorn" class="text-[8px]" />
            E'lon
          </span>
        </div>
      </div>
    </div>

    <div class="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
      <DashboardTariffLimitPanel
        kind="order"
        :name="order.name"
        :start-date="order.startDate"
        :end-date="order.endDate"
        :started-at="order.startedAt"
        :expire-at="order.expireAt"
        :expire-days="order.expireDays"
        :active="orderActive"
        :now-ms="nowMs"
        @buy="$emit('buyOrder')"
      />
      <DashboardTariffLimitPanel
        kind="post"
        :name="post.name"
        :start-date="post.startDate"
        :end-date="post.endDate"
        :started-at="post.startedAt"
        :expire-at="post.expireAt"
        :expire-days="post.expireDays"
        :active="postActive"
        :now-ms="nowMs"
        @buy="$emit('buyPost')"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useLiveNowMs } from '~/composables/dashboard/useTariffCountdown'

export type TariffLimitSlice = {
  name: string
  startDate: string
  endDate: string
  startedAt: Date | string | null
  expireAt: string | Date | null
  expireDays: number
}

defineProps<{
  order: TariffLimitSlice
  post: TariffLimitSlice
  orderActive: boolean
  postActive: boolean
}>()

defineEmits<{ buyOrder: []; buyPost: [] }>()

const nowMs = useLiveNowMs()
</script>
