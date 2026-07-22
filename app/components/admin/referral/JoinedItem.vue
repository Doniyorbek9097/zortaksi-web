<template>
  <div
    class="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
  >
    <div
      class="w-11 h-11 rounded-full flex items-center justify-center text-[12px] font-black text-white shrink-0"
      :style="{ background: avatarColor }"
    >
      {{ initials }}
    </div>

    <div class="flex-1 min-w-0">
      <p class="text-sm font-black text-slate-900 dark:text-white truncate">{{ name }}</p>
      <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
        @{{ username }}
      </p>
    </div>

    <div class="text-right shrink-0 space-y-1">
      <span
        class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black border"
        :class="active
          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60'
          : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'"
      >
        {{ active ? 'Faol' : 'Faol emas' }}
      </span>
      <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500">{{ date }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string
  username: string
  active?: boolean
  date: string
}>()

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
})

const avatarColor = computed(() => {
  const colors = ['#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e']
  let hash = 0
  for (const ch of props.name) hash = (hash + ch.charCodeAt(0)) % colors.length
  return colors[hash]
})
</script>
