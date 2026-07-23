<template>
  <div class="space-y-2.5 w-full min-w-0 max-w-full overflow-hidden">
    <div class="min-w-0 overflow-hidden">
      <div class="flex items-start justify-between gap-2 mb-1">
        <p class="text-[11px] font-black uppercase tracking-wider opacity-80">
          {{ isTopup ? "Hisobni to'ldirish" : "To'lov so'rovi" }}
        </p>
        <p
          v-if="dateLabel"
          class="shrink-0 text-[11px] font-bold opacity-75 tabular-nums"
        >
          {{ dateLabel }}
        </p>
      </div>
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

    <!-- To'lov holati (topup) -->
    <div
      v-if="isTopup"
      class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-black"
      :class="isPaid
        ? (out
          ? 'bg-emerald-400/25 text-white'
          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50')
        : (out
          ? 'bg-amber-400/25 text-white'
          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50')"
    >
      <font-awesome-icon
        :icon="isPaid ? 'fa-solid fa-circle-check' : 'fa-solid fa-clock'"
        class="text-[11px] shrink-0"
      />
      <span>{{ isPaid ? "To'lov muvaffaqiyatli" : "To'lov qilinmagan" }}</span>
    </div>

    <p class="text-[12px] leading-relaxed opacity-80 break-words">
      <template v-if="isTopup && isPaid">
        {{ out ? "Hisobingiz to'ldirildi." : "Balansga muvaffaqiyatli qo'shildi." }}
      </template>
      <template v-else>
        {{ out
          ? 'So\'rov yuborildi. Admin karta ma\'lumotini yuboradi.'
          : isTopup
            ? 'To\'lovdan keyin summani haydovchi balansiga qo\'shing.'
            : 'To\'lovdan keyin chek/skrinshot yuboriladi.' }}
      </template>
    </p>

    <!-- Admin: balansga qo'shish (faqat to'lanmagan) -->
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
  paymentStatus?: string
  date?: string | Date
  messageId?: string
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
  paymentStatus: 'unpaid',
  date: '',
  messageId: '',
  out: false,
})

const authStore = useAuthStore()

const isTopup = computed(() => {
  if (props.type === 'topup') return true
  if (props.type === 'tariff') return false
  // Yangi so'rovlar tariffId siz; eski tarif so'rovlari ham ko'rsatiladi
  return !props.tariffId && !props.tariff
})

const isPaid = computed(() => String(props.paymentStatus || '').toLowerCase() === 'paid')

const dateLabel = computed(() => {
  if (!props.date) return ''
  const d = new Date(props.date)
  if (Number.isNaN(d.getTime())) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
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
  !!resolvedUserId.value &&
  authStore.user?.role === 'admin' &&
  !(isTopup.value && isPaid.value)
)

const goPay = async () => {
  const id = resolvedUserId.value
  if (!id) return
  const query: Record<string, string> = {}
  if (resolvedAmount.value) query.amount = resolvedAmount.value
  if (props.messageId) query.messageId = String(props.messageId)
  await navigateTo({ path: `/admin/pay/${id}`, query })
}
</script>
