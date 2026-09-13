<template>
  <section
    v-if="visible"
    class="rounded-2xl border border-violet-200/60 dark:border-violet-900/35 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
  >
    <div
      class="px-3 py-2.5 border-b border-violet-100/80 dark:border-violet-900/25 bg-gradient-to-r from-violet-50/90 via-fuchsia-50/50 to-amber-50/40 dark:from-violet-950/35 dark:via-fuchsia-950/15 dark:to-amber-950/10"
    >
      <div class="flex items-center gap-2 min-w-0">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xs shadow-sm"
        >
          <font-awesome-icon icon="fa-solid fa-trophy" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[12px] font-black text-slate-800 dark:text-slate-100 leading-tight truncate">
            TOP 10 haydovchilar
          </p>
          <p class="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            <span class="text-pink-500">{{ totalInvites }}</span> qo'shilgan
            <span class="text-slate-300 dark:text-slate-600 mx-1">·</span>
            <span class="text-violet-500">{{ totalInviters }}</span> haydovchi
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="showMe && data"
      class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-violet-50/40 dark:bg-violet-950/20"
    >
      <div class="flex items-center gap-2 min-w-0">
        <div class="relative shrink-0">
          <ProfileAvatar :name="meName" :src="meAvatar" :user-id="meUserId" size="sm" />
          <span
            v-if="meRank"
            class="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-0.5 rounded-full flex items-center justify-center text-[8px] font-black bg-violet-500 text-white ring-[1.5px] ring-white dark:ring-slate-900"
          >
            {{ meRank }}
          </span>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate">
            Siz — {{ meName }}
          </p>
          <p
            v-if="meGroupTitle"
            class="text-[9px] font-semibold text-violet-600/80 dark:text-violet-400/80 truncate"
          >
            {{ meGroupTitle }}
          </p>
        </div>
        <div class="text-right shrink-0">
          <p class="text-[11px] font-black tabular-nums leading-none">
            <span class="text-sky-600 dark:text-sky-400">{{ meInvites }}</span>
            <span class="text-[9px] font-bold text-slate-400 mx-0.5">ta</span>
            <span class="text-slate-300 dark:text-slate-600">·</span>
            <span class="text-emerald-600 dark:text-emerald-400 ml-0.5">+{{ formattedMeBonus }}</span>
          </p>
        </div>
      </div>
    </div>

    <div v-if="loading && !data" class="px-3 py-2 space-y-1.5">
      <div
        v-for="n in 5"
        :key="n"
        class="h-11 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse"
      />
    </div>

    <div v-else class="px-3 py-1">
      <div
        v-for="item in leaderboard"
        :key="item.id"
        class="rounded-lg -mx-0.5 px-0.5"
        :class="item.isMe ? 'bg-violet-50/80 dark:bg-violet-950/25' : ''"
      >
        <DashboardGroupInviteLeaderRow
          :rank="item.rank"
          :name="item.name"
          :username="item.username"
          :avatar="item.avatar"
          :user-id="item.id"
          :group-title="item.groupTitle"
          :invites="item.invites"
          :bonus="item.bonus"
        />
      </div>

      <div
        v-if="showMeOutsideTop"
        class="rounded-lg bg-violet-50/80 dark:bg-violet-950/25 -mx-0.5 px-0.5"
      >
        <DashboardGroupInviteLeaderRow
          :rank="meRank || 0"
          :name="meName"
          :username="meUsername"
          :avatar="meAvatar"
          :user-id="meUserId"
          :group-title="meGroupTitle"
          :invites="meInvites"
          :bonus="meBonus"
        />
      </div>

      <div
        v-if="!leaderboard.length"
        class="flex flex-col items-center justify-center py-6 text-center text-slate-400"
      >
        <font-awesome-icon icon="fa-solid fa-user-group" class="text-xl mb-1.5 opacity-50" />
        <p class="text-[11px] font-medium">Hali guruhga qo'shganlar yo'q</p>
      </div>
    </div>

    <div
      v-if="showJoinSection"
      class="px-3 py-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5"
    >
      <p class="text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400">
        Har biri uchun
        <span class="text-amber-600 dark:text-amber-400 font-black">+{{ formattedReward }} so'm</span>
      </p>
      <button
        type="button"
        class="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white text-[12px] font-black py-2.5 shadow-sm shadow-violet-500/20 transition-all active:scale-[0.99] disabled:opacity-50"
        :disabled="!canOpenGroup"
        @click="onOpenGroup"
      >
        <font-awesome-icon icon="fa-brands fa-telegram" class="text-sm" />
        Guruhga a'zo qo'shish
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'
import { isTariffActive } from '~/utils/tariffActive'
import { openTelegramExternalUrl } from '~/utils/telegramLinks'
import type { GroupInviteLeaderboardData } from '~/types/group-invite'

const props = withDefaults(
  defineProps<{
    data: GroupInviteLeaderboardData | null
    loading?: boolean
    showMe?: boolean
    showJoinButton?: boolean
    /** Admin panel — har doim ko'rsatish */
    adminMode?: boolean
  }>(),
  {
    loading: false,
    showMe: true,
    showJoinButton: true,
    adminMode: false,
  },
)

const authStore = useAuthStore()
const { fetchGroups, openPublicGroup, groups } = useRegionGroupsWelcome()

const visible = computed(() => {
  if (props.adminMode) return true
  if (!import.meta.client || !authStore.sessionReady) return false
  if (authStore.user?.role === 'admin') return false
  if (!isTariffActive(authStore.user)) return false
  return props.data?.available === true
})

const leaderboard = computed(() => props.data?.leaderboard ?? [])
const totalInvites = computed(() =>
  (props.data?.totalInvites ?? 0).toLocaleString('ru-RU'),
)
const totalInviters = computed(() =>
  (props.data?.totalInviters ?? 0).toLocaleString('ru-RU'),
)

const meInvites = computed(() => props.data?.me.invites ?? 0)
const meBonus = computed(() => props.data?.me.bonus ?? 0)
const meRank = computed(() => props.data?.me.rank)
const meGroupTitle = computed(() => props.data?.me.groupTitle ?? '')
const showMeOutsideTop = computed(
  () =>
    props.showMe &&
    meInvites.value > 0 &&
    props.data?.me.inTop === false &&
    meRank.value != null,
)

const meName = computed(() => {
  const u = authStore.user
  const name = [u?.firstName, u?.lastName].filter(Boolean).join(' ').trim()
  return name || 'Siz'
})
const meUsername = computed(() => String(authStore.user?.username || '').replace(/^@/, ''))
const meAvatar = computed(() => authStore.user?.avatar)
const meUserId = computed(() => String(authStore.user?.userId || ''))

const formattedMeBonus = computed(() => meBonus.value.toLocaleString('ru-RU'))
const formattedReward = computed(() =>
  (props.data?.rewardPerInvite ?? 500).toLocaleString('ru-RU'),
)

const hasRegion = computed(() =>
  !!String(authStore.user?.regionSlug || '').trim(),
)

const showJoinSection = computed(() => {
  if (!props.showJoinButton || props.adminMode) return false
  return hasRegion.value
})

const groupUrl = computed(() => {
  const direct = String(props.data?.groupOpenUrl || '').trim()
  if (direct) return direct
  return String(groups.value?.public?.openUrl || '').trim()
})

const canOpenGroup = computed(() => !!groupUrl.value)

const onOpenGroup = async () => {
  if (groupUrl.value) {
    openTelegramExternalUrl(groupUrl.value)
    return
  }
  await fetchGroups()
  openPublicGroup()
}
</script>
