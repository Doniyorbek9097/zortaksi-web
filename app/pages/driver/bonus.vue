<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-5 pb-28 space-y-4">
    <AdminReferralPageHeader />

    <div v-if="store.isLoading && !store.summary" class="space-y-3">
      <div class="h-40 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
      <div class="h-32 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
    </div>

    <template v-else>
      <AdminReferralHeroCard
        :reward="rewardPerInvite"
        :invites="totalInvites"
        :per-invite="rewardPerInvite"
      />

      <AdminReferralLinkSection
        :link="referralLink"
        :ad-text="adText"
      />

      <AdminSectionCard :title="`Referal orqali qo'shilganlar`" no-padding>
        <template #action>
          <span
            class="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[10px] font-black bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
          >
            {{ joinedUsers.length }}
          </span>
        </template>
        <div class="px-4 pb-2">
          <AdminReferralJoinedItem
            v-for="user in joinedUsers"
            :key="user.id"
            :name="user.name"
            :username="user.username"
            :active="user.active"
            :date="user.date"
          />
          <p
            v-if="!joinedUsers.length"
            class="py-6 text-center text-[12px] font-medium text-slate-400"
          >
            Hali referal orqali qo'shilganlar yo'q
          </p>
        </div>
      </AdminSectionCard>

      <AdminReferralLeaderboardCard :items="leaderboard" />
    </template>

    <p v-if="store.error" class="text-center text-[12px] font-bold text-red-500">
      {{ store.error }}
    </p>

    <p class="text-center text-[11px] font-bold text-slate-400 dark:text-slate-600 pt-1">
      ZorTaksi.Uz v1.0.0
    </p>
  </div>
</template>

<script setup lang="ts">
import { useReferralStore } from '~/stores/referral.store'

definePageMeta({ layout: 'driver' })

const store = useReferralStore()

const rewardPerInvite = computed(() => store.summary?.rewardPerInvite ?? 5000)
const totalInvites = computed(() => store.summary?.totalInvites ?? 0)
const referralLink = computed(() => store.summary?.link ?? '')
const adText = computed(() => store.summary?.adText ?? 'Sizni ZorTaksi ga taklif qildim!')
const joinedUsers = computed(() => store.joined)
const leaderboard = computed(() => store.leaderboard)

onMounted(() => {
  store.fetchAll().catch(() => {})
})
</script>
