<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-4 space-y-3">
    <!-- Sticky: sarlavha + tanlangan guruhlar tugmalari -->
    <div class="sticky top-0 z-30 -mx-4 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
      <header class="flex items-center justify-between gap-2 px-4 py-1.5">
        <div class="min-w-0 flex items-center gap-2">
          <button
            v-if="pickGroupsMode"
            type="button"
            class="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-slate-900 active:scale-95 shrink-0"
            @click="goBackFromPick"
          >
            <font-awesome-icon icon="fa-solid fa-arrow-left" class="text-xs" />
          </button>
          <div class="min-w-0 leading-none">
            <h1 class="text-base font-black text-slate-900 dark:text-white">
              {{ pickGroupsMode ? 'Guruhlarni tanlash' : "E'lon joylash" }}
            </h1>
            <p class="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">
              {{ pickGroupsMode ? 'Tanlangan guruhlar saqlanadi' : 'Meniki guruhlar' }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button
            v-if="store.isAdmin"
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black tracking-wide transition-all active:scale-95 border"
            :class="showFilter || filterActive
              ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-400/50 dark:border-indigo-500/50'
              : 'border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-slate-900'"
            @click="showFilter = !showFilter"
          >
            <font-awesome-icon icon="fa-solid fa-location-dot" class="text-[10px]" />
            Hudud
          </button>
          <button
            type="button"
            class="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-400 bg-white dark:bg-slate-900 active:scale-95"
            :disabled="store.isLoading"
            @click="store.load(true)"
          >
            <font-awesome-icon
              icon="fa-solid fa-rotate"
              :class="store.isLoading ? 'animate-spin' : ''"
            />
          </button>
        </div>
      </header>

      <div
        v-if="selectedCount > 0"
        class="px-4 py-2.5 border-t border-amber-200/70 dark:border-amber-900/40 bg-amber-50/95 dark:bg-amber-950/40"
      >
        <p class="text-[11px] font-black text-amber-800 dark:text-amber-200 mb-2">
          {{ selectedCount }} ta guruh tanlangan
        </p>
        <div class="flex gap-2">
          <button
            v-if="pickGroupsMode"
            type="button"
            class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-black text-white bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all"
            @click="onSavePickedGroups"
          >
            <font-awesome-icon icon="fa-solid fa-check" class="text-[10px]" />
            Saqlash
          </button>
          <button
            v-else
            type="button"
            class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-black text-white bg-amber-500 hover:bg-amber-600 active:scale-95 transition-all"
            @click="openCompose"
          >
            <font-awesome-icon icon="fa-solid fa-paper-plane" class="text-[10px]" />
            Xabar yuborish
          </button>
          <button
            type="button"
            class="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-black text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 active:scale-95"
            @click="store.clearSelection()"
          >
            Bekor
          </button>
        </div>
      </div>
    </div>

    <OrdersFilterPanel
      v-if="store.isAdmin && showFilter"
      v-model="draftKeywords"
      v-model:bot-group-id="draftBotGroupId"
      @save="onSaveFilter"
      @cancel="onCancelFilter"
    />

    <div
      class="rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/90 dark:bg-amber-950/30 px-3 py-2.5"
    >
      <p class="text-[11px] font-black text-amber-800 dark:text-amber-200 flex items-center gap-1.5 mb-1.5">
        <font-awesome-icon icon="fa-solid fa-circle-info" class="text-[10px] shrink-0" />
        Qo'llanma
      </p>
      <ul
        v-if="pickGroupsMode"
        class="text-[10px] font-semibold text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4 leading-relaxed"
      >
        <li>E'lon uchun kerakli guruhlarni belgilang</li>
        <li>«Saqlash» tugmasi orqali tanlov saqlanadi</li>
      </ul>
      <ul
        v-else
        class="text-[10px] font-semibold text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4 leading-relaxed"
      >
        <li>Guruhlarni belgilang (maks. {{ MAX_POST_GROUPS }} ta)</li>
        <li>«Xabar yuborish» — bir martalik yoki avto-e'lon yuborish</li>
        <li>Kartani o'ngga surib — guruhni ko'ring, chapga surib — tark eting</li>
        <li v-if="store.isAdmin">Admin guruhlarda ko'z belgisi — haydovchilarga ko'rsatish/yashirish</li>
      </ul>
    </div>

    <!-- Guruh qidiruvi -->
    <div class="relative">
      <font-awesome-icon
        icon="fa-solid fa-magnifying-glass"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none"
      />
      <input
        v-model="groupQuery"
        type="search"
        placeholder="Guruh nomi yoki @username qidirish…"
        class="w-full pl-9 pr-3 py-2.5 rounded-xl text-[13px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
      />
    </div>

    <div class="flex items-center justify-between gap-2">
      <p class="text-[12px] font-bold text-slate-400">
        {{ selectedCount }}/{{ MAX_POST_GROUPS }} tanlangan · {{ filtered.length }}/{{ store.mineTotal }} ko'rsatildi
      </p>
      <button
        type="button"
        class="px-2.5 py-1 rounded-lg text-[11px] font-black border border-slate-200 dark:border-slate-700 text-slate-500"
        @click="toggleSelectAll"
      >
        {{ allFilteredSelected ? 'Bekor' : 'Hammasi' }}
      </button>
    </div>

    <div v-if="store.isLoading" class="space-y-3">
      <div
        v-for="n in 5"
        :key="n"
        class="h-[72px] rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"
      />
    </div>

    <BaseEmptyState
      v-else-if="!filtered.length"
      icon="fa-solid fa-bullhorn"
      title="Guruhlar topilmadi — Telegram sessiyangizni tekshiring"
      tone="slate"
    />

    <div v-else class="space-y-2.5">
      <PostGroupCard
        v-for="g in filtered"
        :key="g.id"
        :group="g"
        :selectable="true"
        :selected="store.selected.has(g.id)"
        :show-admin-badge="true"
        :show-visible-badge="store.isAdmin"
        :show-leave="true"
        :leaving="store.joiningId === g.id"
        :show-visibility="store.isAdmin && g.isAdmin"
        @toggle="store.toggle(g.id)"
        @leave="onAskLeave(g)"
        @toggle-visibility="onToggleVisibility(g)"
      />

      <div ref="sentinel" class="h-1" />

      <div v-if="store.isLoadingMore" class="space-y-2.5 pt-1">
        <div
          v-for="n in 2"
          :key="n"
          class="h-[72px] rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"
        />
      </div>

      <p
        v-else-if="!store.hasMore && filtered.length"
        class="py-3 text-center text-[11px] font-medium text-slate-400 dark:text-slate-600"
      >
        Barcha guruhlar ko'rsatildi
      </p>
    </div>

    <p v-if="store.error" class="text-center text-[12px] font-bold text-red-500">
      {{ store.error }}
    </p>
    <p v-if="success" class="text-center text-[12px] font-bold text-emerald-500">
      {{ success }}
    </p>

    <PostComposeDialog
      v-model="composeOpen"
      :count="selectedCount"
      :cost="0"
      :loading="store.isSending"
      @once="onSendOnce"
      @save="onSaveCampaign"
    />

    <PostMembershipDialog
      v-model="showLeaveDialog"
      title="Guruhni tark etish"
      message=""
      confirm-text="Tark etish"
      variant="warning"
      :loading="!!store.joiningId"
      :group="membershipTarget"
      @confirm="onConfirmLeave"
      @cancel="membershipTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import { usePostStore, type PostGroup, MAX_POST_GROUPS } from '~/stores/post.store'
import { useAuthStore } from '~/stores/auth.store'
import {
  loadOrderFilterKeywords,
  loadOrderFilterBotGroupId,
  parseBotGroupIds,
  formatBotGroupIds,
  saveOrderFilterKeywords,
  saveOrderFilterBotGroupId,
  clearOrderFilterBotGroupId,
  clearOrderFilterKeywords,
  markOrderFilterConfigured,
  filterGroupsByKeywords,
} from '~/utils/orderFilterKeywords'
import { campaignEditPath } from '~/utils/postCampaign'

definePageMeta({ layout: 'driver' })

const route = useRoute()
const store = usePostStore()
const authStore = useAuthStore()

const POST_TARIFF_PAYMENT_PATH = '/driver/payment?tab=tariff&next=/driver/post'

const pickGroupsMode = computed(() => route.query.pickGroups === '1')
const pickCampaignId = computed(() => String(route.query.campaignId || ''))

const canPostWithTariff = computed(() => store.isAdmin || authStore.tariffActive)

const requireTariffForPost = (): boolean => {
  if (store.isAdmin) return true
  if (canPostWithTariff.value) return true
  navigateTo(POST_TARIFF_PAYMENT_PATH)
  return false
}

const composeOpen = ref(false)
const success = ref('')
const groupQuery = ref('')
const showFilter = ref(false)
const draftKeywords = ref('')
const draftBotGroupId = ref<string | null>(null)
const appliedKeywords = ref('')
const appliedBotGroupId = ref('')
const filterActive = computed(
  () => parseBotGroupIds(appliedBotGroupId.value).length > 0 || !!appliedKeywords.value.trim(),
)
const showLeaveDialog = ref(false)
const membershipTarget = ref<PostGroup | null>(null)

const openCompose = () => {
  if (!requireTariffForPost()) return
  composeOpen.value = true
}

const onSaveFilter = async () => {
  const kw = draftKeywords.value.trim()
  const gid = formatBotGroupIds(parseBotGroupIds(String(draftBotGroupId.value || '')))

  appliedKeywords.value = gid ? '' : kw
  appliedBotGroupId.value = gid
  draftKeywords.value = appliedKeywords.value
  draftBotGroupId.value = gid || null

  if (gid) {
    clearOrderFilterKeywords()
    saveOrderFilterBotGroupId(gid)
  } else {
    clearOrderFilterBotGroupId()
    if (kw) saveOrderFilterKeywords(kw)
    else clearOrderFilterKeywords()
  }

  markOrderFilterConfigured()
  showFilter.value = false
  await store.setSearch(appliedKeywords.value, gid)
}

const onCancelFilter = () => {
  draftKeywords.value = appliedKeywords.value
  draftBotGroupId.value = appliedBotGroupId.value || null
  showFilter.value = false
}

const filtered = computed(() => {
  if (appliedBotGroupId.value.trim()) return store.mineGroups
  const raw = appliedKeywords.value.trim()
  if (!raw) return store.mineGroups
  return filterGroupsByKeywords(store.mineGroups, raw)
})

const selectedCount = computed(() => store.selected.size)

const allFilteredSelected = computed(
  () => filtered.value.length > 0 && filtered.value.every((g) => store.selected.has(g.id)),
)

const toggleSelectAll = () => {
  if (allFilteredSelected.value) store.clearSelection()
  else store.selectAllVisible(filtered.value)
}

const onSendOnce = async (text: string) => {
  if (!requireTariffForPost()) return
  success.value = ''
  try {
    const res = await store.broadcast(text)
    composeOpen.value = false
    const sent = res.data?.sent ?? 0
    const failed = res.data?.failed ?? 0
    success.value = failed
      ? `${sent} ta guruhga tushdi, ${failed} tasiga tushmadi`
      : `${sent} ta guruhga tushdi`
  } catch { /* */ }
}

const onSaveCampaign = async (payload: {
  name: string
  text: string
  autoRepeat: boolean
  intervalMin: number
}) => {
  if (payload.autoRepeat && !requireTariffForPost()) return
  success.value = ''
  try {
    await store.createCampaign({
      name: payload.name,
      text: payload.text,
      intervalMin: payload.intervalMin,
      start: payload.autoRepeat,
    })
    composeOpen.value = false
    store.clearSelection()
    success.value = payload.autoRepeat
      ? `«${payload.name}» saqlandi va boshlandi`
      : `«${payload.name}» saqlandi`
    setTimeout(() => navigateTo('/driver/campaigns'), 800)
  } catch { /* */ }
}

const onSavePickedGroups = async () => {
  const id = pickCampaignId.value
  if (!id) return
  const campaign = store.campaigns.find((c) => c.id === id)
  if (!campaign) {
    navigateTo('/driver/campaigns')
    return
  }
  success.value = ''
  try {
    await store.updateCampaign(id, {
      name: campaign.name,
      text: campaign.text,
      intervalMin: campaign.intervalMin,
      groupIds: [...store.selected],
    })
    store.clearSelection()
    navigateTo(campaignEditPath(id))
  } catch { /* */ }
}

const goBackFromPick = () => {
  store.clearSelection()
  const id = pickCampaignId.value
  if (id) navigateTo(campaignEditPath(id))
  else navigateTo('/driver/campaigns')
}

const onToggleVisibility = async (g: PostGroup) => {
  try {
    await store.setVisibility(g, !g.visibleToDrivers)
  } catch { /* */ }
}

const onAskLeave = (g: PostGroup) => {
  membershipTarget.value = g
  showLeaveDialog.value = true
}

const onConfirmLeave = async () => {
  const g = membershipTarget.value
  if (!g) return
  try {
    await store.leaveGroup(g)
    showLeaveDialog.value = false
    success.value = `«${g.title}» guruhidan chiqdingiz`
    membershipTarget.value = null
  } catch { /* */ }
}

const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const initPickGroups = async () => {
  if (!pickGroupsMode.value || !pickCampaignId.value) return
  await store.refreshCampaignData()
  const c = store.campaigns.find((x) => x.id === pickCampaignId.value)
  if (c) store.selected = new Set(c.groupIds)
}

onMounted(async () => {
  store.tab = 'mine'

  if (store.isAdmin) {
    const saved = loadOrderFilterKeywords()
    const savedGroup = formatBotGroupIds(parseBotGroupIds(loadOrderFilterBotGroupId()))
    draftKeywords.value = saved
    appliedKeywords.value = saved
    draftBotGroupId.value = savedGroup || null
    appliedBotGroupId.value = savedGroup
    store.search = savedGroup ? '' : saved.trim()
    store.botGroupId = savedGroup
  }

  if (!authStore.user) {
    try { await authStore.getMe() } catch { /* */ }
  }

  await store.load()
  await initPickGroups()

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) store.loadMore()
    },
    { rootMargin: '520px' },
  )
  if (sentinel.value) observer.observe(sentinel.value)
})

let queryTimer: ReturnType<typeof setTimeout> | null = null
watch(groupQuery, (val) => {
  if (queryTimer) clearTimeout(queryTimer)
  queryTimer = setTimeout(() => {
    if (val.trim() === store.query) return
    void store.setQuery(val)
  }, 350)
})

watch(
  () => [route.query.pickGroups, route.query.campaignId] as const,
  () => { void initPickGroups() },
)

onBeforeUnmount(() => {
  if (queryTimer) clearTimeout(queryTimer)
  if (observer) observer.disconnect()
})

usePullToRefresh(async () => {
  await store.load(true)
})

watch(sentinel, (el) => {
  if (observer && el) observer.observe(el)
})
</script>
