<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <AdminBannersPageHeader :total="banners.length" />

    <div
      v-if="!loading && banners.length"
      class="grid grid-cols-2 gap-2"
    >
      <div
        class="rounded-xl p-2.5 border bg-emerald-50 dark:bg-emerald-950/35 border-emerald-100 dark:border-emerald-900/50"
      >
        <p class="text-[9px] font-black uppercase tracking-wide text-emerald-600/90 dark:text-emerald-400/90">
          Faol
        </p>
        <p class="mt-1 text-xl font-black tabular-nums text-emerald-700 dark:text-emerald-300">
          {{ activeCount }}
        </p>
      </div>
      <div
        class="rounded-xl p-2.5 border bg-violet-50 dark:bg-violet-950/35 border-violet-100 dark:border-violet-900/50"
      >
        <p class="text-[9px] font-black uppercase tracking-wide text-violet-600/90 dark:text-violet-400/90">
          Yashirin
        </p>
        <p class="mt-1 text-xl font-black tabular-nums text-violet-700 dark:text-violet-300">
          {{ banners.length - activeCount }}
        </p>
      </div>
    </div>

    <AdminBannersCreateForm
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

    <div v-if="loading" class="space-y-3">
      <div
        v-for="n in 2"
        :key="n"
        class="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        <div class="aspect-[3/1] bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div class="h-14 bg-white dark:bg-slate-900 animate-pulse" />
      </div>
    </div>

    <section v-else-if="banners.length" class="space-y-3">
      <div class="flex items-center justify-between gap-2 px-0.5">
        <h2 class="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
          Bannerlar ro'yxati
        </h2>
        <span class="text-[10px] font-bold text-slate-400">
          Tartib bo'yicha
        </span>
      </div>
      <AdminBannersBannerItem
        v-for="b in banners"
        :key="b.id"
        :name="b.name"
        :target-url="b.targetUrl"
        :image-src="bannerSrc(b)"
        :sort-order="b.sortOrder"
        :active="b.active"
        @edit="startEdit(b)"
        @delete="askDelete(b)"
      />
    </section>

    <BaseEmptyState
      v-else
      icon="fa-solid fa-image"
      title="Hali banner yo'q"
      subtitle="Yuqoridagi forma orqali birinchi bannerni qo'shing"
      tone="slate"
    />

    <BaseConfirmDialog
      v-model="deleteOpen"
      title="Bannerni o'chirish"
      :message="deleteTarget ? `«${deleteTarget.name}» bannerini o'chirmoqchimisiz?` : ''"
      confirm-text="O'chir"
      cancel-text="Bekor qilish"
      variant="danger"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { BannerFormModel } from '~/components/admin/banners/CreateForm.vue'
import type { IBanner } from '~/types/banner'

definePageMeta({ layout: 'admin' })

const { resolve: resolveMedia } = useMediaUrl()

const banners = ref<IBanner[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const saved = ref(false)

const editingId = ref<string | null>(null)
const deleteOpen = ref(false)
const deleteTarget = ref<IBanner | null>(null)
const pickedFile = ref<File | null>(null)
const previewObjectUrl = ref('')

const form = ref<BannerFormModel>({
  name: '',
  targetUrl: '',
  sortOrder: 0,
  active: true,
})

const activeCount = computed(() => banners.value.filter((b) => b.active).length)

const previewSrc = computed(() => {
  if (previewObjectUrl.value) return previewObjectUrl.value
  if (editingId.value) {
    const row = banners.value.find((b) => b.id === editingId.value)
    if (row) return bannerSrc(row)
  }
  return ''
})

const bannerSrc = (b: IBanner) => resolveMedia(b.imageUrl) || b.imageUrl

const resetForm = () => {
  editingId.value = null
  pickedFile.value = null
  if (previewObjectUrl.value) URL.revokeObjectURL(previewObjectUrl.value)
  previewObjectUrl.value = ''
  form.value = { name: '', targetUrl: '', sortOrder: 0, active: true }
  error.value = ''
  saved.value = false
}

const onFileChange = (file: File | null) => {
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    error.value = 'Rasm 2 MB dan katta bo\'lmasligi kerak'
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
    const res = await useApi<{ success: boolean; data: { banners: IBanner[] } }>('/admin/banners')
    banners.value = res?.success ? res.data?.banners || [] : []
  } catch {
    banners.value = []
  } finally {
    loading.value = false
  }
}

const buildFormData = () => {
  const fd = new FormData()
  fd.append('name', form.value.name.trim())
  fd.append('targetUrl', form.value.targetUrl.trim())
  fd.append('sortOrder', String(form.value.sortOrder || 0))
  fd.append('active', form.value.active ? '1' : '0')
  if (pickedFile.value) fd.append('file', pickedFile.value)
  return fd
}

const save = async () => {
  if (!form.value.name.trim()) {
    error.value = 'Banner nomi kerak'
    return
  }
  if (!editingId.value && !pickedFile.value) {
    error.value = 'Rasm yuklang'
    return
  }

  saving.value = true
  error.value = ''
  saved.value = false
  try {
    const fd = buildFormData()
    const res = editingId.value
      ? await useApi<{ success: boolean; message?: string }>(`/admin/banners/${editingId.value}`, {
          method: 'PUT',
          body: fd,
        })
      : await useApi<{ success: boolean; message?: string }>('/admin/banners', {
          method: 'POST',
          body: fd,
        })
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

const startEdit = (b: IBanner) => {
  editingId.value = b.id
  form.value = {
    name: b.name,
    targetUrl: b.targetUrl || '',
    sortOrder: b.sortOrder || 0,
    active: !!b.active,
  }
  pickedFile.value = null
  if (previewObjectUrl.value) URL.revokeObjectURL(previewObjectUrl.value)
  previewObjectUrl.value = ''
  error.value = ''
  saved.value = false
}

const askDelete = (b: IBanner) => {
  deleteTarget.value = b
  deleteOpen.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  error.value = ''
  try {
    const res = await useApi<{ success: boolean; message?: string }>(
      `/admin/banners/${deleteTarget.value.id}`,
      { method: 'DELETE' },
    )
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
