<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-6 space-y-4">
    <header class="flex items-center gap-2 sticky top-0 z-30 -mx-4 px-4 py-2 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <button
        type="button"
        class="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-slate-900 active:scale-95"
        @click="goBack"
      >
        <font-awesome-icon icon="fa-solid fa-arrow-left" class="text-sm" />
      </button>
      <div class="min-w-0 flex-1">
        <h1 class="text-base font-black text-slate-900 dark:text-white truncate">E'lonni tahrirlash</h1>
        <p v-if="campaign" class="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">
          {{ campaign.name }}
        </p>
      </div>
    </header>

    <div v-if="pageLoading" class="h-48 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />

    <BaseEmptyState
      v-else-if="!campaign"
      icon="fa-solid fa-bullhorn"
      title="E'lon topilmadi"
      tone="slate"
    />

    <template v-else>
      <section class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 shadow-sm">
        <div class="space-y-1">
          <label class="px-1 text-[11px] font-semibold text-slate-500">E'lon nomi</label>
          <input
            v-model="name"
            type="text"
            maxlength="80"
            class="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
        </div>

        <div class="space-y-1">
          <label class="px-1 text-[11px] font-semibold text-slate-500">E'lon matni</label>
          <textarea
            v-model="text"
            rows="6"
            class="w-full px-3.5 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
        </div>

        <label class="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            v-model="autoRepeat"
            type="checkbox"
            class="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
          >
          <span class="text-[12px] font-bold text-slate-700 dark:text-slate-200">
            Avtomatik yuborish (faol e'lon)
          </span>
        </label>

        <div v-if="autoRepeat" class="space-y-1">
          <label class="px-1 text-[11px] font-semibold text-slate-500">
            Har necha daqiqada bir marta
          </label>
          <input
            v-model.number="intervalMin"
            type="number"
            min="10"
            max="1440"
            class="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
          <p class="px-1 text-[10px] font-semibold text-slate-400 leading-snug">
            Avto-yuborish 12 soat ishlaydi, keyin avtomatik to'xtaydi.
          </p>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-[12px] font-black text-slate-800 dark:text-slate-100">Guruhlar</p>
            <p class="text-[11px] font-semibold text-slate-500 mt-0.5">
              {{ groupCount }} ta guruh tanlangan
            </p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-900/50 bg-sky-500/5 active:scale-95"
            @click="onPickGroups"
          >
            <font-awesome-icon icon="fa-solid fa-users" class="text-[10px]" />
            Guruhlarni tanlash
          </button>
        </div>
      </section>

      <div class="flex flex-col gap-2">
        <button
          type="button"
          class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-white bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-50"
          :disabled="saving || !canSave"
          @click="onSave"
        >
          <font-awesome-icon
            :icon="saving ? 'fa-solid fa-spinner' : 'fa-solid fa-floppy-disk'"
            :class="saving ? 'animate-spin' : ''"
          />
          Saqlash
        </button>
        <button
          v-if="campaign.active"
          type="button"
          class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 bg-rose-500/5 active:scale-[0.98] disabled:opacity-50"
          :disabled="saving"
          @click="onStop"
        >
          <font-awesome-icon icon="fa-solid fa-pause" />
          To'xtatish
        </button>
        <button
          v-else-if="autoRepeat"
          type="button"
          class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-white bg-amber-500 hover:bg-amber-600 active:scale-[0.98] disabled:opacity-50"
          :disabled="saving || !canSave"
          @click="onSaveAndStart"
        >
          <font-awesome-icon icon="fa-solid fa-play" />
          Saqlash va boshlash
        </button>
      </div>

      <p v-if="success" class="text-center text-[12px] font-bold text-emerald-500">{{ success }}</p>
      <p v-if="store.error" class="text-center text-[12px] font-bold text-rose-500">{{ store.error }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { usePostStore, MIN_POST_INTERVAL_MIN } from '~/stores/post.store'
import { useAuthStore } from '~/stores/auth.store'

definePageMeta({ layout: 'driver' })

const route = useRoute()
const store = usePostStore()
const authStore = useAuthStore()

const campaignId = computed(() => decodeURIComponent(String(route.params.id || '')))
const pageLoading = ref(true)
const saving = ref(false)
const success = ref('')

const name = ref('')
const text = ref('')
const autoRepeat = ref(false)
const intervalMin = ref(MIN_POST_INTERVAL_MIN)
const groupIds = ref<string[]>([])

const campaign = computed(() => store.campaigns.find((c) => c.id === campaignId.value) || null)
const groupCount = computed(() => groupIds.value.length)

const POST_TARIFF_PAYMENT_PATH = '/driver/payment?tab=tariff&next=' + encodeURIComponent(route.fullPath)

const canSave = computed(
  () => name.value.trim() && text.value.trim() && (!autoRepeat.value || intervalMin.value >= MIN_POST_INTERVAL_MIN),
)

const requireTariff = () => {
  if (store.isAdmin || authStore.tariffActive) return true
  navigateTo(POST_TARIFF_PAYMENT_PATH)
  return false
}

const fillForm = (c: NonNullable<typeof campaign.value>) => {
  name.value = c.name || ''
  text.value = c.text || ''
  autoRepeat.value = !!c.active
  intervalMin.value = Math.max(MIN_POST_INTERVAL_MIN, c.intervalMin || MIN_POST_INTERVAL_MIN)
  groupIds.value = [...(c.groupIds || [])]
}

const loadPage = async () => {
  pageLoading.value = true
  try {
    if (!authStore.user) await authStore.getMe().catch(() => {})
    await store.refreshCampaignData()
    if (campaign.value) fillForm(campaign.value)
    else if (store.selected.size && route.query.pickGroups !== '1') {
      groupIds.value = [...store.selected]
    }
  } finally {
    pageLoading.value = false
  }
}

const goBack = () => {
  navigateTo('/driver/campaigns')
}

const onPickGroups = () => {
  store.selected = new Set(groupIds.value)
  navigateTo(`/driver/post?campaignId=${encodeURIComponent(campaignId.value)}&pickGroups=1`)
}

const onSave = async () => {
  if (!campaign.value || !canSave.value) return
  saving.value = true
  success.value = ''
  try {
    await store.updateCampaign(campaign.value.id, {
      name: name.value.trim(),
      text: text.value.trim(),
      intervalMin: Math.max(MIN_POST_INTERVAL_MIN, Math.round(intervalMin.value || MIN_POST_INTERVAL_MIN)),
      groupIds: groupIds.value,
    })
    if (autoRepeat.value && !campaign.value.active) {
      if (!requireTariff()) return
      await store.startCampaign(campaign.value.id)
    }
    if (!autoRepeat.value && campaign.value.active) {
      await store.stopCampaign(campaign.value.id)
    }
    success.value = 'E\'lon yangilandi'
    setTimeout(() => navigateTo('/driver/campaigns'), 600)
  } catch { /* */ } finally {
    saving.value = false
  }
}

const onSaveAndStart = async () => {
  if (!requireTariff()) return
  autoRepeat.value = true
  await onSave()
}

const onStop = async () => {
  if (!campaign.value) return
  saving.value = true
  try {
    await store.stopCampaign(campaign.value.id)
    autoRepeat.value = false
    success.value = 'E\'lon to\'xtatildi'
  } catch { /* */ } finally {
    saving.value = false
  }
}

watch(campaign, (c) => {
  if (c) fillForm(c)
})

onMounted(() => {
  void loadPage()
})

onActivated(() => {
  if (campaign.value) {
    groupIds.value = store.selected.size ? [...store.selected] : [...(campaign.value.groupIds || [])]
  }
})
</script>
