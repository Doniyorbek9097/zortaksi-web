<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <header class="sticky top-0 z-30 -mx-4 px-4 py-2 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <h1 class="text-base font-black text-slate-900 dark:text-white">Subadminlar</h1>
      <p class="text-[11px] text-slate-400 mt-0.5">Limit va faollik boshqaruvi</p>
    </header>

    <section class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
      <h2 class="text-sm font-black">Yangi / yangilash</h2>
      <input
        v-model="form.userId"
        type="text"
        inputmode="numeric"
        class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm font-mono"
        placeholder="Telegram user ID"
      >
      <input
        v-model="form.firstName"
        type="text"
        class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm"
        placeholder="Ism"
      >
      <label class="flex items-center gap-2 text-sm font-semibold">
        <input v-model="form.active" type="checkbox" class="rounded">
        Faol
      </label>
      <div>
        <label class="text-[11px] font-bold text-slate-400 uppercase">Limit tugash sanasi</label>
        <input
          v-model="form.tariffExpireAt"
          type="datetime-local"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm"
        >
      </div>
      <p v-if="formError" class="text-[12px] font-bold text-red-500">{{ formError }}</p>
      <button
        type="button"
        class="w-full rounded-xl bg-emerald-500 text-white font-black py-3"
        :disabled="saving"
        @click="upsert"
      >
        {{ saving ? '...' : 'Saqlash' }}
      </button>
    </section>

    <section class="space-y-2">
      <div
        v-for="row in rows"
        :key="row.userId"
        class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="font-black text-slate-900 dark:text-white">{{ row.firstName }} {{ row.lastName || '' }}</p>
            <p class="text-[11px] font-mono text-slate-400">{{ row.userId }}</p>
          </div>
          <span
            class="text-[10px] font-black px-2 py-1 rounded-full"
            :class="row.panelActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'"
          >
            {{ row.panelActive ? 'Faol' : 'Nofaol' }}
          </span>
        </div>
        <p class="text-[11px] text-slate-500 mt-2">
          Limit: {{ row.tariffExpireAt ? formatDate(row.tariffExpireAt) : '—' }}
        </p>
        <button
          type="button"
          class="mt-2 text-[12px] font-bold text-sky-500"
          @click="editRow(row)"
        >
          Tahrirlash
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

type SubadminRow = {
  userId: string
  firstName?: string
  lastName?: string
  active: boolean
  tariffExpireAt?: string
  panelActive?: boolean
}

const rows = ref<SubadminRow[]>([])
const saving = ref(false)
const formError = ref('')
const form = reactive({
  userId: '',
  firstName: '',
  active: true,
  tariffExpireAt: '',
})

const formatDate = (v: string) => {
  try {
    return new Date(v).toLocaleString('uz-UZ')
  } catch {
    return v
  }
}

const load = async () => {
  const res = await useApi<{ success: boolean; data: { subadmins: SubadminRow[] } }>('/subadmins')
  if (res?.success) rows.value = res.data?.subadmins || []
}

const editRow = (row: SubadminRow) => {
  form.userId = row.userId
  form.firstName = row.firstName || ''
  form.active = row.active
  form.tariffExpireAt = row.tariffExpireAt
    ? new Date(row.tariffExpireAt).toISOString().slice(0, 16)
    : ''
}

const upsert = async () => {
  saving.value = true
  formError.value = ''
  try {
    const res = await useApi<{ success: boolean; message?: string }>('/subadmins', {
      method: 'POST',
      body: {
        userId: form.userId.replace(/\D/g, ''),
        firstName: form.firstName.trim(),
        active: form.active,
        tariffExpireAt: form.tariffExpireAt ? new Date(form.tariffExpireAt).toISOString() : null,
      },
    })
    if (!res?.success) throw new Error(res?.message || 'Xato')
    await load()
  } catch (e: any) {
    formError.value = e?.message || 'Saqlab bo\'lmadi'
  } finally {
    saving.value = false
  }
}

onMounted(() => { void load() })
</script>
