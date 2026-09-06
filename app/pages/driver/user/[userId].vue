<template>
  <AuthSessionGate>
    <div class="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-8 space-y-4">
        <header
          class="flex items-center gap-2 sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50"
        >
          <button
            type="button"
            class="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95"
            aria-label="Orqaga"
            @click="goBack"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-left" />
          </button>
          <div class="leading-none min-w-0">
            <h1 class="text-base font-black text-slate-900 dark:text-white truncate">Haydovchi</h1>
            <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 truncate">
              {{ headerSubtitle }}
            </p>
          </div>
        </header>

        <div v-if="loading" class="space-y-3">
          <div class="h-32 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
          <div class="h-40 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
          <div class="h-24 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
        </div>

        <template v-else-if="driver">
          <section
            class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3"
          >
            <div
              class="w-14 h-14 rounded-2xl overflow-hidden bg-emerald-500/15 flex items-center justify-center shrink-0"
            >
              <img
                v-if="avatarSrc"
                :src="avatarSrc"
                :alt="driver.name"
                class="w-full h-full object-cover"
                @error="avatarBroken = true"
              >
              <font-awesome-icon v-else icon="fa-solid fa-car" class="text-emerald-500 text-xl" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-base font-black text-slate-900 dark:text-white truncate">
                    {{ driver.name }}
                  </p>
                  <p class="text-[12px] font-medium text-slate-400">
                    {{ driver.phone || '—' }}
                  </p>
                  <p
                    v-if="driver.username"
                    class="text-[11px] font-semibold text-sky-500 truncate"
                  >
                    @{{ driver.username }}
                  </p>
                </div>
                <span
                  class="shrink-0 inline-flex px-2.5 py-1 rounded-full text-[10px] font-black border"
                  :class="driver.active
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50'
                    : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50'"
                >
                  {{ driver.active ? 'Faol' : 'Faol emas' }}
                </span>
              </div>
              <div class="mt-1.5 flex flex-wrap gap-1.5">
                <span
                  class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black border"
                  :class="driver.listenGroups
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50'
                    : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'"
                >
                  {{ driver.listenGroups ? 'Guruh tinglovchi' : 'Guruh tinglamaydi' }}
                </span>
              </div>
              <p v-if="isAdmin" class="mt-2 text-lg font-black text-sky-500">
                {{ formatMoney(driver.balance) }} so'm
              </p>
            </div>
          </section>

          <DashboardTariffCard
            :name="tariffCard.name"
            :info="tariffCard.info"
            :price="tariffCard.price"
            :expire-days="tariffCard.expireDays"
            :start-date="tariffCard.startDate"
            :end-date="tariffCard.endDate"
            :started-at="tariffCard.startedAt"
            :expire-at="tariffCard.expireAt"
            :active="tariffCard.active"
            :show-buy="isAdmin"
            :inactive-hint="isAdmin"
            @buy="openTariff"
          />

          <DriverProfileInfoGrid
            :assigned-group-title="driver.assignedGroupTitle"
            :region-title="driver.regionTitle"
            :region-slug="driver.regionSlug"
            :registered-at="driver.registeredAt"
            :created-at="driver.createdAt"
            :group-invite-count="driver.groupInviteCount"
            :app-invite-count="driver.appInviteCount"
            :invite-groups="driver.inviteGroups"
          />

          <template v-if="isAdmin">
            <section class="grid grid-cols-1 gap-2">
              <button
                type="button"
                class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all"
                @click="navigateTo(`/admin/pay/${encodeURIComponent(driver.id)}`)"
              >
                <font-awesome-icon icon="fa-solid fa-wallet" />
                Hisobni to'ldirish
              </button>
              <button
                type="button"
                class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all"
                @click="openTariff"
              >
                <font-awesome-icon icon="fa-solid fa-key" />
                Tarifni yangilash
              </button>
              <button
                type="button"
                class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/25 active:scale-[0.98] transition-all"
                @click="deleteOpen = true"
              >
                <font-awesome-icon icon="fa-solid fa-trash" />
                Hisobni o'chirish
              </button>
            </section>

            <section class="grid grid-cols-2 gap-2">
              <button
                type="button"
                class="inline-flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-black bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 active:scale-95 transition-all"
                @click="openChat"
              >
                <font-awesome-icon icon="fa-solid fa-comments" />
                Xabar
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 active:scale-95 transition-all disabled:opacity-40"
                :disabled="!driver.phone"
                @click="onCall"
              >
                <font-awesome-icon icon="fa-solid fa-phone" />
                Qo'ng'iroq
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-black bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 active:scale-95 transition-all"
                @click="balanceOpen = true"
              >
                <font-awesome-icon icon="fa-solid fa-coins" />
                Balans
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-black active:scale-95 transition-all border"
                :class="driver.active
                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'"
                @click="blockOpen = true"
              >
                <font-awesome-icon :icon="driver.active ? 'fa-solid fa-ban' : 'fa-solid fa-circle-check'" />
                {{ driver.active ? 'Blok' : 'Faollashtir' }}
              </button>
              <button
                type="button"
                class="col-span-2 inline-flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-black active:scale-95 transition-all border disabled:opacity-50"
                :class="driver.listenGroups
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25'
                  : 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20'"
                :disabled="store.isSaving"
                @click="toggleListenGroups"
              >
                <font-awesome-icon icon="fa-solid fa-headset" />
                {{ driver.listenGroups ? "Guruh tinglashni o'chirish" : 'Guruh tinglashni yoqish' }}
              </button>
            </section>

            <DriverPaymentHistoryList
              v-if="paymentsApiPath"
              :api-path="paymentsApiPath"
              deletable
              subtitle="Shu haydovchi bo'yicha"
            />
          </template>
        </template>

        <BaseEmptyState
          v-else-if="!loading"
          icon="fa-solid fa-user-slash"
          title="Haydovchi topilmadi"
        />

        <p v-if="error" class="text-center text-[12px] font-bold text-red-500">{{ error }}</p>
        <p v-if="success" class="text-center text-[12px] font-bold text-emerald-500">{{ success }}</p>

        <AdminDriversBalanceDialog
          v-if="isAdmin"
          v-model="balanceOpen"
          :name="driver?.name || ''"
          :balance="driver?.balance ?? 0"
          :loading="store.isSaving"
          @confirm="saveBalance"
          @payment="onPaymentPage"
        />

        <AdminDriversTariffDialog
          v-if="isAdmin"
          v-model="tariffOpen"
          :balance="driver?.balance ?? 0"
          :tariffs="tariffStore.tariffs"
          :loading="store.isSaving"
          @confirm="saveTariff"
        />

        <BaseConfirmDialog
          v-if="isAdmin"
          v-model="blockOpen"
          :title="driver?.active ? 'Bloklash' : 'Blokdan chiqarish'"
          :message="driver
            ? driver.active
              ? `«${driver.name}» ni bloklamoqchimisiz?`
              : `«${driver.name}» ni faollashtirmoqchimisiz?`
            : ''"
          :confirm-text="driver?.active ? 'Blokla' : 'Faollashtir'"
          cancel-text="Bekor"
          :variant="driver?.active ? 'danger' : 'success'"
          :loading="store.isSaving"
          @confirm="confirmBlock"
        />

        <BaseConfirmDialog
          v-if="isAdmin"
          v-model="deleteOpen"
          title="Hisobni o'chirish"
          description="Qaytarib bo'lmaydi"
          :message="driver
            ? `«${driver.name}» hisobi, chatlar, to'lovlar va barcha bog'liq ma'lumotlar o'chiriladi. Davom etasizmi?`
            : ''"
          confirm-text="O'chirish"
          cancel-text="Bekor"
          variant="danger"
          :loading="deleting"
          :close-on-confirm="false"
          @confirm="confirmDelete"
        />
      </div>
    </div>
  </AuthSessionGate>
