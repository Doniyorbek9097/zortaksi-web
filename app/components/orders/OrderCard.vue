<template>
  <div class="relative overflow-hidden rounded-2xl">
    <!-- Swipe orqasidagi o'chirish paneli (faqat admin) -->
    <button
      v-if="isAdmin"
      type="button"
      class="absolute inset-y-0 right-0 w-[88px] flex flex-col items-center justify-center gap-1 bg-red-500 text-white"
      @click="onDelete"
    >
      <font-awesome-icon icon="fa-solid fa-trash" />
      <span class="text-[11px] font-black">O'chirish</span>
    </button>

    <!-- Karta -->
    <article
      class="relative z-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-sky-400 dark:border-l-sky-500 pt-4 px-4 pb-4"
      :class="dragging ? '' : 'transition-transform duration-200'"
      :style="{ transform: `translateX(${translateX}px)`, touchAction: 'pan-y' }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <!-- Group badge -->
      <div class="flex justify-center mb-3">
        <div
          class="flex items-center gap-1.5 max-w-full px-3 py-1 rounded-full bg-indigo-50 dark:bg-slate-800 border border-indigo-200/70 dark:border-slate-700 shadow-sm"
        >
          <font-awesome-icon
            :icon="group.username ? 'fa-solid fa-circle-check' : 'fa-solid fa-paper-plane'"
            class="text-[11px] text-sky-500 shrink-0"
          />
          <span class="text-[11px] font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-300 truncate">
            {{ group.title }}
          </span>
        </div>
      </div>

      <!-- Sender -->
      <div class="flex items-center gap-3">
        <ProfileAvatar :name="senderName" size="sm" />
        <div class="min-w-0">
          <p class="text-sm font-black text-indigo-600 dark:text-indigo-400 truncate">{{ senderName }}</p>
          <p class="text-[12px] font-bold text-emerald-500">{{ time }}</p>
        </div>
      </div>

      <div class="my-3 border-t border-slate-100 dark:border-slate-800" />

      <!-- Message (telefon raqamlar server tomonda yashirilgan) -->
      <p class="text-[13px] leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line break-words">{{ order.message?.text }}</p>

      <!-- Qulflangan (aktiv emas, admin emas) -->
      <button
        v-if="locked"
        type="button"
        class="mt-4 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-400/30 dark:border-amber-500/20 hover:bg-amber-500/15 active:scale-[0.98] transition-all"
        @click="$emit('unlock')"
      >
        <font-awesome-icon icon="fa-solid fa-lock" class="text-xs" />
        Tariffga ulanish →
      </button>

      <!-- Amallar (admin yoki aktiv user) -->
      <div v-else class="mt-4 space-y-2">
        <!-- Band qilish -->
        <button
          type="button"
          class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 active:scale-[0.98] transition-all"
          @click="$emit('book')"
        >
          <font-awesome-icon icon="fa-solid fa-circle-check" />
          Band qilish · {{ bookPrice.toLocaleString('ru-RU') }} so'm
        </button>

        <!-- Xabar yozish / Guruhda ko'rish -->
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 hover:bg-sky-500/15 active:scale-[0.98] transition-all"
            @click="$emit('message')"
          >
            <font-awesome-icon icon="fa-solid fa-comments" />
            Xabar yozish
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 hover:bg-violet-500/15 active:scale-[0.98] transition-all"
            @click="$emit('view-group')"
          >
            <font-awesome-icon icon="fa-solid fa-search" />
            Guruhda ko'rish
          </button>
        </div>

        <!-- Admin amallari -->
        <div v-if="isAdmin" class="grid grid-cols-3 gap-2">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/15 active:scale-[0.98] transition-all"
            @click="$emit('agent')"
          >
            <font-awesome-icon icon="fa-solid fa-headset" />
            Agent
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15 active:scale-[0.98] transition-all"
            @click="$emit('stop-group')"
          >
            <font-awesome-icon icon="fa-solid fa-ban" />
            Guruh to'xtat
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15 active:scale-[0.98] transition-all"
            @click="$emit('stop-user')"
          >
            <font-awesome-icon icon="fa-solid fa-ban" />
            User to'xtat
          </button>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { IOrder } from '~/types'

interface Props {
  order: IOrder
  role?: 'admin' | 'driver' | 'customer'
  active?: boolean
  bookPrice?: number
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  bookPrice: 1000,
})

const emit = defineEmits<{
  book: []
  message: []
  'view-group': []
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

const group = computed(() => props.order.group)

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

// --- Swipe-to-delete (faqat admin) ---
const REVEAL = 88
const translateX = ref(0)
const dragging = ref(false)
const startX = ref(0)

const onPointerDown = (e: PointerEvent) => {
  if (!isAdmin.value) return
  dragging.value = true
  startX.value = e.clientX - translateX.value
}

const onPointerMove = (e: PointerEvent) => {
  if (!dragging.value) return
  let dx = e.clientX - startX.value
  if (dx > 0) dx = 0
  if (dx < -REVEAL) dx = -REVEAL
  translateX.value = dx
}

const onPointerUp = () => {
  if (!dragging.value) return
  dragging.value = false
  translateX.value = translateX.value < -REVEAL / 2 ? -REVEAL : 0
}

const onDelete = () => {
  translateX.value = 0
  emit('delete')
}
</script>
