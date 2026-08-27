<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-3">
    <header class="sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <h1 class="text-base font-black text-slate-900 dark:text-white">Haydovchilar</h1>
    </header>

    <AdminDriversFilterTabs v-model="filter" :tabs="filterTabs" />

    <AdminDriversSearchInput v-model="search" />

    <AdminDriversSelectBar
      :count="store.total"
      :selected-count="selected.size"
      :all-selected="allSelected"
      @toggle-all="toggleAll"
      @message="openBulkMessage"
    />

    <div v-if="store.isLoading && !list.length" class="space-y-3">
      <div
        v-for="n in 4"
        :key="n"
        class="h-28 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"
      />
    </div>

    <BaseEmptyState
      v-else-if="!list.length"
      icon="fa-solid fa-users"
      title="Haydovchi topilmadi"
      tone="slate"
    />

    <div v-else class="space-y-3">
      <AdminDriversDriverCard
        v-for="d in list"
        :key="d.id"
        :name="d.name"
        :phone="d.phone"
        :avatar="d.avatar"
        :user-id="d.id"
        :active="d.active"
        :listen-groups="!!d.listenGroups"
        :balance="d.balance"
        :tariff-line="d.tariffLine"
        :registered-at="d.registeredAt"
        :selected="selected.has(d.id)"
        @toggle="toggleOne(d.id)"
        @message="openSingleMessage(d)"
        @call="onCall(d)"
        @balance="openBalance(d)"
        @tariff="openTariff(d)"
        @block="onBlock(d)"
        @open="navigateTo(`/driver/user/${encodeURIComponent(d.id)}`)"
      />

      <!-- Infinite scroll sentinel -->
      <div ref="sentinel" class="h-1" />

      <div v-if="store.isLoadingMore" class="space-y-3">
        <div
          v-for="n in 2"
          :key="n"
          class="h-28 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"
        />
      </div>

      <p
        v-else-if="!store.hasMore && list.length"
        class="py-3 text-center text-[12px] font-bold text-slate-400 dark:text-slate-500"
      >
        — Hammasi yuklandi —
      </p>
    </div>

    <p v-if="error" class="text-center text-[12px] font-bold text-red-500">{{ error }}</p>
    <p v-if="success" class="text-center text-[12px] font-bold text-emerald-500">{{ success }}</p>

    <AdminDriversBalanceDialog
      v-model="balanceOpen"
      :name="balanceTarget?.name || ''"
      :balance="balanceTarget?.balance || 0"
      :loading="store.isSaving"
      @confirm="saveBalance"
      @payment="onPaymentPage"
    />

    <AdminDriversTariffDialog
      v-model="tariffOpen"
      :balance="tariffTarget?.balance || 0"
      :tariffs="tariffStore.tariffs"
      :loading="store.isSaving"
      @confirm="saveTariff"
    />

    <AdminDriversMessageDialog
      v-model="messageOpen"
      :count="messageIds.length"
      :loading="store.isSaving"
      @confirm="sendMessages"
    />

    <BaseConfirmDialog
      v-model="blockOpen"
      :title="blockTarget?.active ? 'Bloklash' : 'Blokdan chiqarish'"
      :message="blockTarget
        ? blockTarget.active
          ? `«${blockTarget.name}» ni bloklamoqchimisiz?`
          : `«${blockTarget.name}» ni faollashtirmoqchimisiz?`
        : ''"
      :confirm-text="blockTarget?.active ? 'Blokla' : 'Faollashtir'"
      cancel-text="Bekor"
      :variant="blockTarget?.active ? 'danger' : 'success'"
      :loading="store.isSaving"
      @confirm="confirmBlock"
    />
  </div>
</template>

<script setup lang="ts">
import type { DriverRow, DriverFilter } from '~/stores/driver.store'
import { useDriverStore } from '~/stores/driver.store'
import { useTariffStore } from '~/stores/tariff.store'

definePageMeta({ layout: 'admin' })

const store = useDriverStore()
const tariffStore = useTariffStore()

const filter = ref<DriverFilter>('all')
const search = ref('')
const selected = ref<Set<string>>(new Set())
const error = ref('')
const success = ref('')

const balanceOpen = ref(false)
const balanceTarget = ref<DriverRow | null>(null)

const tariffOpen = ref(false)
const tariffTarget = ref<DriverRow | null>(null)

const messageOpen = ref(false)
const messageIds = ref<string[]>([])

const blockOpen = ref(false)
const blockTarget = ref<DriverRow | null>(null)

const withTariffLine = (d: DriverRow) => {
  if (!d.tariffName || !d.expireAt) return { ...d, tariffLine: undefined as string | undefined }
  const days =
    d.daysLeft == null
      ? ''
      : d.daysLeft < 0
        ? `(muddati o'tgan)`
        : `(${d.daysLeft} kun)`
  return {
    ...d,
    tariffLine: `${d.tariffName} · ${d.expireAt} ${days}`.trim(),
  }
}

