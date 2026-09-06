<template>
  <section
    v-if="visible"
    class="rounded-2xl border border-violet-200/70 dark:border-violet-900/40 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
  >
    <div
      class="relative px-4 py-3.5 border-b border-violet-100 dark:border-violet-900/30 bg-gradient-to-r from-violet-50 via-fuchsia-50/80 to-amber-50 dark:from-violet-950/40 dark:via-fuchsia-950/20 dark:to-amber-950/20"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500 dark:text-violet-400">
            Guruh taklifi
          </p>
          <h3 class="mt-0.5 text-[15px] font-black text-slate-800 dark:text-slate-100">
            TOP 10 haydovchilar
          </h3>
          <p class="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span class="text-pink-500 font-black">{{ totalInvites }}</span> qo'shilgan
            <span class="text-slate-300 dark:text-slate-600 mx-1">·</span>
            <span class="text-violet-500 font-black">{{ totalInviters }}</span> haydovchi
          </p>
        </div>
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-100 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/50"
        >
          <font-awesome-icon icon="fa-solid fa-trophy" />
        </div>
      </div>
    </div>

    <div
      v-if="showMe && data"
      class="p-3 border-b border-slate-100 dark:border-slate-800"
    >
      <div
        class="rounded-xl p-3.5 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-amber-500/10 dark:from-violet-950/50 dark:via-fuchsia-950/30 dark:to-amber-950/20 border border-violet-200/60 dark:border-violet-800/40"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0 flex items-center gap-2.5">
            <div class="relative shrink-0">
              <ProfileAvatar :name="meName" :src="meAvatar" :user-id="meUserId" size="md" />
              <span
                v-if="meRank"
                class="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center text-[10px] font-black bg-violet-500 text-white shadow-md ring-2 ring-white dark:ring-slate-900"
              >
                {{ meRank }}
              </span>
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-black uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400">
                Sizning natijangiz
              </p>
              <p class="mt-0.5 text-[13px] font-bold text-slate-700 dark:text-slate-200 truncate">
                {{ meName }}
              </p>
              <p
                v-if="meGroupTitle"
                class="text-[10px] font-bold text-violet-600/80 dark:text-violet-400/80 truncate"
              >
                {{ meGroupTitle }}
              </p>
            </div>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2">
          <div class="rounded-lg px-3 py-2 bg-white/85 dark:bg-slate-900/75 border border-white dark:border-slate-800">
            <p class="text-[10px] font-bold text-slate-400">Qo'shganlar</p>
            <p class="text-xl font-black text-sky-600 dark:text-sky-400 tabular-nums">
              {{ meInvites }}
              <span class="text-[11px] font-bold text-slate-400">ta</span>
            </p>
          </div>
          <div class="rounded-lg px-3 py-2 bg-white/85 dark:bg-slate-900/75 border border-white dark:border-slate-800">
            <p class="text-[10px] font-bold text-slate-400">Daromad</p>
            <p class="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              +{{ formattedMeBonus }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 pt-3 pb-1">
      <p class="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
        Reyting
      </p>
    </div>

    <div v-if="loading && !data" class="px-4 pb-4 space-y-2">
      <div
        v-for="n in 5"
        :key="n"
        class="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
      />
    </div>

    <div v-else class="px-4 pb-2">
      <div
        v-for="item in leaderboard"
        :key="item.id"
        class="rounded-xl -mx-1 px-1 transition-colors"
        :class="item.isMe ? 'bg-violet-50 dark:bg-violet-950/30 ring-1 ring-violet-200/80 dark:ring-violet-800/50' : ''"
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
        class="mt-1 rounded-xl bg-violet-50 dark:bg-violet-950/30 ring-1 ring-violet-200/80 dark:ring-violet-800/50 px-1"
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
        class="flex flex-col items-center justify-center py-8 text-center text-slate-400"
      >
        <font-awesome-icon icon="fa-solid fa-user-group" class="text-2xl mb-2 opacity-50" />
        <p class="text-[12px] font-medium">Hali guruhga qo'shganlar yo'q</p>
      </div>
    </div>

    <div
      v-if="showJoinSection"
      class="p-3 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-2"
    >
      <p class="text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1">
        Do'stlaringizni guruhga qo'shing —
        <span class="text-amber-600 dark:text-amber-400 font-black">
          har biri uchun +{{ formattedReward }} so'm
        </span>
      </p>
      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white text-[13px] font-black py-3 shadow-md shadow-violet-500/25 transition-all active:scale-[0.99] disabled:opacity-50"
        :disabled="!canOpenGroup"
        @click="onOpenGroup"
      >
        <font-awesome-icon icon="fa-brands fa-telegram" />
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
