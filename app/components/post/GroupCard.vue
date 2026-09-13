<template>
  <div
    class="w-full rounded-2xl border transition-colors overflow-hidden"
    :class="selected
      ? 'border-amber-400/70 bg-amber-50 dark:bg-amber-950/30'
      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'"
  >
    <div class="relative overflow-hidden">
      <!-- O'ngga surish: Ko'rish / Qo'shilish -->
      <div
        v-if="swipeEnabled && swipeX > 4 && rightAction"
        class="absolute inset-y-0 left-0 w-14 flex items-center justify-center pointer-events-none"
      >
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm transition-opacity"
          :class="rightAction.tone"
          :style="{ opacity: swipeRightOpacity }"
        >
          <font-awesome-icon
            v-if="rightAction.loading"
            icon="fa-solid fa-spinner"
            class="animate-spin text-[12px]"
          />
          <font-awesome-icon
            v-else
            :icon="rightAction.icon"
            class="text-[12px]"
          />
        </div>
      </div>

      <!-- Chapga surish: Tark etish -->
      <div
        v-if="swipeEnabled && swipeX < -4 && showLeave"
        class="absolute inset-y-0 right-0 w-14 flex items-center justify-center pointer-events-none"
      >
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center bg-rose-500 text-white shadow-sm transition-opacity"
          :style="{ opacity: swipeLeftOpacity }"
        >
          <font-awesome-icon
            v-if="leaving"
            icon="fa-solid fa-spinner"
            class="animate-spin text-[12px]"
          />
          <font-awesome-icon
            v-else
            icon="fa-solid fa-right-from-bracket"
            class="text-[12px]"
          />
        </div>
      </div>

      <div
        class="relative bg-inherit"
        :class="[
          swipeDragging ? 'will-change-transform' : 'transition-transform duration-200',
        ]"
        :style="{
          transform: swipeEnabled ? `translate3d(${swipeX}px,0,0)` : undefined,
          touchAction: swipeEnabled ? 'pan-y pinch-zoom' : 'auto',
        }"
        @pointerdown="onSwipePointerDown"
        @pointermove="onSwipePointerMove"
        @pointerup="onSwipePointerUp"
        @pointercancel="onSwipePointerUp"
      >
        <div class="flex gap-3 p-3">
          <button
            type="button"
            class="relative shrink-0 rounded-2xl focus:outline-none"
            :class="selectable ? 'cursor-pointer' : 'cursor-default'"
            :disabled="!selectable"
            @click="onToggleClick"
          >
            <ProfileAvatar
              :name="group.title"
              :src="group.avatar"
              size="xl"
              shape="rounded"
            />
            <span
              v-if="selectable && selected"
              class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow border-2 border-white dark:border-slate-900"
            >
              <font-awesome-icon icon="fa-solid fa-check" class="text-[9px]" />
            </span>
          </button>

          <button
            type="button"
            class="flex-1 min-w-0 text-left"
            :class="selectable ? 'cursor-pointer' : 'cursor-default'"
            :disabled="!selectable"
            @click="onToggleClick"
          >
            <div class="flex items-start gap-1.5">
              <div class="flex-1 min-w-0 space-y-1">
                <div class="flex items-start gap-1.5 flex-wrap min-w-0">
                  <h3 class="text-[13px] font-bold leading-snug text-slate-800 dark:text-slate-100 truncate min-w-0 flex-1">
                    {{ group.title }}
                  </h3>
                  <span
                    v-if="group.isAdmin && showAdminBadge"
                    class="shrink-0 mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-wide bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-400/35"
                  >
                    Admin
                  </span>
                  <span
                    v-if="showVisibleBadge && group.visibleToDrivers"
                    class="shrink-0 mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-wide bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-400/35"
                  >
                    Haydovchiga
                  </span>
                </div>

                <p class="text-[14px] font-black text-sky-600 dark:text-sky-400 break-all leading-snug">
                  {{ group.username ? `@${group.username}` : "Username yo'q" }}
                </p>

                <p class="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                  {{ membersLabel }}
                </p>

                <p
                  v-if="group.connections > 1"
                  class="text-[10px] font-semibold text-slate-400"
                >
                  {{ group.connections }} haydovchi
                </p>
              </div>

              <button
                v-if="showVisibility"
                type="button"
                class="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border active:scale-95"
                :class="group.visibleToDrivers
                  ? 'border-violet-400/60 bg-violet-500/15 text-violet-600 dark:text-violet-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400'"
                :title="group.visibleToDrivers ? 'Haydovchilardan yashirish' : 'Haydovchilarga korsatish'"
                @click.stop="emit('toggle-visibility')"
                @pointerdown.stop
              >
                <font-awesome-icon
                  :icon="group.visibleToDrivers ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"
                  class="text-[12px]"
                />
              </button>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Eski tugmalar (swipe o'chirilgan bo'lsa) -->
    <div
      v-if="!swipeEnabled && (showJoin || showLeave || viewUrl)"
      class="flex items-stretch gap-2 px-3 pb-3"
    >
      <button
        v-if="showJoin"
        type="button"
        class="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-[11px] font-black border border-sky-400/50 text-sky-600 dark:text-sky-400 bg-sky-500/10 active:scale-[0.98] disabled:opacity-60 whitespace-nowrap min-w-0"
        :disabled="joining"
        @click.stop="emit('join')"
      >
        <font-awesome-icon
          v-if="joining"
          icon="fa-solid fa-spinner"
          class="animate-spin text-[11px]"
        />
        <font-awesome-icon
          v-else
          icon="fa-solid fa-user-plus"
          class="text-[11px]"
        />
        <span class="whitespace-nowrap">{{ joining ? 'Ulanmoqda...' : "Guruhga qo'shilish" }}</span>
      </button>

      <button
        v-if="showLeave"
        type="button"
        class="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-[11px] font-black border border-rose-400/40 text-rose-600 dark:text-rose-400 bg-rose-500/10 active:scale-[0.98] disabled:opacity-60 whitespace-nowrap min-w-0"
        :disabled="leaving"
        @click.stop="emit('leave')"
      >
        <font-awesome-icon
          v-if="leaving"
          icon="fa-solid fa-spinner"
          class="animate-spin text-[11px]"
        />
        <font-awesome-icon
          v-else
          icon="fa-solid fa-user-check"
          class="text-[11px]"
        />
        <span class="whitespace-nowrap">{{ leaving ? 'Chiqilmoqda...' : 'Tark etish' }}</span>
      </button>

      <button
        v-if="viewUrl"
        type="button"
        class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-black border border-emerald-400/40 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 active:scale-[0.98]"
        @click.stop="openGroup"
      >
        <font-awesome-icon icon="fa-solid fa-eye" class="text-[11px]" />
        Ko'rish
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PostGroup } from '~/stores/post.store'