</template>

<script setup lang="ts">
import type { DriverRow } from '~/stores/driver.store'
import { useAuthStore } from '~/stores/auth.store'
import { useDriverStore } from '~/stores/driver.store'
import { useTariffStore } from '~/stores/tariff.store'
import { isTariffActive } from '~/utils/tariffActive'
import { isAdminUser } from '~/utils/userRole'

definePageMeta({ layout: false })

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const store = useDriverStore()
const tariffStore = useTariffStore()

const isAdmin = computed(() => isAdminUser(authStore.user))
const headerSubtitle = computed(() =>
  isAdmin.value ? 'Boshqaruv sahifasi' : 'Haydovchi profili',
)

const userId = computed(() => decodeURIComponent(String(route.params.userId || '')).trim())
const paymentsApiPath = computed(() =>
  isAdmin.value && userId.value
    ? `/drivers/${encodeURIComponent(userId.value)}/payments`
    : '',
)

const driver = ref<DriverRow | null>(null)
const loading = ref(true)
const deleting = ref(false)
const error = ref('')
const success = ref('')
const balanceOpen = ref(false)
const tariffOpen = ref(false)
const blockOpen = ref(false)
const deleteOpen = ref(false)

const { avatarUrl } = useMediaUrl()
const avatarBroken = ref(false)
watch(driver, () => { avatarBroken.value = false })
const avatarSrc = computed(() =>
  avatarBroken.value
    ? undefined
    : avatarUrl(driver.value?.avatar, driver.value?.id || userId.value)
)

const formatMoney = (n: number) => (n ?? 0).toLocaleString('ru-RU')

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('uz-UZ')
}

