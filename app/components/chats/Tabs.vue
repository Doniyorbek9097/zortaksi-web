<template>
  <div
    class="grid grid-cols-2 p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
    role="tablist"
    aria-label="Chat turlari"
  >
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      role="tab"
      :aria-selected="modelValue === tab.id"
      class="relative flex items-center justify-center gap-1.5 min-h-9 px-2 rounded-xl text-[12px] font-black transition-all active:scale-[0.98]"
      :class="
        modelValue === tab.id
          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
          : 'text-slate-500 dark:text-slate-400'
      "
      @click="$emit('update:modelValue', tab.id)"
    >
      <font-awesome-icon :icon="tab.icon" class="text-[11px] opacity-80" />
      <span>{{ tab.label }}</span>
      <span
        v-if="tab.unread > 0"
        class="min-w-[1.1rem] h-4 px-1 rounded-full text-[9px] font-black inline-flex items-center justify-center"
        :class="
          modelValue === tab.id
            ? 'bg-sky-500 text-white'
            : 'bg-slate-400/30 text-slate-600 dark:text-slate-300'
        "
      >
        {{ tab.unread > 99 ? '99+' : tab.unread }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
export type ChatsTabId = 'app' | 'telegram'

defineProps<{
  modelValue: ChatsTabId
  appUnread?: number
  telegramUnread?: number
}>()

defineEmits<{
  'update:modelValue': [ChatsTabId]
}>()

const props = defineProps<{
  modelValue: ChatsTabId
  appUnread?: number
  telegramUnread?: number
}>()

const tabs = computed(() => [
  {
    id: 'app' as const,
    label: 'Ilova',
    icon: 'fa-solid fa-mobile-screen',
    unread: Number(props.appUnread) || 0,
  },
  {
    id: 'telegram' as const,
    label: 'Telegram',
    icon: 'fa-brands fa-telegram',
    unread: Number(props.telegramUnread) || 0,
  },
])
</script>
