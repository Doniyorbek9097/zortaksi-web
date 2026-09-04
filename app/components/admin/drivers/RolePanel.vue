<template>
  <section
    class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
  >
    <h2 class="text-sm font-black text-slate-900 dark:text-white">Rol</h2>
    <select
      v-model="selectedRole"
      class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm font-semibold"
    >
      <option value="driver">Haydovchi</option>
      <option value="subadmin">Subadmin</option>
    </select>
    <template v-if="selectedRole === 'subadmin'">
      <label class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        <input v-model="subadminActive" type="checkbox" class="rounded">
        Faol
      </label>
      <div>
        <label class="text-[11px] font-bold text-slate-400 uppercase">Limit tugash sanasi</label>
        <input
          v-model="subadminExpireAt"
          type="datetime-local"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm"
        >
      </div>
    </template>
    <button
      type="button"
      class="w-full rounded-xl bg-sky-500 text-white font-black py-2.5 text-sm disabled:opacity-50"
      :disabled="saving"
      @click="save"
    >
      {{ saving ? '...' : 'Rolni saqlash' }}
    </button>
    <p v-if="message" class="text-[11px] font-bold" :class="messageOk ? 'text-emerald-500' : 'text-red-500'">
      {{ message }}
    </p>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  driverId: string
  role?: string | null
  active?: boolean
  tariffExpireAt?: string | Date | null
}>()

const emit = defineEmits<{ saved: [] }>()

const selectedRole = ref<'subadmin' | 'driver'>('driver')
const subadminActive = ref(true)
const subadminExpireAt = ref('')
const saving = ref(false)
const message = ref('')
const messageOk = ref(true)

const toDatetimeLocal = (value?: string | Date | null) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const syncFromProps = () => {
  const role = String(props.role || 'driver').toLowerCase()
  selectedRole.value = role === 'subadmin' ? 'subadmin' : 'driver'
  subadminActive.value = Boolean(props.active)
  subadminExpireAt.value = toDatetimeLocal(props.tariffExpireAt)
}

watch(() => [props.driverId, props.role, props.active, props.tariffExpireAt], syncFromProps, { immediate: true })

const save = async () => {
  if (!props.driverId) return
  message.value = ''
  saving.value = true
  try {
    const body: Record<string, unknown> = { role: selectedRole.value }
    if (selectedRole.value === 'subadmin') {
      body.active = subadminActive.value
      body.tariffExpireAt = subadminExpireAt.value || null
    }
    const res = await useApi(`/drivers/${encodeURIComponent(props.driverId)}/role`, {
      method: 'PATCH',
      body,
    })
    if (!res?.success) throw new Error(res?.message || 'Xato')
    messageOk.value = true
    message.value = 'Rol yangilandi'
    emit('saved')
  } catch (e: any) {
    messageOk.value = false
    message.value = e?.response?.data?.message || e?.message || 'Rol o\'zgartirilmadi'
  } finally {
    saving.value = false
  }
}
</script>
