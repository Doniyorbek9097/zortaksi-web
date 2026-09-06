<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <header class="sticky top-0 z-30 -mx-4 px-4 py-2 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <h1 class="text-base font-black text-slate-900 dark:text-white">Reklama bannerlari</h1>
      <p class="text-[11px] text-slate-400 mt-0.5">
        Haydovchi dashboardda slayd ko'rinishida chiqadi
      </p>
    </header>

    <section class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
      <h2 class="text-[13px] font-black text-slate-800 dark:text-slate-100">
        {{ editingId ? 'Bannerni tahrirlash' : 'Yangi banner' }}
      </h2>

      <div>
        <label class="text-[11px] font-bold text-slate-400 uppercase">Banner nomi</label>
        <input
          v-model="form.name"
          type="text"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm font-semibold"
          placeholder="Masalan: Bonus aksiyasi"
        >
      </div>

      <div>
        <label class="text-[11px] font-bold text-slate-400 uppercase">URL yoki sahifa</label>
        <input
          v-model="form.targetUrl"
          type="text"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm font-semibold"
          placeholder="https://example.com yoki /driver/bonus"
        >
        <p class="mt-1 text-[10px] font-semibold text-slate-400">
          Tashqi sayt yoki ilova ichidagi yo'l. Bo'sh qoldirilsa — bosilganda hech narsa bo'lmaydi.
        </p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-[11px] font-bold text-slate-400 uppercase">Tartib</label>
          <input
            v-model.number="form.sortOrder"
            type="number"
            min="0"
            class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm font-semibold"
          >
        </div>
        <div class="flex items-end pb-1">
          <label class="inline-flex items-center gap-2 text-[12px] font-bold text-slate-600 dark:text-slate-300">
            <input v-model="form.active" type="checkbox" class="rounded border-slate-300">
            Faol
          </label>
        </div>
      </div>

      <div>
        <label class="text-[11px] font-bold text-slate-400 uppercase">Rasm</label>
        <div
          class="mt-1 relative rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/60 overflow-hidden"
        >
          <div v-if="previewSrc" class="aspect-[3/1] w-full">
            <img :src="previewSrc" alt="Banner preview" class="w-full h-full object-cover">
          </div>
          <div v-else class="aspect-[3/1] flex items-center justify-center text-slate-400 text-[11px] font-bold">
            Rasm tanlanmagan
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="absolute inset-0 opacity-0 cursor-pointer"
            @change="onFileChange"
          >
        </div>
        <p class="mt-1.5 text-[10px] font-semibold text-slate-400 leading-relaxed">
          Tavsiya: <span class="text-sky-600 dark:text-sky-400 font-black">1200×400 px</span>
          (3:1), JPG/PNG/WebP, maks. 2 MB — telefon va planshetda to'liq chiroyli ko'rinadi.
        </p>
      </div>

      <p v-if="error" class="text-[12px] font-bold text-red-500">{{ error }}</p>
      <p v-if="saved" class="text-[12px] font-bold text-emerald-500">Saqlandi</p>

      <div class="flex gap-2">
        <button
          v-if="editingId"
          type="button"
          class="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-[12px] font-black"
          @click="resetForm"
        >
          Bekor
        </button>
        <button
          type="button"
          class="flex-1 rounded-xl bg-sky-500 text-white font-black py-3 active:scale-[0.98] disabled:opacity-50"
          :disabled="saving"
          @click="save"
        >
          {{ saving ? 'Saqlanmoqda...' : editingId ? 'Yangilash' : 'Qo\'shish' }}
        </button>
      </div>
    </section>

    <div v-if="loading" class="space-y-3">
      <div v-for="n in 2" :key="n" class="h-28 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
    </div>

    <BaseEmptyState
      v-else-if="!banners.length"
      icon="fa-solid fa-image"
      title="Hali banner yo'q"
      tone="slate"
    />

    <div v-else class="space-y-3">
      <article
        v-for="b in banners"
        :key="b.id"
        class="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
      >
        <div class="aspect-[3/1] bg-slate-100 dark:bg-slate-800">
          <img
            :src="bannerSrc(b)"
            :alt="b.name"
            class="w-full h-full object-cover"
          >
        </div>
        <div class="p-3 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-[13px] font-black text-slate-800 dark:text-slate-100 truncate">{{ b.name }}</p>
            <p class="text-[10px] font-semibold text-slate-400 truncate mt-0.5">
              {{ b.targetUrl || '— havola yo\'q —' }}
            </p>
            <p class="text-[10px] font-bold text-slate-500 mt-1">
              Tartib: {{ b.sortOrder }}
              <span class="mx-1">·</span>
              <span :class="b.active ? 'text-emerald-500' : 'text-rose-500'">
                {{ b.active ? 'Faol' : 'Yashirin' }}
              </span>
            </p>
          </div>
          <div class="flex flex-col gap-1.5 shrink-0">
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg text-[11px] font-black bg-sky-500/10 text-sky-600"
              @click="startEdit(b)"
            >
              Tahrir
            </button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg text-[11px] font-black bg-red-500/10 text-red-600"
              @click="askDelete(b)"
            >
              O'chirish
            </button>
          </div>
        </div>
      </article>
    </div>

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
const fileInput = ref<HTMLInputElement | null>(null)
const pickedFile = ref<File | null>(null)
const previewObjectUrl = ref('')

const form = ref({
  name: '',
  targetUrl: '',
  sortOrder: 0,
  active: true,
})

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
  if (fileInput.value) fileInput.value.value = ''
  error.value = ''
  saved.value = false
}

const onFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
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
  if (fileInput.value) fileInput.value.value = ''
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
