<template>
  <div class="relative overflow-hidden rounded-2xl isolate">
    <!-- Delete — faqat swipe ochilganda (yopiqda umuman yo'q) -->
    <button
      v-if="!selectionMode && translateX < 0"
      type="button"
      class="absolute inset-y-0 right-0 z-0 w-[200px] flex flex-col items-center justify-center gap-1 bg-red-500 text-white"
      @click="onDelete"
    >
      <font-awesome-icon icon="fa-solid fa-trash" />
      <span class="text-[11px] font-black">O'chirish</span>
    </button>

    <button
      type="button"
      class="relative z-10 w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left border will-change-transform"
      :class="[
        support
          ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-800/70'
          : 'bg-white dark:bg-slate-900',
        selected
          ? 'border-indigo-400 dark:border-indigo-500/60 ring-2 ring-indigo-500/20'
          : support
            ? ''
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
        dragging ? '' : 'transition-transform duration-200',
      ]"
      :style="{ transform: `translate3d(${translateX}px,0,0)`, touchAction: selectionMode ? 'auto' : 'pan-y' }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @click="onClick"
    >
      <!-- Checkbox (selection mode) -->
      <span
        v-if="selectionMode"
        class="w-5 h-5 shrink-0 rounded-md flex items-center justify-center border-2 transition-colors"
        :class="selected
          ? 'bg-indigo-500 border-indigo-500 text-white'
          : 'border-slate-300 dark:border-slate-600 text-transparent'"
      >
        <font-awesome-icon icon="fa-solid fa-check" class="text-[10px]" />
      </span>

      <div
        v-if="support"
        class="w-11 h-11 shrink-0 rounded-xl bg-teal-500 text-white flex items-center justify-center"
      >
        <font-awesome-icon icon="fa-solid fa-headset" />
      </div>
      <ProfileAvatar v-else :name="name" :src="avatar" :user-id="userId" size="md" />

      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-black text-slate-900 dark:text-white truncate">
            {{ name }}
          </p>
          <div class="flex items-center gap-1.5 shrink-0">
            <button
              v-if="showDriverPage"
              type="button"
              class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black text-violet-600 dark:text-violet-400 bg-violet-500/10 active:scale-95"
              @click.stop="$emit('driver-page')"
            >
              <font-awesome-icon icon="fa-solid fa-car" />
              Haydovchi
            </button>
            <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500">{{ date }}</span>
          </div>
        </div>

        <p v-if="phone" class="flex items-center gap-1.5 text-[12px] font-bold text-emerald-500 truncate">
          <font-awesome-icon icon="fa-solid fa-phone" class="text-[10px]" />
          {{ phone }}
        </p>

        <div class="flex items-center justify-between gap-2">
          <p
            class="flex items-center gap-1.5 text-[12px] truncate"
            :class="unread > 0
              ? 'font-bold text-slate-700 dark:text-slate-200'
              : 'font-medium text-slate-400 dark:text-slate-500'"
          >
            <font-awesome-icon v-if="media" icon="fa-solid fa-image" class="text-[10px] shrink-0" />
            <span class="truncate">{{ preview }}</span>
          </p>

          <span
            v-if="unread > 0 && !selectionMode"
            class="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-sm"
          >
            {{ unread > 99 ? '99+' : unread }}
          </span>
        </div>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
  preview: string
  date?: string
  phone?: string
  avatar?: string
  userId?: string
  media?: boolean
  unread?: number
  selectionMode?: boolean
  selected?: boolean
  support?: boolean
  showDriverPage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  date: '',
  media: false,
  unread: 0,
  selectionMode: false,
  selected: false,
  support: false,
  showDriverPage: false,
})

const emit = defineEmits<{ open: []; toggle: []; delete: []; 'driver-page': [] }>()

const REVEAL = 200
const translateX = ref(0)
const dragging = ref(false)
const startX = ref(0)
const originX = ref(0)
const originY = ref(0)
const axisLocked = ref<'h' | 'v' | null>(null)
const moved = ref(false)

watch(
  () => props.selectionMode,
  (v) => {
    if (v) translateX.value = 0
  }
)

const onPointerDown = (e: PointerEvent) => {
  if (props.selectionMode) return
  dragging.value = true
  moved.value = false
  axisLocked.value = null
  originX.value = e.clientX
  originY.value = e.clientY
  startX.value = e.clientX - translateX.value
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
}

const onPointerMove = (e: PointerEvent) => {
  if (!dragging.value || props.selectionMode) return
  const rawDx = e.clientX - originX.value
  const rawDy = e.clientY - originY.value
  if (!axisLocked.value) {
    if (Math.abs(rawDx) < 8 && Math.abs(rawDy) < 8) return
    axisLocked.value = Math.abs(rawDx) >= Math.abs(rawDy) ? 'h' : 'v'
    if (axisLocked.value === 'v') {
      dragging.value = false
      return
    }
  }
  if (axisLocked.value !== 'h') return
  moved.value = true
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
  if (axisLocked.value === 'h') {
    translateX.value = translateX.value <= -REVEAL * 0.75 ? -REVEAL : 0
  }
  axisLocked.value = null
}

const onClick = () => {
  // Swipe yoki ochiq delete panel — chat ochilmasin
  if (moved.value) return
  if (translateX.value !== 0) {
    translateX.value = 0
    return
  }
  emit(props.selectionMode ? 'toggle' : 'open')
}

const onDelete = () => {
  translateX.value = 0
  emit('delete')
}
</script>
