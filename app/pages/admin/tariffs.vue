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
        :kind="t.kind"
        @edit="startEdit(t)"
        @delete="askDelete(t)"
      />
    </div>

    <p v-if="error" class="text-center text-[12px] font-bold text-red-500">{{ error }}</p>

    <AdminTariffsTariffFormDialog
      v-model="formOpen"
      v-model:form="form"
      :editing="editingId != null"
      @submit="onSubmit"
      @cancel="onFormCancel"
    />

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
import { normalizeTariffKind } from '~/utils/tariffKind'

definePageMeta({ layout: 'admin' })

const store = useTariffStore()

const listTab = ref<TariffKind>('driver')
const kindTabs = [
  { label: 'Buyurtma', value: 'driver' },
  { label: "E'lon avto", value: 'driver_post' },
]

const emptyForm = (kind: TariffKind = 'driver'): TariffFormModel => ({
  name: '',
  slug: '',
  info: '',
  price: 0,
  expireDays: 30,
  kind,
})

const form = ref<TariffFormModel>(emptyForm())
const formOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteOpen = ref(false)
const deleteTarget = ref<TariffRow | null>(null)
const error = ref('')

const tariffsInTab = computed(() =>
  store.tariffs.filter((t) => normalizeTariffKind(t.kind) === listTab.value)
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

const onFormCancel = () => {
  if (!editingId.value) resetForm()
}

const onSubmit = async () => {
  error.value = ''
  const kind = normalizeTariffKind(form.value.kind)
  const payload = {
    name: form.value.name.trim(),
    slug: form.value.slug.trim(),
    info: form.value.info.trim() || undefined,
    price: Number(form.value.price ?? 0),
    expireDays: Number(form.value.expireDays ?? 30),
    kind,
  }

  try {
    if (editingId.value) {
      await store.updateTariff(editingId.value, payload)
    } else {
      await store.createTariff(payload)
    }
    listTab.value = kind
    formOpen.value = false
    resetForm()
    await store.fetchTariffs()
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Xatolik yuz berdi'
  }
}

const startEdit = (t: TariffRow) => {
  editingId.value = t.id
  listTab.value = (t.kind || 'driver') as TariffKind
  form.value = {
    name: t.name,
    slug: t.slug,
    info: t.info ?? '',
    price: t.price,
    expireDays: t.expireDays,
    kind: (t.kind || 'driver') as TariffKind,
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
    form.value = { ...form.value, kind: tab as TariffKind }
  }
})

watch(
  () => form.value.kind,
  (kind) => {
    if (formOpen.value && !editingId.value) {
      const k = normalizeTariffKind(kind)
      if (k !== listTab.value) listTab.value = k
    }
  }
)

onMounted(loadAll)

usePullToRefresh(loadAll)
</script>
