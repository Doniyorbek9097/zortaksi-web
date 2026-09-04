<template>
  <div class="space-y-3">
    <h3 class="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500 px-0.5">
      Hududlar va tariflar
    </h3>

    <DashboardTariffCard
      v-for="sub in subscriptions"
      :key="`${sub.scopeUserId}:${sub.regionSlug}`"
      :name="sub.regionTitle || sub.regionSlug"
      :info="subscriptionInfo(sub)"
      :price="sub.tariff?.price ?? 0"
      :expire-days="sub.tariff?.expireDays ?? 0"
      :start-date="formatDate(displayStartDate(sub))"
      :end-date="formatDate(sub.tariffExpireAt)"
      :started-at="displayStartDate(sub)"
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

const displayStartDate = (sub: IRegionSubscription) => sub.startedAt || sub.assignedAt || null

const subscriptionInfo = (sub: IRegionSubscription) => {
  const owner = sub.scopeOwnerName ? `${sub.scopeOwnerName} · ` : ''
  const tariff = sub.tariff?.info || sub.tariff?.name
  if (tariff) return `${owner}${tariff}`
  if (sub.subscriptionActive) return `${owner}Faol obuna`
  return `${owner}Hudud biriktirilgan — tarif kerak`
}
</script>
