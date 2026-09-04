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
    <p v-if="selectedRole === 'subadmin'" class="text-[11px] font-semibold text-slate-500">
      Subadmin uchun limit va tarifni quyidagi «Limit berish» va «Tarifni yangilash» tugmalari orqali bering.
    </p>
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
}>()

const emit = defineEmits<{ saved: [] }>()

const selectedRole = ref<'subadmin' | 'driver'>('driver')
const saving = ref(false)
const message = ref('')
const messageOk = ref(true)

watch(
  () => [props.driverId, props.role] as const,
  () => {
    const role = String(props.role || 'driver').toLowerCase()
    selectedRole.value = role === 'subadmin' ? 'subadmin' : 'driver'
  },
  { immediate: true }
)

const save = async () => {
  if (!props.driverId) return
  message.value = ''
  saving.value = true
  try {
    const res = await useApi(`/drivers/${encodeURIComponent(props.driverId)}/role`, {
      method: 'PATCH',
      body: { role: selectedRole.value },
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
