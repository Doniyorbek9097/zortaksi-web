<template>
  <div class="space-y-2.5 w-full min-w-0 max-w-full overflow-hidden">
    <div class="min-w-0 overflow-hidden">
      <p class="text-[11px] font-black uppercase tracking-wider opacity-80 mb-1">
        {{ isTopup ? "Hisobni to'ldirish" : "To'lov so'rovi" }}
      </p>
      <p class="text-[14px] font-bold leading-snug break-words">
        {{ isTopup ? "Hisobni to'ldirmoqchiman" : 'Tarif sotib olmoqchiman' }}
      </p>
    </div>

    <div
      class="rounded-xl px-3 py-2.5 space-y-1.5 overflow-hidden"
      :class="out
        ? 'bg-white/15'
        : 'bg-sky-50 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-800/50'"
    >
      <p v-if="name" class="text-[13px] font-bold truncate">
        <span class="opacity-70 font-semibold">Ism:</span> {{ name }}
      </p>
      <p v-if="phone" class="text-[13px] font-bold truncate">
        <span class="opacity-70 font-semibold">Tel:</span> {{ phone }}
      </p>
      <p v-if="tariff && !isTopup" class="text-[13px] font-bold truncate">
        <span class="opacity-70 font-semibold">Tarif:</span> {{ tariff }}
      </p>
      <p v-if="amount" class="text-[15px] font-black">
        <span class="opacity-70 text-[13px] font-semibold">Summa:</span> {{ amount }} so'm
      </p>
    </div>

    <p class="text-[12px] leading-relaxed opacity-80 break-words">
      {{ out
        ? 'So\'rov yuborildi. Admin karta ma\'lumotini yuboradi.'
        : isTopup
          ? 'To\'lovdan keyin summani haydovchi balansiga qo\'shing.'
          : 'To\'lovdan keyin chek/skrinshot yuboriladi.' }}
    </p>

    <!-- Admin: balansga qo'shish -->
    <button
      v-if="showPayButton"
      type="button"
      class="inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-black active:scale-[0.99] transition-all overflow-hidden"
      :class="out
        ? 'bg-white text-sky-600'
        : 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'"
      @click.stop.prevent="goPay"
    >
      <font-awesome-icon icon="fa-solid fa-wallet" class="shrink-0" />
      <span class="truncate">{{ isTopup ? "Balansga qo'shish" : "To'lov qilish" }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'

interface Props {
  name?: string
  phone?: string
  tariff?: string
  amount?: string
  payUrl?: string
  userId?: string
  tariffId?: string
  type?: string
  out?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
  phone: '',
  tariff: '',
  amount: '',
  payUrl: '',
  userId: '',
  tariffId: '',
  type: '',
  out: false,
})

const authStore = useAuthStore()

const isTopup = computed(() => {
  if (props.type === 'topup') return true
  if (props.type === 'tariff') return false
  // Yangi so'rovlar tariffId siz; eski tarif so'rovlari ham ko'rsatiladi
  return !props.tariffId && !props.tariff
})

/** payUrl yoki userId dan haydovchi id */
const resolvedUserId = computed(() => {
  if (props.userId) return String(props.userId)
  const m = String(props.payUrl || '').match(/\/admin\/pay\/([^/?#]+)/)
  return m?.[1] ? decodeURIComponent(m[1]) : ''
})

const resolvedAmount = computed(() => {
  try {
    const u = new URL(props.payUrl, 'https://local.invalid')
    const q = u.searchParams.get('amount')
    if (q) return q
  } catch { /* ignore */ }
  if (props.amount) {
    const digits = props.amount.replace(/\D/g, '')
    if (digits) return digits
  }
  return ''
})

const showPayButton = computed(() =>
  !!resolvedUserId.value && authStore.user?.role === 'admin'
)

const goPay = async () => {
  const id = resolvedUserId.value
  if (!id) return
  const query: Record<string, string> = {}
  if (resolvedAmount.value) query.amount = resolvedAmount.value
  await navigateTo({ path: `/admin/pay/${id}`, query })
}
</script>
