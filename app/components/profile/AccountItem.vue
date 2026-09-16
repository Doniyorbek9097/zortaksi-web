<template>
  <div class="relative overflow-hidden isolate">
    <div
      v-if="showDeleteHint"
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
      class="relative z-10 flex items-center gap-3 px-4 py-3 transition-colors will-change-transform"
      :class="[
        active ? 'bg-emerald-500/5' : 'active:bg-slate-50 dark:active:bg-slate-800/40',
        dragging ? '' : 'transition-transform duration-200',
      ]"
      :style="{ transform: `translate3d(${translateX}px,0,0)`, touchAction: 'pan-y pinch-zoom' }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <button
        type="button"
        class="flex items-center gap-3 flex-1 min-w-0 text-left touch-manipulation py-0.5 disabled:opacity-50"
        :disabled="disabled"
        @click.stop="onSelect"
      >
        <ProfileAvatar :name="name" :src="avatar" :user-id="userId" size="sm" />

        <div class="flex-1 min-w-0">
          <p class="text-sm font-black text-slate-900 dark:text-white truncate">{{ name }}</p>
          <p class="text-[12px] font-medium text-slate-400 dark:text-slate-500 truncate">{{ phone }}</p>
        </div>

        <span
          v-if="active"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wide shrink-0"
        >
          <font-awesome-icon icon="fa-solid fa-check" class="text-[9px]" />
          Faol
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
  phone: string
  avatar?: string
  userId?: string
  active?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{ select: []; delete: [] }>()

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
  enabled: () => !props.disabled,
})

const onSelect = () => {
  if (moved.value) {
    moved.value = false
    return
  }
  emit('select')
}
</script>
