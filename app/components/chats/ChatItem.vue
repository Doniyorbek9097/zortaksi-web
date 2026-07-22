<template>
  <button
    type="button"
    class="w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left bg-white dark:bg-slate-900 border transition-all active:scale-[0.99]"
    :class="selected
      ? 'border-indigo-400 dark:border-indigo-500/60 ring-2 ring-indigo-500/20'
      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'"
    @click="$emit(selectionMode ? 'toggle' : 'open')"
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

    <ProfileAvatar :name="name" :src="avatar" size="md" />

    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-2">
        <p class="text-sm font-black text-slate-900 dark:text-white truncate">{{ name }}</p>
        <span class="text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0">{{ date }}</span>
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
          class="shrink-0 min-w-[18px] h-[18px] px-1.5 rounded-full bg-indigo-500 text-white text-[10px] font-black flex items-center justify-center"
        >
          {{ unread > 99 ? '99+' : unread }}
        </span>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
interface Props {
  name: string
  preview: string
  date?: string
  phone?: string
  avatar?: string
  media?: boolean
  unread?: number
  selectionMode?: boolean
  selected?: boolean
}

withDefaults(defineProps<Props>(), {
  date: '',
  media: false,
  unread: 0,
  selectionMode: false,
  selected: false,
})

defineEmits<{ open: []; toggle: [] }>()
</script>
