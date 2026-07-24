<template>
  <div class="relative pt-3">
    <!-- Group title — yuqori border markazida (overflow tashqarisida) -->
    <div class="absolute left-1/2 top-3 z-20 -translate-x-1/2 -translate-y-1/2 max-w-[85%] px-2 pointer-events-none">
      <div
        class="flex items-center gap-1.5 max-w-full px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-indigo-200/70 dark:border-slate-700 shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-3.5 h-3.5 text-[#2AABEE] shrink-0"
          aria-hidden="true"
        >
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
        <span class="text-[11px] font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-300 truncate">
          {{ group.title }}
        </span>
      </div>
    </div>

    <!-- Swipe konteyner — delete faqat tortilganda chiqadi -->
    <div class="relative overflow-hidden rounded-2xl isolate">
      <button
        v-if="isAdmin && translateX < 0"
        type="button"
        class="absolute inset-y-0 right-0 z-0 w-[200px] flex flex-col items-center justify-center gap-1 bg-red-500 text-white"
        @click="onDelete"
      >
        <font-awesome-icon icon="fa-solid fa-trash" class="text-base" />
        <span class="text-[11px] font-black">O'chirish</span>
      </button>

      <!-- Karta -->
      <article
        class="relative z-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-sky-400 dark:border-l-sky-500 pt-5 px-4 pb-4 will-change-transform"
        :class="dragging ? '' : 'transition-transform duration-200'"
        :style="{ transform: `translate3d(${translateX}px,0,0)`, touchAction: 'pan-y' }"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
      <!-- Sender -->
      <div class="flex items-center gap-3">
        <ProfileAvatar :name="senderName" :src="order.sender?.avatar" :user-id="order.sender?.userId" size="sm" />
        <div class="min-w-0">
          <p class="text-sm font-black text-indigo-600 dark:text-indigo-400 truncate">{{ senderName }}</p>
          <p class="text-[12px] font-bold text-emerald-500">{{ time }}</p>
        </div>
      </div>

      <div class="my-3 border-t border-slate-100 dark:border-slate-800" />

      <!-- Message -->
      <p class="text-[15px] font-bold leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-line break-words">{{
        order.message?.text }}</p>

      <!-- Qulflangan (aktiv emas, admin emas) -->
      <button v-if="locked" type="button" data-no-swipe
        class="mt-4 w-full min-h-[46px] inline-flex items-center justify-center gap-2 px-2.5 py-3 rounded-xl text-[13px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-400/30 dark:border-amber-500/20 hover:bg-amber-500/15 active:scale-[0.98] transition-all"
        @pointerdown.stop @click.stop="$emit('unlock')">
        <font-awesome-icon icon="fa-solid fa-lock" class="text-sm" />
        Tariffga ulanish →
      </button>

      <!-- Amallar — swipe tugmalarga tegmasin (@pointerdown.stop) -->
      <div v-else class="mt-4 space-y-2" data-no-swipe @pointerdown.stop>
        <!-- Xabar / Telefon — band bo'lsa faqat band qilgan yoki admin uchun -->
        <div
          v-if="showContactActions"
          :class="callPhone ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-1'"
        >
          <button type="button"
            class="min-h-[46px] inline-flex items-center justify-center gap-2 px-2.5 py-3 rounded-xl text-[12px] font-black text-sky-600 dark:text-sky-400 bg-sky-500/10 hover:bg-sky-500/15 active:scale-[0.98] transition-all"
            @click.stop="$emit('message')">
            <font-awesome-icon icon="fa-solid fa-comments" class="text-sm" />
            Xabar yozish
          </button>
          <a v-if="callPhone" :href="normalizeTelHref(callPhone)"
            class="min-h-[46px] inline-flex items-center justify-center gap-2 px-2.5 py-3 rounded-xl text-[12px] font-black text-violet-600 dark:text-violet-400 bg-violet-500/10 hover:bg-violet-500/15 active:scale-[0.98] transition-all"
            @click.stop>
            <font-awesome-icon icon="fa-solid fa-phone" class="text-sm" />
            Telefon qilish
          </a>
        </div>

        <div class="grid grid-cols-1 gap-2">
          <!-- Band qilish -->
          <button
            v-if="!isBooked"
            type="button"
            class="w-full min-h-[46px] inline-flex items-center justify-center gap-2 px-2.5 py-3 rounded-xl text-[12px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 active:scale-[0.98] transition-all"
            @click.stop="$emit('book')"
          >
            <font-awesome-icon icon="fa-solid fa-circle-check" class="text-sm" />
            Band qilish
          </button>

          <!-- Boshqalar: band qilgan haydovchi → chat -->
          <button
            v-else-if="!isBookedByMe"
            type="button"
            class="w-full min-h-[46px] inline-flex items-center justify-between gap-2 px-3 py-3 rounded-xl text-[12px] font-black text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 active:scale-[0.98] transition-all"
            @click.stop="$emit('booked-chat')"
          >
            <span class="inline-flex items-center gap-2 min-w-0">
              <font-awesome-icon icon="fa-solid fa-user" class="text-sm text-emerald-500 shrink-0" />
              <span class="truncate">{{ bookedByName }}</span>
            </span>
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="text-sm text-slate-400 shrink-0" />
          </button>

          <!-- Band qilgan / admin: bekor -->
          <button
            v-if="canUnbook"
            type="button"
            class="w-full min-h-[46px] inline-flex items-center justify-center gap-2 px-2.5 py-3 rounded-xl text-[12px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/15 active:scale-[0.98] transition-all"
            @click.stop="$emit('unbook')"
          >
            <font-awesome-icon icon="fa-solid fa-rotate" class="text-sm" />
            Band bekor qilish
          </button>
        </div>
        <!-- Admin amallari -->
        <div v-if="isAdmin" class="grid grid-cols-3 gap-2">
          <button type="button"
            class="min-h-[46px] inline-flex items-center justify-center gap-1.5 px-2 py-3 rounded-xl text-[11px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/15 active:scale-[0.98] transition-all"
            @click.stop="$emit('agent')">
            <font-awesome-icon icon="fa-solid fa-headset" class="text-sm" />
            Agent
          </button>
          <button type="button"
            class="min-h-[46px] inline-flex items-center justify-center gap-1.5 px-2 py-3 rounded-xl text-[11px] font-black text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15 active:scale-[0.98] transition-all"
            @click.stop="$emit('stop-group')">
            <font-awesome-icon icon="fa-solid fa-ban" class="text-sm" />
            Guruh
          </button>
          <button type="button"
            class="min-h-[46px] inline-flex items-center justify-center gap-1.5 px-2 py-3 rounded-xl text-[11px] font-black text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15 active:scale-[0.98] transition-all"
            @click.stop="$emit('stop-user')">
            <font-awesome-icon icon="fa-solid fa-ban" class="text-sm" />
            User
          </button>
        </div>
      </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IOrder } from '~/types'
