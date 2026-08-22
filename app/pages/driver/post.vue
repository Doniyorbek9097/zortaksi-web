<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-4 space-y-3">
    <!-- Header -->
    <header class="flex items-center justify-between gap-2 sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <div class="min-w-0 leading-none">
        <h1 class="text-base font-black text-slate-900 dark:text-white">E'lon joylash</h1>
        <p class="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">
          Hududlar Buyurtmalar bilan umumiy
        </p>
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
          Hudud belgilash
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

    <OrdersFilterPanel
      v-if="store.isAdmin && showFilter"
      v-model="draftKeywords"
      v-model:bot-group-id="draftBotGroupId"
      @save="onSaveFilter"
      @cancel="onCancelFilter"
    />

    <!-- Tabs: Meniki / Boshqalar -->
    <div class="flex gap-2">
      <button
        type="button"
        class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-black border transition-all"
        :class="store.tab === 'mine'
          ? 'border-sky-400 bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400'
          : 'border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-slate-900'"
        @click="store.setTab('mine')"
      >
        <font-awesome-icon icon="fa-solid fa-check" class="text-[10px]" />
        Meniki {{ store.mineTotal }}
      </button>
      <button
        type="button"
        class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-black border transition-all"
        :class="store.tab === 'ads'
          ? 'border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
          : 'border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-slate-900'"
        @click="store.setTab('ads')"
      >
        <font-awesome-icon icon="fa-solid fa-users" class="text-[10px]" />
        Boshqalar {{ store.adsTotal }}
      </button>
    </div>

    <p
      v-if="store.tab === 'ads'"
      class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-snug"
    >
      Faqat public guruhlar (@username) va yozish mumkin bo'lganlari.
      Yozish taqiqlangan guruhlar ko'rsatilmaydi.
      <span v-if="!store.isAdmin">
        Xabar yuborish: {{ ADS_BROADCAST_PRICE.toLocaleString('ru-RU') }} so'm/guruh.
      </span>
      «Guruhga qo'shilish» orqali Meniki ga ham qo'shishingiz mumkin.
    </p>
    <p
      v-else-if="store.tab === 'mine' && store.isAdmin"
      class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-snug"
    >
      Admin guruhlarda ko'z belgisini bosing — ochilganlari haydovchilar Boshqalar tabida ko'rinadi.
    </p>

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

    <!-- Count + select -->
    <div class="flex items-center justify-between gap-2">
      <p class="text-[12px] font-bold text-slate-400">
        {{ selectedCount }} tanlangan · {{ filtered.length }}/{{ store.totalGroups }} ko'rsatildi
      </p>
      <button
        type="button"
        class="px-2.5 py-1 rounded-lg text-[11px] font-black border border-slate-200 dark:border-slate-700 text-slate-500"
        @click="toggleSelectAll"
      >
        {{ allFilteredSelected ? 'Bekor' : 'Hammasi' }}
      </button>
    </div>

    <!-- List -->
    <div v-if="store.isLoading" class="space-y-3">
      <div
        v-for="n in 5"
        :key="n"
        class="h-[88px] rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"
      />
    </div>

    <BaseEmptyState
      v-else-if="!filtered.length"
      icon="fa-solid fa-bullhorn"
      :title="emptyTitle"
      tone="slate"
    />

    <div v-else class="space-y-2.5">
      <PostGroupCard
        v-for="g in filtered"
        :key="g.id"
        :group="g"
        :selectable="true"
        :selected="store.selected.has(g.id)"
        :show-admin-badge="store.tab === 'mine'"
        :show-visible-badge="store.tab === 'mine' && store.isAdmin"
        :show-join="store.tab === 'ads'"
        :joining="store.joiningId === g.id"
        :show-leave="store.tab === 'mine'"
        :leaving="store.joiningId === g.id"
        :show-visibility="store.tab === 'mine' && store.isAdmin && g.isAdmin"
        @toggle="store.toggle(g.id)"
        @join="onJoinGroup(g)"
        @leave="onAskLeave(g)"
        @toggle-visibility="onToggleVisibility(g)"
      />

      <div ref="sentinel" class="h-1" />

      <div v-if="store.isLoadingMore" class="space-y-2.5 pt-1">
        <div
          v-for="n in 2"
          :key="n"
          class="h-[88px] rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"
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

    <!-- Fixed send / block -->
    <Teleport to="body">
      <div
        v-if="selectedCount > 0"
        class="fixed bottom-20 inset-x-0 z-[60] px-4 pointer-events-none"
      >
        <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl pointer-events-auto">
          <div
            v-if="store.tab === 'ads'"
            class="flex gap-2"
          >
            <button
              type="button"
              class="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black text-white bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-500/30 active:scale-[0.98] transition-all"
              @click="composeOpen = true"
            >
              <font-awesome-icon icon="fa-solid fa-paper-plane" />
              Xabar yuborish
              <span v-if="store.pricePerGroup > 0" class="text-[11px] opacity-90">
                ({{ store.totalCost.toLocaleString('ru-RU') }} so'm)
              </span>
            </button>
            <button
              v-if="store.isAdmin"
              type="button"
              class="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl text-sm font-black text-white bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-600/30 active:scale-[0.98] transition-all disabled:opacity-60"
              :disabled="store.isBlocking"
              @click="blockOpen = true"
            >
              <font-awesome-icon
                :icon="store.isBlocking ? 'fa-solid fa-spinner' : 'fa-solid fa-ban'"
                :class="store.isBlocking ? 'animate-spin' : ''"
              />
              Bloklash
            </button>
          </div>
          <button
            v-else
            type="button"
            class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black text-white bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-500/30 active:scale-[0.98] transition-all"
            @click="composeOpen = true"
          >
            <font-awesome-icon icon="fa-solid fa-paper-plane" />
            {{ selectedCount }} guruhga xabar yuborish
          </button>
        </div>
      </div>
    </Teleport>

    <PostComposeDialog
      v-model="composeOpen"
      :count="selectedCount"
      :cost="store.totalCost"
      :loading="store.isSending"
      @confirm="onSend"
    />

    <PostMembershipDialog
      v-model="showJoinDialog"
      title="Guruhga qo'shilish"
      :message="joinMessage"
      confirm-text="Qo'shilish"
      variant="success"
      :loading="!!store.joiningId"
      :group="membershipTarget"
      @confirm="onConfirmJoin"
      @cancel="membershipTarget = null"
    />

    <PostMembershipDialog
      v-model="showLeaveDialog"
      title="Guruhni tark etish"
      :message="leaveMessage"
      confirm-text="Tark etish"
      variant="warning"
      :loading="!!store.joiningId"
      :group="membershipTarget"
      @confirm="onConfirmLeave"
      @cancel="membershipTarget = null"
    />
    <BaseConfirmDialog
      v-model="blockOpen"
      title="Guruhlarni bloklash"
      description="Bu guruhlardan boshqa buyurtma olinmaydi"
      :message="`${selectedCount} ta guruh bloklansinmi?`"
      confirm-text="Bloklash"
      cancel-text="Bekor"
      variant="danger"
      :loading="store.isBlocking"
      :close-on-confirm="false"
      @confirm="onBlock"
      @cancel="blockOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { usePostStore, type PostGroup, ADS_BROADCAST_PRICE } from '~/stores/post.store'
import { useAuthStore } from '~/stores/auth.store'
import {
  loadOrderFilterKeywords,
  loadOrderFilterBotGroupId,
  saveOrderFilterKeywords,
  saveOrderFilterBotGroupId,
  clearOrderFilterBotGroupId,
  clearOrderFilterKeywords,
  markOrderFilterConfigured,
} from '~/utils/orderFilterKeywords'

definePageMeta({ layout: 'driver' })

const store = usePostStore()
const authStore = useAuthStore()

const composeOpen = ref(false)
const blockOpen = ref(false)
const success = ref('')
const groupQuery = ref('')
const showFilter = ref(false)
const draftKeywords = ref('')
const draftBotGroupId = ref<string | null>(null)
const appliedKeywords = ref('')
const appliedBotGroupId = ref('')
const filterActive = computed(
  () => !!appliedBotGroupId.value.trim() || !!appliedKeywords.value.trim(),
)
const showJoinDialog = ref(false)
const showLeaveDialog = ref(false)
const membershipTarget = ref<PostGroup | null>(null)

const joinMessage = computed(() => (
  `Guruhga a'zo bo'lasiz.\n\n` +
  `• Shu guruhdan keladigan buyurtmalarni 100% olasiz (Meniki bo'limida).\n` +
  `• E'lon yuborganingizda xabar o'zingizning Telegram nomingizdan ketadi.\n\n` +
  `Davom etasizmi?`
))

const leaveMessage = computed(() => (
  `Guruhdan chiqasiz.\n\n` +
  `• Shu guruhdan buyurtma olish foizi kamayishi mumkin (Boshqalar bo'limiga tushadi).\n` +
  `• Xabarlaringiz boshqa haydovchilar / userbot nomidan ketishi mumkin.\n` +
  `• To'liq qulaylik uchun guruhda a'zo bo'lib qolish tavsiya etiladi.\n\n` +
  `Baribir tark etasizmi?`
))

const onSaveFilter = async () => {
  const kw = draftKeywords.value.trim()
  const gid = kw ? String(draftBotGroupId.value || '').trim() : ''

  appliedKeywords.value = kw
  appliedBotGroupId.value = gid
  draftKeywords.value = kw
  draftBotGroupId.value = gid || null

  if (kw) saveOrderFilterKeywords(kw)
  else clearOrderFilterKeywords()

  if (gid) saveOrderFilterBotGroupId(gid)
  else clearOrderFilterBotGroupId()

  markOrderFilterConfigured()

  showFilter.value = false
  await store.setSearch(kw, gid)
}

const onCancelFilter = () => {
  draftKeywords.value = appliedKeywords.value
  draftBotGroupId.value = appliedBotGroupId.value || null
  showFilter.value = false
}

const filtered = computed(() => {
  if (appliedBotGroupId.value.trim()) return store.groups
  const raw = appliedKeywords.value.trim()
  if (!raw) return store.groups
  return filterGroupsByKeywords(store.groups, raw)
})

const emptyTitle = computed(() => {
  if (store.tab === 'mine') {
    return "Guruhlar topilmadi — Telegram sessiyangizni tekshiring"
  }
  if (store.isAdmin) return 'Guruhlar topilmadi'
  return "Qo'shilish uchun guruh qolmadi"
})

const selectedCount = computed(() => store.selected.size)

const allFilteredSelected = computed(
  () => filtered.value.length > 0 && filtered.value.every(g => store.selected.has(g.id))
)

const toggleSelectAll = () => {
  if (allFilteredSelected.value) store.clearSelection()
  else store.selectAllVisible(filtered.value)
}

const onSend = async (text: string) => {
  success.value = ''
  try {
    const res = await store.broadcast(text)
    composeOpen.value = false
    const sent = res.data?.sent ?? 0
    const failed = res.data?.failed ?? 0
    const charged = res.data?.charged ?? 0
    if (failed) {
      success.value = `${sent} ta guruhga tushdi, ${failed} tasiga tushmadi`
      if (charged) success.value += ` · ${charged.toLocaleString('ru-RU')} so'm yechildi`
    } else {
      success.value = `${sent} ta guruhga tushdi`
      if (charged) success.value += ` · ${charged.toLocaleString('ru-RU')} so'm yechildi`
    }
  } catch {
    /* error in store */
  }
}

const onBlock = async () => {
  success.value = ''
  const n = selectedCount.value
  try {
    const res = await store.blockGroups()
    blockOpen.value = false
    success.value = `${res?.data?.blocked ?? n} ta guruh bloklandi`
  } catch {
    /* store error */
  }
}

const onToggleVisibility = async (g: any) => {
  try {
    await store.setVisibility(g, !g.visibleToDrivers)
  } catch {
    /* store error */
  }
}

const onJoinGroup = (g: PostGroup) => {
  membershipTarget.value = g
  showJoinDialog.value = true
}

const onAskLeave = (g: PostGroup) => {
  membershipTarget.value = g
  showLeaveDialog.value = true
}

const onConfirmJoin = async () => {
  const g = membershipTarget.value
  if (!g) return
  try {
    await store.joinGroup(g)
    showJoinDialog.value = false
    success.value = `«${g.title}» Meniki ga qo'shildi`
    membershipTarget.value = null
  } catch {
    /* store error */
  }
}

const onConfirmLeave = async () => {
  const g = membershipTarget.value
  if (!g) return
  try {
    await store.leaveGroup(g)
    showLeaveDialog.value = false
    success.value = `«${g.title}» guruhidan chiqdingiz`
    membershipTarget.value = null
  } catch {
    /* store error */
  }
}

const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(async () => {
  if (store.isAdmin) {
    const saved = loadOrderFilterKeywords()
    const savedGroup = loadOrderFilterBotGroupId()
    draftKeywords.value = saved
    appliedKeywords.value = saved
    draftBotGroupId.value = savedGroup || null
    appliedBotGroupId.value = savedGroup
    store.search = savedGroup ? '' : saved.trim()
    store.botGroupId = savedGroup
  }

  if (!authStore.user) {
    try { await authStore.getMe() } catch { /* ignore */ }
  }
  await store.load()

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) store.loadMore()
    },
    { rootMargin: '200px' }
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

onBeforeUnmount(() => {
  if (queryTimer) clearTimeout(queryTimer)
  if (observer) observer.disconnect()
})

usePullToRefresh(() => store.load(true))

watch(sentinel, (el) => {
  if (observer && el) observer.observe(el)
})
</script>