const props = withDefaults(
  defineProps<{
    group: PostGroup
    selected?: boolean
    selectable?: boolean
    showJoin?: boolean
    joining?: boolean
    showLeave?: boolean
    leaving?: boolean
    showVisibility?: boolean
    showAdminBadge?: boolean
    showVisibleBadge?: boolean
    /** Chat kabi surib tugmalarni ochish */
    swipeActions?: boolean
  }>(),
  {
    swipeActions: true,
  },
)

const emit = defineEmits<{
  toggle: []
  join: []
  leave: []
  'toggle-visibility': []
}>()

const SWIPE_REVEAL = 56
const swipeX = ref(0)
const swipeDragging = ref(false)
const swipeStartX = ref(0)
const swipeOriginX = ref(0)
const swipeOriginY = ref(0)
const swipeAxis = ref<'h' | 'v' | null>(null)
const swipeMoved = ref(false)

const viewUrl = computed(() => {
  const join = String(props.group.joinUrl || '').trim()
  if (join) return join
  const username = String(props.group.username || '').replace(/^@/, '').trim()
  if (username) return `https://t.me/${username}`
  const raw = String(props.group.id || '').replace(/\D/g, '')
  if (!raw) return ''
  const channelId = raw.startsWith('100') && raw.length > 10 ? raw.slice(3) : raw
  return `https://t.me/c/${channelId}`
})

