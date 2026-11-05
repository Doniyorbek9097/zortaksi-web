<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <AdminTariffsPageHeader />

    <div class="flex items-center justify-between gap-2 flex-wrap">
      <AdminSegmentTabs v-model="listTab" :tabs="kindTabs" />
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black text-white bg-sky-500 hover:bg-sky-600 active:scale-[0.98] shadow-md shadow-sky-500/20"
        @click="openCreate"
      >
        <font-awesome-icon icon="fa-solid fa-plus" class="text-[10px]" />
        Yangi tarif
      </button>
    </div>

    <div v-if="store.isLoading" class="space-y-3">
      <div
        v-for="n in 3"
        :key="n"
        class="h-24 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"
      />
    </div>

    <BaseEmptyState
      v-else-if="!tariffsInTab.length"
      icon="fa-solid fa-tags"
      :title="listTab === 'driver_post' ? 'E\'lon tarifi yo\'q' : 'Buyurtma tarifi yo\'q'"
      :subtitle="'Yangi tarif tugmasini bosing'"
      tone="slate"
    />

    <div v-else class="space-y-3">
      <AdminTariffsTariffItem
        v-for="t in tariffsInTab"
        :key="t.id"
        :name="t.name"
        :slug="t.slug"
        :info="t.info"
        :price="t.price"
        :expire-days="t.expireDays"
        :service-buyurtma="t.serviceBuyurtma !== false"
        :service-post="!!t.servicePost"
        @edit="startEdit(t)"
        @delete="askDelete(t)"
      />
    </div>

    <p v-if="error" class="text-center text-[12px] font-bold text-red-500">{{ error }}</p>

    <AdminTariffsTariffFormDialog
      v-model="formOpen"
      :editing="editingId != null"
      :service-buyurtma="form.serviceBuyurtma"
      :service-post="form.servicePost"
      @cancel="onFormCancel"
    >
      <AdminTariffsCreateForm
        v-model="form"
        embedded
        :editing="editingId != null"
        @submit="onSubmit"
        @cancel="closeFormDialog"
      />
    </AdminTariffsTariffFormDialog>

    <BaseConfirmDialog
      v-model="deleteOpen"
      title="Tarifni o'chirish"
      :message="deleteTarget ? `«${deleteTarget.name}» tarifini o'chirmoqchimisiz?` : ''"
      confirm-text="O'chir"
      cancel-text="Bekor qilish"
      variant="danger"
      :loading="store.isSaving"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { TariffFormModel } from '~/components/admin/tariffs/CreateForm.vue'
import type { TariffKind, TariffRow } from '~/stores/tariff.store'
import { useTariffStore } from '~/stores/tariff.store'
import { tariffMatchesListKind } from '~/utils/tariffServices'

definePageMeta({ layout: 'admin' })

const store = useTariffStore()

const listTab = ref<TariffKind>('driver')
const kindTabs = [
  { label: 'Buyurtma', value: 'driver' },
  { label: "E'lon avto", value: 'driver_post' },
]

const emptyForm = (tab: TariffKind = 'driver'): TariffFormModel => ({
  name: '',
  slug: '',
  info: '',
  price: 0,
  expireDays: 30,
  serviceBuyurtma: tab !== 'driver_post',
  servicePost: tab === 'driver_post',
})

const form = ref<TariffFormModel>(emptyForm())
const formOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteOpen = ref(false)
const deleteTarget = ref<TariffRow | null>(null)
const error = ref('')

const tariffsInTab = computed(() =>
  store.tariffs.filter((t) => tariffMatchesListKind(t, listTab.value))
)

const resetForm = () => {
  form.value = emptyForm(listTab.value)
  editingId.value = null
}

const openCreate = () => {
  editingId.value = null
  form.value = emptyForm(listTab.value)
  formOpen.value = true
}

const closeFormDialog = () => {
  formOpen.value = false
  onFormCancel()
}

const onFormCancel = () => {
  if (!editingId.value) resetForm()
}

const pickTabAfterSave = (draft: TariffFormModel) => {
  if (draft.serviceBuyurtma && !draft.servicePost) listTab.value = 'driver'
  else if (draft.servicePost && !draft.serviceBuyurtma) listTab.value = 'driver_post'
  else if (draft.serviceBuyurtma) listTab.value = 'driver'
}

const onSubmit = async (draft: TariffFormModel) => {
  error.value = ''
  form.value = { ...draft }
  const payload = {
    name: draft.name.trim(),
    slug: draft.slug.trim(),
    info: String(draft.info || '').trim() || undefined,
    price: Number(draft.price ?? 0),
    expireDays: Number(draft.expireDays ?? 30),
    serviceBuyurtma: draft.serviceBuyurtma,
    servicePost: draft.servicePost,
  }

  try {
    if (editingId.value) {
      await store.updateTariff(editingId.value, payload)
    } else {
      await store.createTariff(payload)
    }
    pickTabAfterSave(draft)
    formOpen.value = false
    resetForm()
    await store.fetchTariffs()
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Xatolik yuz berdi'
  }
}

const startEdit = (t: TariffRow) => {
  editingId.value = t.id
  if (t.servicePost && !t.serviceBuyurtma) listTab.value = 'driver_post'
  else listTab.value = 'driver'
  form.value = {
    name: t.name,
    slug: t.slug,
    info: t.info ?? '',
    price: t.price,
    expireDays: t.expireDays,
    serviceBuyurtma: t.serviceBuyurtma !== false,
    servicePost: !!t.servicePost,
  }
  formOpen.value = true
}

const askDelete = (t: TariffRow) => {
  deleteTarget.value = t
  deleteOpen.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  error.value = ''
  try {
    await store.deleteTariff(deleteTarget.value.id)
    if (editingId.value === deleteTarget.value.id) {
      formOpen.value = false
      resetForm()
    }
    deleteTarget.value = null
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'O‘chirib bo‘lmadi'
  }
}

const loadAll = () => {
  store.fetchTariffs().catch((e: any) => {
    error.value = e?.response?.data?.message || 'Tariflar yuklanmadi'
  })
}

watch(listTab, (tab) => {
  if (formOpen.value && !editingId.value) {
    form.value = {
      ...form.value,
      serviceBuyurtma: tab !== 'driver_post',
      servicePost: tab === 'driver_post',
    }
  }
})

onMounted(loadAll)

usePullToRefresh(loadAll)
</script>
