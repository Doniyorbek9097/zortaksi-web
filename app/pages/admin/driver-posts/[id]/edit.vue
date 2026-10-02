<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <header class="sticky top-0 z-30 -mx-4 px-4 py-2 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          @click="navigateTo('/admin/driver-posts')"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="text-sm" />
        </button>
        <div class="min-w-0 flex-1">
          <h1 class="text-base font-black text-slate-900 dark:text-white truncate">E'lonni tahrirlash</h1>
          <p v-if="campaign" class="text-[10px] font-semibold text-slate-400 truncate mt-0.5">
            {{ campaign.owner.name }} · {{ campaign.name }}
          </p>
        </div>
      </div>
    </header>

    <div v-if="loading" class="h-48 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />

    <BaseEmptyState
      v-else-if="!campaign"
      icon="fa-solid fa-bullhorn"
      title="E'lon topilmadi"
      tone="slate"
    />

    <template v-else>
      <input
        v-model="name"
        type="text"
        maxlength="80"
        placeholder="Nom"
        class="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
      >
      <CommonTelegramHtmlEditor
        v-model="text"
        label="E'lon matni"
        toolbar="static"
        :rows="6"
        hide-hint
        placeholder="Haydovchi matni"
      />
      <input
        v-model.number="intervalMin"
        type="number"
        min="10"
        max="1440"
        class="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
      >
      <p class="text-[10px] text-slate-400">
        Minimal interval: 10 daqiqa · Guruhlar: {{ campaign.groupCount }}
      </p>
      <button
        type="button"
        class="w-full py-3 rounded-xl text-sm font-black text-white bg-sky-500 disabled:opacity-50"
        :disabled="store.isSaving"
        @click="onSave"
      >
        Saqlash
      </button>
    </template>

    <p v-if="store.error" class="text-center text-[12px] font-bold text-red-500">{{ store.error }}</p>
  </div>
</template>

<script setup lang="ts">
import {
  useAdminDriverPostsStore,
  type AdminDriverPostCampaign,
} from '~/stores/adminDriverPosts.store'
import { MIN_POST_INTERVAL_MIN } from '~/stores/post.store'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const store = useAdminDriverPostsStore()
const campaignId = computed(() => String(route.params.id || ''))

const loading = ref(true)
const campaign = ref<AdminDriverPostCampaign | null>(null)
const name = ref('')
const text = ref('')
const intervalMin = ref(MIN_POST_INTERVAL_MIN)

const hydrateForm = (c: AdminDriverPostCampaign) => {
  name.value = c.name
  text.value = c.text || c.textPreview
  intervalMin.value = Math.max(MIN_POST_INTERVAL_MIN, c.intervalMin)
}

const onSave = async () => {
  if (!campaignId.value) return
  await store.updateCampaign(campaignId.value, {
    name: name.value.trim(),
    text: text.value.trim(),
    intervalMin: Math.max(MIN_POST_INTERVAL_MIN, Math.round(intervalMin.value)),
  })
  navigateTo('/admin/driver-posts')
}

onMounted(async () => {
  try {
    const cached = store.items.find((c) => c.id === campaignId.value)
    campaign.value = cached || (await store.fetchCampaignById(campaignId.value))
    if (campaign.value) hydrateForm(campaign.value)
  } catch {
    campaign.value = null
  } finally {
    loading.value = false
  }
})
</script>