const filterTabs = computed(() => [
  {
    value: 'all',
    label: 'Hammasi',
    icon: 'fa-solid fa-users',
    count: store.counts.all,
    tone: 'sky' as const,
  },
  {
    value: 'expiring',
    label: 'Muddat',
    icon: 'fa-solid fa-hourglass-half',
    count: store.counts.expiring,
    tone: 'amber' as const,
  },
  {
    value: 'debt',
    label: 'Qarz',
    icon: 'fa-solid fa-money-bill',
    count: store.counts.debt,
    tone: 'emerald' as const,
  },
])

const list = computed(() => store.drivers.map(withTariffLine))

const allSelected = computed(
  () => list.value.length > 0 && list.value.every(d => selected.value.has(d.id))
)

const toggleOne = (id: string) => {
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selected.value = next
}

const toggleAll = () => {
  if (allSelected.value) {
    selected.value = new Set()
    return
  }
  selected.value = new Set(list.value.map(d => d.id))
}

const LIMIT = 10

const queryParams = () => ({
  limit: LIMIT,
  filter: filter.value,
  search: search.value.trim() || undefined,
})

const load = async () => {
  error.value = ''
  try {
    await store.fetchDrivers({ page: 1, ...queryParams() })
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Haydovchilar yuklanmadi'
  }
}

usePullToRefresh(load)

const loadMore = () => store.loadMore(queryParams())

// --- Infinite scroll (IntersectionObserver) ---
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(filter, () => {
  selected.value = new Set()
  load()
})
watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    selected.value = new Set()
    load()
  }, 350)
})

const onCall = (d: DriverRow) => {
  if (import.meta.client && d.phone) window.location.href = `tel:+${d.phone.replace(/\D/g, '')}`
}

const openBalance = (d: DriverRow) => {
  balanceTarget.value = d
  balanceOpen.value = true
}

const saveBalance = async (amount: number) => {
  if (!balanceTarget.value) return
  error.value = ''
  success.value = ''
  try {
    await store.adjustBalance(balanceTarget.value.id, amount)
    balanceOpen.value = false
    balanceTarget.value = null
    success.value = 'Balans yangilandi'
    await load()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Balans saqlanmadi'
  }
}

const onPaymentPage = () => {
  if (balanceTarget.value?.id) {
    navigateTo(`/admin/pay/${balanceTarget.value.id}`)
  } else {
    navigateTo('/admin/dashboard')
  }
}

const openTariff = async (d: DriverRow) => {
  tariffTarget.value = d
  tariffOpen.value = true
  if (!tariffStore.tariffs.length) {
    try {
      await tariffStore.fetchTariffs()
    } catch {
      /* ignore */
    }
  }
}

const saveTariff = async (payload: { tariffId: string; deductFromBalance: boolean }) => {
  if (!tariffTarget.value) return
  error.value = ''
  success.value = ''
  try {
    await store.assignTariff(tariffTarget.value.id, payload.tariffId, {
      deductFromBalance: payload.deductFromBalance,
    })
    tariffOpen.value = false
    tariffTarget.value = null
    success.value = 'Tarif yangilandi (eski muddat tozalandi)'
    await load()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Tarif biriktirilmadi'
  }
}

const openSingleMessage = async (d: DriverRow) => {
  error.value = ''
  try {
    const res = await useApi('/chats/support', {
      method: 'POST',
      body: { driverUserId: d.id },
    })
    if (res.success && res.data?._id) {
      const name = d.name || 'Haydovchi'
      await navigateTo({
        path: `/driver/chat/${res.data._id}`,
        query: { name, support: '1' },
      })
      return
    }
    error.value = res.message || 'Chat ochilmadi'
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Chat ochilmadi'
  }
}

const openBulkMessage = () => {
  if (!selected.value.size) return
  messageIds.value = [...selected.value]
  messageOpen.value = true
}

const sendMessages = async (text: string) => {
  error.value = ''
  success.value = ''
  try {
    const res = await store.sendMessage(messageIds.value, text)
    messageOpen.value = false
    const sent = res.data?.sent ?? 0
    const failed = res.data?.failed ?? 0
    if (failed && sent) {
      success.value = `${sent} ta yuborildi, ${failed} ta muvaffaqiyatsiz`
    } else if (failed) {
      error.value = res.data?.results?.[0]?.error || 'Xabar yuborilmadi'
    } else {
      success.value = `${sent} ta xabar yuborildi`
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Xabar yuborilmadi'
  }
}

const onBlock = (d: DriverRow) => {
  blockTarget.value = d
  blockOpen.value = true
}

const confirmBlock = async () => {
  if (!blockTarget.value) return
  error.value = ''
  success.value = ''
  try {
    const nextActive = !blockTarget.value.active
    await store.setActive(blockTarget.value.id, nextActive)
    success.value = nextActive ? 'Haydovchi faollashtirildi' : 'Haydovchi bloklandi'
    blockTarget.value = null
    await load()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Amal bajarilmadi'
  }
}

onMounted(() => {
  load()
  tariffStore.fetchTariffs().catch(() => {})

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMore()
    },
    { rootMargin: '200px' }
  )
  if (sentinel.value) observer.observe(sentinel.value)
})

watch(sentinel, (el) => {
  if (observer && el) observer.observe(el)
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  if (searchTimer) clearTimeout(searchTimer)
})
</script>
