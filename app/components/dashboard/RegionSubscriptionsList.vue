<template>
  <div class="space-y-3">
    <h3 class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500 px-0.5">
      Hududlar va tariflar
    </h3>

    <DashboardTariffCard
      v-for="sub in subscriptions"
      :key="`${sub.scopeUserId}:${sub.regionSlug}`"
      :name="sub.regionTitle || sub.regionSlug"
      :info="sub.tariff?.info || sub.tariff?.name || 'Hudud obunasi'"
      :price="sub.tariff?.price ?? 0"
      :expire-days="sub.tariff?.expireDays ?? 0"
      :start-date="formatDate(sub.startedAt)"
      :end-date="formatDate(sub.tariffExpireAt)"
      :started-at="sub.startedAt"
      :expire-at="sub.tariffExpireAt"
      :active="sub.subscriptionActive"
      :inactive-hint="!sub.subscriptionActive"
      @buy="emit('buy', sub)"
    />
  </div>
</template>

<script setup lang="ts">
import type { IRegionSubscription } from '~/types/user'

defineProps<{
  subscriptions: IRegionSubscription[]
}>()

const emit = defineEmits<{
  buy: [sub: IRegionSubscription]
}>()

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}
</script>
