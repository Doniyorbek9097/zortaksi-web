<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-3">
    <AdminBotGroupsPageHeader :count="store.regionCards.length" />

    <AdminBotGroupsCreateForm
      v-model="form"
      :editing="editingSlug != null"
      :editing-slug="editingSlug"
      :editing-has-token="editingHasToken"
      :editing-token-masked="editingTokenMasked"
      :listener-candidates="store.listenerCandidates"
      :show-listener-select="showListenerSelect"
      :show-private-section="showPrivateSection"
      :token-usage="tokenUsage"
      :tariffs="tariffStore.tariffs"
      :saving="store.isSaving"
      @submit="onSubmit"
      @cancel="resetForm"
    />

    <div v-if="store.isLoading" class="space-y-3">
      <div
        v-for="n in 3"
        :key="n"
        class="h-44 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"
      />
    </div>

    <BaseEmptyState
      v-else-if="!store.regionCards.length"
      icon="fa-solid fa-bullhorn"
      title="Hali hudud yo'q"
      subtitle="Yuqoridagi forma orqali birinchi juftlikni qo'shing"
      tone="slate"
    />

    <div v-else class="space-y-3">
      <AdminBotGroupsRegionCard
        v-for="card in store.regionCards"
        :key="card.slug"
        :card="card"
        :listener-label="listenerLabel(card.listenerUserId)"
        :tariff-labels="tariffLabels(card.tariffIds)"
        :refreshing-id="refreshingId"
        @edit="startEdit(card)"
        @delete="askDelete(card)"
        @refresh="onRefresh"
      />
    </div>

    <p v-if="error" class="text-center text-[12px] font-bold text-red-500 px-2">{{ error }}</p>

    <BaseConfirmDialog
      v-model="deleteOpen"
      title="Hududni o'chirish"
      :message="deleteTarget ? `«${deleteTarget.title}» (${deleteTarget.slug}) o'chirilsinmi?` : ''"
      confirm-text="O'chir"
      cancel-text="Bekor qilish"
      variant="danger"
      :loading="store.isSaving"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { BotGroupFormModel } from '~/components/admin/bot-groups/CreateForm.vue'
import type { BotGroupRow, BotRegionCard } from '~/stores/bot-group.store'
import { useBotGroupStore } from '~/stores/bot-group.store'
import { useTariffStore } from '~/stores/tariff.store'
import { useAuthStore } from '~/stores/auth.store'
import { isAdminUser } from '~/utils/userRole'

definePageMeta({ layout: 'admin' })

const store = useBotGroupStore()
const tariffStore = useTariffStore()
const authStore = useAuthStore()

const isMainAdmin = computed(() => isAdminUser(authStore.user))
const showListenerSelect = computed(() => isMainAdmin.value)

const tokenUsage = ref<{
  publicCount: number
  privateCount: number
  hasPrivate: boolean
  canAddPublic: boolean
  maxPublic: number
  maxPrivate: number
} | null>(null)

const showPrivateSection = computed(() => {
  if (editingSlug.value) return true
  if (!form.value.botToken.trim()) return true
  return !tokenUsage.value?.hasPrivate
})

const fetchTokenUsage = async () => {
  const token = form.value.botToken.trim()
  if (!token) {
    tokenUsage.value = null
    return
  }
  try {
    const res = await useApi('/bot-groups/token-usage', {
      params: {
        botToken: token,
        excludeRegionSlug: editingSlug.value || undefined,
      },
    })
    if (res?.success) tokenUsage.value = res.data
  } catch {
    tokenUsage.value = null
  }
}

watch(
  () => form.value.botToken,
  () => { void fetchTokenUsage() },
)

const emptyForm = (): BotGroupFormModel => ({
  regionSlug: '',
  title: '',
  listenerUserId: '',
  tariffIds: [],
  botToken: '',
  active: true,
  postOrdersToPublic: true,
  groupInviteRewardAmount: 500,
  public: { username: '' },
  private: { inviteLink: '' },
})