const hasRightAction = computed(() => !!(viewUrl.value || props.showJoin))
const swipeEnabled = computed(
  () =>
    props.swipeActions &&
    (hasRightAction.value || props.showLeave),
)

const rightAction = computed(() => {
  if (viewUrl.value) {
    return {
      icon: 'fa-solid fa-eye',
      tone: 'bg-emerald-500',
      loading: false,
    }
  }
  if (props.showJoin) {
    return {
      icon: 'fa-solid fa-user-plus',
      tone: 'bg-sky-500',
      loading: props.joining,
    }
  }
  return null
})

const swipeRightOpacity = computed(() =>
  Math.min(1, swipeX.value / SWIPE_REVEAL),
)

const swipeLeftOpacity = computed(() =>
  Math.min(1, -swipeX.value / SWIPE_REVEAL),
)

const formatMembers = (n?: number) => {
  const v = Number(n) || 0
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return v.toLocaleString('ru-RU')
}

const membersLabel = computed(() => {
  if (!props.group.membersCount) return "A'zolar soni noma'lum"
  return `${formatMembers(props.group.membersCount)} a'zo`
})

const openGroup = () => {
  if (!viewUrl.value || !import.meta.client) return
  window.open(viewUrl.value, '_blank', 'noopener,noreferrer')
}

const onToggleClick = (e: Event) => {
  if (swipeMoved.value) {
    e.preventDefault()
    e.stopPropagation()
    swipeMoved.value = false
    return
  }
  if (props.selectable) emit('toggle')
}

const onSwipePointerDown = (e: PointerEvent) => {
  if (!swipeEnabled.value) return
  swipeDragging.value = true
  swipeMoved.value = false
  swipeAxis.value = null
  swipeOriginX.value = e.clientX
  swipeOriginY.value = e.clientY
  swipeStartX.value = e.clientX - swipeX.value
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
}

const onSwipePointerMove = (e: PointerEvent) => {
  if (!swipeEnabled.value || !swipeDragging.value) return
  const rawDx = e.clientX - swipeOriginX.value
  const rawDy = e.clientY - swipeOriginY.value
  if (!swipeAxis.value) {
    if (Math.abs(rawDx) < 8 && Math.abs(rawDy) < 8) return
    swipeAxis.value = Math.abs(rawDx) >= Math.abs(rawDy) ? 'h' : 'v'
    if (swipeAxis.value === 'v') {
      swipeDragging.value = false
      return
    }
  }
  if (swipeAxis.value !== 'h') return
  swipeMoved.value = true
  const dx = e.clientX - swipeStartX.value
  if (dx > 0 && hasRightAction.value) {
    swipeX.value = Math.min(SWIPE_REVEAL, dx)
  } else if (dx < 0 && props.showLeave) {
    swipeX.value = Math.max(-SWIPE_REVEAL, dx)
  } else {
    swipeX.value = 0
  }
}

const triggerRightAction = () => {
  if (viewUrl.value) {
    openGroup()
    return
  }
  if (props.showJoin && !props.joining) emit('join')
}

const triggerLeftAction = () => {
  if (props.showLeave && !props.leaving) emit('leave')
}

const onSwipePointerUp = () => {
  if (!swipeEnabled.value) return
  if (!swipeDragging.value && swipeAxis.value !== 'h') {
    swipeAxis.value = null
    return
  }
  swipeDragging.value = false
  if (swipeAxis.value === 'h' && swipeX.value >= SWIPE_REVEAL * 0.65) {
    triggerRightAction()
  } else if (swipeAxis.value === 'h' && swipeX.value <= -SWIPE_REVEAL * 0.65) {
    triggerLeftAction()
  }
  swipeX.value = 0
  swipeAxis.value = null
}
</script>
