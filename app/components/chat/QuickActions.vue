<template>
  <div
    v-if="items.length"
    class="shrink-0 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80"
  >
    <div class="mx-auto w-full max-w-2xl px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar">
      <a
        v-for="item in items"
        :key="item.key"
        :href="item.href"
        :target="item.external ? '_blank' : undefined"
        :rel="item.external ? 'noopener noreferrer' : undefined"
        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black whitespace-nowrap shrink-0 active:scale-[0.98] transition-all"
        :class="item.class"
        @click="item.onClick"
      >
        <font-awesome-icon :icon="item.icon" class="text-xs shrink-0" />
        <span>{{ item.label }}</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
export type QuickActionItem = {
  key: string
  label: string
  icon: string
  href?: string
  external?: boolean
  class: string
  onClick?: (e: Event) => void
}

interface Props {
  items: QuickActionItem[]
}

defineProps<Props>()
</script>
