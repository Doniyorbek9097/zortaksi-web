<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <AdminRealsPageHeader :total="reals.length" />

    <AdminRealsCreateForm
      v-model="form"
      :editing="editingId != null"
      :preview-src="previewSrc"
      :saving="saving"
      :error="error"
      :saved="saved"
      @submit="save"
      @cancel="resetForm"
      @file-change="onFileChange"
    />

    <div v-if="loading" class="grid gap-3 sm:grid-cols-2">
      <div v-for="n in 2" :key="n" class="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>

    <div v-else-if="reals.length" class="grid gap-3 sm:grid-cols-2">
      <AdminRealsRealItem
        v-for="r in reals"
        :key="r.id"
        :title="r.title"
        :product-price="r.productPrice"
        :product-url="r.productUrl"
        :video-src="realVideoSrc(r)"
        :sort-order="r.sortOrder"
        :active="r.active"
        :likes-count="r.likesCount"
        :dislikes-count="r.dislikesCount"
        @edit="startEdit(r)"
        @delete="askDelete(r)"
      />
    </div>

    <BaseEmptyState
      v-else
      icon="fa-solid fa-clapperboard"
      title="Hali real yo'q"
      subtitle="Video reklama yuklang"
      tone="slate"
    />

    <BaseConfirmDialog
      v-model="deleteOpen"
      title="Realni o'chirish"
      :message="deleteTarget ? `«${deleteTarget.title}» o'chirilsinmi?` : ''"
      confirm-text="O'chir"
      cancel-text="Bekor qilish"
      variant="danger"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { RealFormModel } from '~/components/admin/reals/CreateForm.vue'
import type { IRealAd } from '~/types/realAd'

definePageMeta({ layout: 'admin' })

const { resolve: resolveMedia } = useMediaUrl()

const reals = ref<IRealAd[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const saved = ref(false)
const editingId = ref<string | null>(null)
const deleteOpen = ref(false)
const deleteTarget = ref<IRealAd | null>(null)
const pickedFile = ref<File | null>(null)
const previewObjectUrl = ref('')

const form = ref<RealFormModel>({
  title: '',
  productPrice: '',
  productUrl: '',
  sortOrder: 0,
  active: true,
})

const previewSrc = computed(() => {
  if (previewObjectUrl.value) return previewObjectUrl.value
  if (editingId.value) {
    const row = reals.value.find((r) => r.id === editingId.value)
    if (row) return realVideoSrc(row)
  }
  return ''
})

const realVideoSrc = (r: IRealAd) => resolveMedia(r.videoUrl) || r.videoUrl

const resetForm = () => {
  editingId.value = null
  pickedFile.value = null
  if (previewObjectUrl.value) URL.revokeObjectURL(previewObjectUrl.value)
  previewObjectUrl.value = ''
  form.value = { title: '', productPrice: '', productUrl: '', sortOrder: 0, active: true }
  error.value = ''
  saved.value = false
}

const onFileChange = (file: File | null) => {
  if (!file) return
  if (file.size > 50 * 1024 * 1024) {
    error.value = 'Video 50 MB dan katta bo\'lmasligi kerak'
    return
  }
  error.value = ''
  pickedFile.value = file
  if (previewObjectUrl.value) URL.revokeObjectURL(previewObjectUrl.value)
  previewObjectUrl.value = URL.createObjectURL(file)
}

const load = async () => {
  loading.value = true
  try {
    const res = await useApi<{ success: boolean; data: { reals: IRealAd[] } }>('/admin/reals')
    reals.value = res?.success ? res.data?.reals || [] : []
  } catch {
    reals.value = []
  } finally {
    loading.value = false
  }
}

const buildFormData = () => {
  const fd = new FormData()
  fd.append('title', form.value.title.trim())
  fd.append('productPrice', form.value.productPrice.trim())
  fd.append('productUrl', form.value.productUrl.trim())
  fd.append('sortOrder', String(form.value.sortOrder || 0))
  fd.append('active', form.value.active ? '1' : '0')
  if (pickedFile.value) fd.append('file', pickedFile.value)
  return fd
}

const save = async () => {
  if (!form.value.title.trim()) {
    error.value = 'Mahsulot nomi kerak'
    return
  }
  if (!editingId.value && !pickedFile.value) {
    error.value = 'Video yuklang'
    return
  }
  saving.value = true
  error.value = ''
  saved.value = false
  try {
    const fd = buildFormData()
    const res = editingId.value
      ? await useApi(`/admin/reals/${editingId.value}`, { method: 'PUT', body: fd })
      : await useApi('/admin/reals', { method: 'POST', body: fd })
    if (!res?.success) throw new Error(res?.message || 'Xato')
    saved.value = true
    resetForm()
    await load()
  } catch (e: any) {
    error.value = e?.message || 'Saqlab bo\'lmadi'
  } finally {
    saving.value = false
  }
}

const startEdit = (r: IRealAd) => {
  editingId.value = r.id
  form.value = {
    title: r.title,
    productPrice: r.productPrice || '',
    productUrl: r.productUrl || '',
    sortOrder: r.sortOrder || 0,
    active: !!r.active,
  }
  pickedFile.value = null
  if (previewObjectUrl.value) URL.revokeObjectURL(previewObjectUrl.value)
  previewObjectUrl.value = ''
}

const askDelete = (r: IRealAd) => {
  deleteTarget.value = r
  deleteOpen.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    const res = await useApi(`/admin/reals/${deleteTarget.value.id}`, { method: 'DELETE' })
    if (!res?.success) throw new Error(res?.message || 'Xato')
    if (editingId.value === deleteTarget.value.id) resetForm()
    deleteOpen.value = false
    deleteTarget.value = null
    await load()
  } catch (e: any) {
    error.value = e?.message || 'O\'chirib bo\'lmadi'
  } finally {
    deleting.value = false
  }
}

onMounted(() => { void load() })
onBeforeUnmount(() => {
  if (previewObjectUrl.value) URL.revokeObjectURL(previewObjectUrl.value)
})
</script>
