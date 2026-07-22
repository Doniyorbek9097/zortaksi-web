<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <AdminTariffsPageHeader />

    <AdminTariffsCreateForm
      v-model="form"
      :editing="editingId != null"
      @submit="onSubmit"
      @cancel="resetForm"
    />

    <div v-if="store.isLoading" class="space-y-3">
      <div
        v-for="n in 3"
        :key="n"
        class="h-24 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"
      />
    </div>

    <BaseEmptyState
      v-else-if="!store.tariffs.length"
      icon="fa-solid fa-tags"
      title="Hali tarif yo'q"
      tone="slate"
    />

    <div v-else class="space-y-3">
      <AdminTariffsTariffItem
        v-for="t in store.tariffs"
        :key="t.id"
        :name="t.name"
        :info="t.info"
        :price="t.price"
        :expire-days="t.expireDays"
        @edit="startEdit(t)"
        @delete="askDelete(t)"
      />
    </div>

    <p v-if="error" class="text-center text-[12px] font-bold text-red-500">{{ error }}</p>

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
import type { TariffRow } from '~/stores/tariff.store'
import { useTariffStore } from '~/stores/tariff.store'

definePageMeta({ layout: 'admin' })

const store = useTariffStore()

const emptyForm = (): TariffFormModel => ({
  name: '',
  info: '',
  price: 0,
  expireDays: 30,
})

const form = ref<TariffFormModel>(emptyForm())
const editingId = ref<string | null>(null)
const deleteOpen = ref(false)
const deleteTarget = ref<TariffRow | null>(null)
const error = ref('')

const resetForm = () => {
  form.value = emptyForm()
  editingId.value = null
}

const onSubmit = async () => {
  error.value = ''
  const payload = {
    name: form.value.name.trim(),
    info: form.value.info.trim() || undefined,
    price: form.value.price ?? 0,
    expireDays: form.value.expireDays ?? 30,
  }

  try {
    if (editingId.value) {
      await store.updateTariff(editingId.value, payload)
    } else {
      await store.createTariff(payload)
    }
    resetForm()
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Xatolik yuz berdi'
  }
}

const startEdit = (t: TariffRow) => {
  editingId.value = t.id
  form.value = {
    name: t.name,
    info: t.info ?? '',
    price: t.price,
    expireDays: t.expireDays,
  }
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
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
    if (editingId.value === deleteTarget.value.id) resetForm()
    deleteTarget.value = null
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'O‘chirib bo‘lmadi'
  }
}

onMounted(() => {
  store.fetchTariffs().catch((e: any) => {
    error.value = e?.response?.data?.message || 'Tariflar yuklanmadi'
  })
})
</script>