const tariffCard = computed(() => {
  const d = driver.value
  const t = d?.tariff
  const expireAt = d?.tariffExpireAt || null
  const startedAt = d?.startedAt || null
  const active = isTariffActive({
    active: d?.active,
    tariff: t || (d?.tariffName ? { name: d.tariffName } : null),
    tariffExpireAt: expireAt,
  })
  return {
    name: t?.name || d?.tariffName || 'Tarif ulanmagan',
    info: t?.info || (d?.tariffName ? 'Joriy tarif' : 'Tarif biriktirilmagan'),
    price: t?.price ?? 0,
    expireDays: t?.expireDays ?? Math.max(1, d?.daysLeft ?? 1),
    startDate: formatDate(startedAt),
    endDate: d?.expireAt || formatDate(expireAt),
    startedAt,
    expireAt,
    active,
  }
})

const goBack = () => {
  if (import.meta.client && window.history.length > 1) router.back()
  else if (isAdmin.value) navigateTo('/admin/drivers')
  else navigateTo('/driver/dashboard')
}

const load = async () => {
  loading.value = true
  error.value = ''
  driver.value = null
  if (!userId.value) {
    error.value = 'Haydovchi ID yo\'q'
    loading.value = false
    return
  }
  const apiPath = isAdmin.value
    ? `/drivers/${encodeURIComponent(userId.value)}`
    : `/drivers/${encodeURIComponent(userId.value)}/profile`
  try {
    const res = await useApi(apiPath)
    if (res?.success) driver.value = res.data
    else error.value = res?.message || 'Haydovchi topilmadi'
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Ma\'lumot yuklanmadi'
  } finally {
    loading.value = false
  }
}

const openChat = async () => {
  if (!driver.value || !isAdmin.value) return
  error.value = ''
  try {
    const res = await useApi('/chats/support', {
      method: 'POST',
      body: { driverUserId: driver.value.id },
    })
    if (res.success && res.data?._id) {
      await navigateTo({
        path: `/driver/chat/${res.data._id}`,
        query: { name: driver.value.name || 'Haydovchi', support: '1' },
      })
      return
    }
    error.value = res.message || 'Chat ochilmadi'
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Chat ochilmadi'
  }
}

const onCall = () => {
  const phone = driver.value?.phone
  if (import.meta.client && phone) {
    window.location.href = `tel:+${phone.replace(/\D/g, '')}`
  }
}

const saveBalance = async (amount: number) => {
  if (!driver.value || !isAdmin.value) return
  error.value = ''
  success.value = ''
  try {
    await store.adjustBalance(driver.value.id, amount)
    balanceOpen.value = false
    success.value = 'Balans yangilandi'
    await load()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Balans saqlanmadi'
  }
}

const onPaymentPage = () => {
  if (driver.value?.id && isAdmin.value) {
    navigateTo(`/admin/pay/${encodeURIComponent(driver.value.id)}`)
  }
}

const openTariff = async () => {
  if (!isAdmin.value) return
  tariffOpen.value = true
  if (!tariffStore.tariffs.length) {
    try {
      await tariffStore.fetchTariffs()
    } catch { /* */ }
  }
}

const saveTariff = async (payload: { tariffId: string; deductFromBalance: boolean }) => {
  if (!driver.value || !isAdmin.value) return
  error.value = ''
  success.value = ''
  try {
    await store.assignTariff(driver.value.id, payload.tariffId, {
      deductFromBalance: payload.deductFromBalance,
    })
    tariffOpen.value = false
    success.value = 'Tarif yangilandi'
    await load()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Tarif biriktirilmadi'
  }
}

const confirmBlock = async () => {
  if (!driver.value || !isAdmin.value) return
  error.value = ''
  success.value = ''
  try {
    await store.setActive(driver.value.id, !driver.value.active)
    blockOpen.value = false
    success.value = driver.value.active ? 'Bloklandi' : 'Faollashtirildi'
    await load()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Saqlanmadi'
  }
}

const toggleListenGroups = async () => {
  if (!driver.value || !isAdmin.value) return
  error.value = ''
  success.value = ''
  const next = !driver.value.listenGroups
  try {
    await store.setListenGroups(driver.value.id, next)
    success.value = next
      ? 'Guruh tinglash yoqildi — userbot endi tinglaydi'
      : 'Guruh tinglash o‘chirildi'
    await load()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Tinglash sozlamasi saqlanmadi'
  }
}

const confirmDelete = async () => {
  if (!driver.value || !isAdmin.value) return
  error.value = ''
  deleting.value = true
  try {
    await store.deleteDriver(driver.value.id)
    deleteOpen.value = false
    await navigateTo('/admin/drivers')
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'O\'chirib bo\'lmadi'
  } finally {
    deleting.value = false
  }
}

watch(userId, () => { void load() }, { immediate: true })
watch(isAdmin, () => { void load() })

usePullToRefresh(load)
</script>