const form = ref<BotGroupFormModel>(emptyForm())
const editingSlug = ref<string | null>(null)
const editingHasToken = ref(false)
const editingTokenMasked = ref('')
const deleteOpen = ref(false)
const deleteTarget = ref<BotRegionCard | null>(null)
const error = ref('')
const refreshingId = ref<string | null>(null)

const listenerLabel = (userId: string) => {
  if (!userId) return 'Tanlanmagan'
  const c = store.listenerCandidates.find((x) => x.userId === userId)
  if (c) return c.username ? `${c.label} (@${c.username})` : c.label
  return userId
}

const tariffLabels = (ids: string[]) => {
  if (!ids?.length) return 'Tanlanmagan'
  const names = ids
    .map((id) => tariffStore.tariffs.find((t) => t.id === id)?.name)
    .filter(Boolean)
  return names.length ? names.join(', ') : `${ids.length} ta tarif`
}

const resetForm = () => {
  form.value = emptyForm()
  editingSlug.value = null
  editingHasToken.value = false
  editingTokenMasked.value = ''
}

const onSubmit = async () => {
  error.value = ''
  const payload = {
    regionSlug: form.value.regionSlug.trim(),
    title: form.value.title.trim(),
    listenerUserId: form.value.listenerUserId.trim(),
    tariffIds: form.value.tariffIds,
    botToken: form.value.botToken.trim() || undefined,
    active: form.value.active,
    postOrdersToPublic: form.value.postOrdersToPublic,
    groupInviteRewardAmount: form.value.groupInviteRewardAmount,
    public: {
      username: form.value.public.username.trim(),
    },
    private: {
      inviteLink: form.value.private.inviteLink.trim(),
    },
  }

  try {
    if (editingSlug.value) {
      await store.updateRegion(editingSlug.value, payload)
    } else {
      if (!payload.botToken) {
        error.value = 'Bot token kiriting'
        return
      }
      if (!showPrivateSection.value && !payload.private.inviteLink) {
        // shared private — invite shart emas
      } else if (showPrivateSection.value && !payload.private.inviteLink) {
        error.value = 'Private guruh invite link kiriting'
        return
      }
      if (tokenUsage.value && !tokenUsage.value.canAddPublic) {
        error.value = `Bu bot uchun maksimum ${tokenUsage.value.maxPublic} ta public guruh`
        return
      }
      await store.createRegion(payload as any)
    }
    resetForm()
    void store.fetchListenerCandidates()
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Xatolik yuz berdi'
  }
}

const startEdit = (card: BotRegionCard) => {
  editingSlug.value = card.slug
  editingHasToken.value = !!(card.public?.hasBotToken || card.private?.hasBotToken)
  editingTokenMasked.value = card.public?.tokenMasked || card.private?.tokenMasked || ''
  form.value = {
    regionSlug: card.slug,
    title: card.title,
    listenerUserId: card.listenerUserId || '',
    tariffIds: [...(card.tariffIds || [])],
    botToken: '',
    active: card.active,
    postOrdersToPublic: card.postOrdersToPublic !== false,
    groupInviteRewardAmount: card.groupInviteRewardAmount ?? 500,
    public: {
      username: card.public?.username || '',
    },
    private: {
      inviteLink: card.private?.inviteLink || '',
    },
  }
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

const onRefresh = async (g: BotGroupRow) => {
  error.value = ''
  refreshingId.value = g.id
  try {
    await store.refreshGroup(g.id)
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Tekshirish xato'
  } finally {
    refreshingId.value = null
  }
}

const askDelete = (card: BotRegionCard) => {
  deleteTarget.value = card
  deleteOpen.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  error.value = ''
  try {
    await store.deleteRegion(deleteTarget.value.slug)
    deleteOpen.value = false
    deleteTarget.value = null
    if (editingSlug.value) resetForm()
    void store.fetchListenerCandidates()
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || "O'chirish xato"
  }
}

const loadAll = async () => {
  await Promise.all([
    store.fetchGroups(),
    store.fetchListenerCandidates(),
    tariffStore.fetchTariffs(),
  ])
}

onMounted(() => {
  void loadAll()
})

usePullToRefresh(async () => {
  try {
    await loadAll()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Yuklash xato'
  }
})
</script>