import { normalizeTelHref, resolveOrderPhone } from '~/utils/phone'

interface Props {
  order: IOrder
  role?: 'admin' | 'driver' | 'customer'
  active?: boolean
  bookPrice?: number
  currentUserId?: string
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  bookPrice: 1000,
  currentUserId: '',
})

const emit = defineEmits<{
  book: []
  unbook: []
  message: []
  'booked-chat': []
  agent: []
  'stop-group': []
  'stop-user': []
  delete: []
  unlock: []
}>()

const isAdmin = computed(() => props.role === 'admin')
// Amal tugmalari admin yoki aktiv userga ko'rinadi
const canAct = computed(() => isAdmin.value || props.active)
// Aktiv emas va admin emas — qulflangan (telefonlar server tomonda yashirilgan)
const locked = computed(() => !canAct.value)
const isBooked = computed(() => props.order.status === 'booked')
const isBookedByMe = computed(() => {
  if (!isBooked.value) return false
  const bookedBy = String(props.order.bookedBy || '')
  return !!props.currentUserId && bookedBy === props.currentUserId
})
const canUnbook = computed(() => {
  if (!isBooked.value) return false
  return isAdmin.value || isBookedByMe.value
})
/** Band bo'lganda boshqa haydovchilarga Xabar/Telefon yopiladi */
const showContactActions = computed(() => !isBooked.value || isBookedByMe.value || isAdmin.value)

const bookedByName = computed(() => {
  const u = props.order.bookedByUser
  const full = [u?.firstName, u?.lastName].filter(Boolean).join(' ').trim()
  if (full) return full
  if (u?.username) return u.username
  if (props.order.bookedBy) return `Haydovchi ${props.order.bookedBy}`
  return 'Band qilingan'
})

const group = computed(() => props.order.group)

/** 1) message.text → 2) sender.phone; ikkalasi yo'q → tugma chiqmaydi */
const callPhone = computed(() => resolveOrderPhone(props.order))

const senderName = computed(() => {
  const s = props.order.sender
  const full = [s?.firstName, s?.lastName].filter(Boolean).join(' ').trim()
  return full || s?.username || 'Nomsiz foydalanuvchi'
})

const time = computed(() => {
  const value = props.order.message?.date
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''

  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')

  const now = new Date()
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()

  if (isToday) return `Bugun, ${hh}:${mm}`

  const dd = String(d.getDate()).padStart(2, '0')
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mo}, ${hh}:${mm}`
})

// --- Swipe-to-delete (faqat admin) — o'ngdan 200px ---
const REVEAL = 200
const translateX = ref(0)
const dragging = ref(false)
const startX = ref(0)
const originX = ref(0)
const axisLocked = ref<'h' | 'v' | null>(null)

const isInteractiveTarget = (target: EventTarget | null) => {
  const el = target as HTMLElement | null
  if (!el?.closest) return false
  return !!el.closest('button, a, input, textarea, select, label, [data-no-swipe]')
}

const onPointerDown = (e: PointerEvent) => {
  // Swipe faqat admin + touch; sichqoncha/click tugmalarda ishlashi uchun
  if (!isAdmin.value) return
  if (e.pointerType === 'mouse') return
  if (isInteractiveTarget(e.target)) return
  dragging.value = true
  axisLocked.value = null
  originX.value = e.clientX
  startX.value = e.clientX - translateX.value
    ; (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
}

const onPointerMove = (e: PointerEvent) => {
  if (!dragging.value) return
  const rawDx = e.clientX - originX.value
  if (!axisLocked.value) {
    if (Math.abs(rawDx) < 8) return
    axisLocked.value = Math.abs(rawDx) > Math.abs(e.movementY) ? 'h' : 'v'
    if (axisLocked.value === 'v') {
      dragging.value = false
      return
    }
  }
  if (axisLocked.value !== 'h') return
  let dx = e.clientX - startX.value
  if (dx > 0) dx = 0
  if (dx < -REVEAL) dx = -REVEAL
  translateX.value = dx
}

const onPointerUp = () => {
  if (!dragging.value && axisLocked.value !== 'h') {
    axisLocked.value = null
    return
  }
  dragging.value = false
  axisLocked.value = null
  // 200px ga yaqin tortilsa ochiladi
  translateX.value = translateX.value <= -REVEAL * 0.75 ? -REVEAL : 0
}

const onDelete = () => {
  translateX.value = 0
  emit('delete')
}
</script>
