<template>
  <div class="relative overflow-hidden isolate">
    <div
      v-if="deletable && showDeleteHint"
      class="absolute inset-y-0 right-0 w-11 flex items-center justify-center pointer-events-none z-0"
    >
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center bg-red-500 text-white shadow-sm transition-opacity"
        :style="{ opacity: deleteOpacity }"
      >
        <font-awesome-icon icon="fa-solid fa-trash" class="text-[12px]" />
      </div>
    </div>

    <div
      class="relative z-10 flex items-center gap-3 px-4 py-3 will-change-transform"
      :class="[
        linkable ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-800 transition-colors' : '',
        dragging ? '' : 'transition-transform duration-200',
      ]"
      :style="{ transform: `translate3d(${translateX}px,0,0)`, touchAction: 'pan-y pinch-zoom' }"
      :role="linkable ? 'button' : undefined"
      :tabindex="linkable ? 0 : undefined"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @click="onClick"
      @keydown.enter.prevent="onClick"
    >
      <span
        class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        :class="iconClass"
      >
        <font-awesome-icon :icon="iconName" class="text-sm" />
      </span>
      <div class="flex-1 min-w-0">
        <p class="text-[13px] font-black text-slate-900 dark:text-white truncate">
          {{ title }}
        </p>
        <p
          v-if="driverLine"
          class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate"
        >
          {{ driverLine }}
        </p>
        <div class="mt-1 flex flex-wrap items-center gap-1.5">
          <span
            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wide"
            :class="methodBadgeClass"
          >
            <font-awesome-icon :icon="methodIcon" class="text-[8px]" />
            {{ methodLabel }}
          </span>
          <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {{ dateLabel }}
          </span>
        </div>
      </div>
      <div class="text-right shrink-0">
        <p class="text-sm font-black text-emerald-500">
          +{{ amountLabel }}
        </p>
        <p class="text-[10px] font-bold text-emerald-600/80 dark:text-emerald-400/80">
          {{ statusLabel }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  deletable?: boolean
  deleting?: boolean
  linkable?: boolean
  title: string
  driverLine?: string
  methodLabel: string
  methodBadgeClass: string
  methodIcon: string
  dateLabel: string
  amountLabel: string
  statusLabel: string
  iconName: string
  iconClass: string
}>()

const emit = defineEmits<{ open: []; delete: [] }>()

const {
  translateX,
  dragging,
  moved,
  deleteOpacity,
  showDeleteHint,
  onPointerDown,
  onPointerMove,
  onPointerUp,
} = useSwipeToDelete(() => emit('delete'), {
  enabled: () => !!props.deletable && !props.deleting,
})

const onClick = () => {
  if (moved.value) {
    moved.value = false
    return
  }
  if (props.linkable) emit('open')
}
</script>
