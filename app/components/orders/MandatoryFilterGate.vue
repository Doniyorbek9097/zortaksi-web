<template>
  <OrdersFilterPanel
    v-if="showGate"
    mandatory
    v-model="draftKeywords"
    v-model:bot-group-id="draftBotGroupId"
    @save="onSave"
  />
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'
import { useOrderStore } from '~/stores/order.store'
import { usePostStore } from '~/stores/post.store'
import {
  loadOrderFilterKeywords,
  loadOrderFilterBotGroupId,
  parseBotGroupIds,
  formatBotGroupIds,
  saveOrderFilterKeywords,
  saveOrderFilterBotGroupId,
  clearOrderFilterKeywords,
  clearOrderFilterBotGroupId,
  markOrderFilterConfigured,
  isOrderFilterConfigured,
  ORDERS_PAGE_LIMIT,
} from '~/utils/orderFilterKeywords'

const authStore = useAuthStore()
const orderStore = useOrderStore()
const postStore = usePostStore()

const draftKeywords = ref('')
const draftBotGroupId = ref<string | null>(null)

const showGate = computed(() => {
  if (!import.meta.client || !authStore.sessionReady) return false
  if (authStore.user?.role === 'admin') return false
  return !isOrderFilterConfigured()
})

const onSave = async () => {
  const kw = draftKeywords.value.trim()
  const gid = formatBotGroupIds(parseBotGroupIds(String(draftBotGroupId.value || '')))

  if (kw && !gid) saveOrderFilterKeywords(kw)
  else clearOrderFilterKeywords()

  if (gid) {
    saveOrderFilterBotGroupId(gid)
    clearOrderFilterKeywords()
  } else {
    clearOrderFilterBotGroupId()
  }

  markOrderFilterConfigured()

  orderStore.applyListFilter({
    page: 1,
    limit: ORDERS_PAGE_LIMIT,
    ...(gid ? { botGroupId: gid } : { search: kw || undefined }),
  })

  orderStore.orders = []
  void orderStore.fetchOrders({
    page: 1,
    limit: ORDERS_PAGE_LIMIT,
    ...(gid ? { botGroupId: gid } : { search: kw || undefined }),
  })
  void postStore.setSearch(gid ? '' : kw, gid)
}

watch(
  showGate,
  (v) => {
    if (!v) return
    draftKeywords.value = loadOrderFilterKeywords()
    draftBotGroupId.value = formatBotGroupIds(parseBotGroupIds(loadOrderFilterBotGroupId())) || null
  },
  { immediate: true },
)
</script>
