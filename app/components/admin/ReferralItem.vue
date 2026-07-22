<template>
  <div
    class="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
  >
    <!-- Rank -->
    <div class="w-7 shrink-0 flex items-center justify-center">
      <span
        v-if="rank <= 3"
        class="w-7 h-7 rounded-full flex items-center justify-center text-[12px]"
        :class="medalClass"
      >
        <font-awesome-icon icon="fa-solid fa-medal" />
      </span>
      <span v-else class="text-sm font-black text-slate-400">{{ rank }}</span>
    </div>

    <!-- Avatar -->
    <div
      class="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-black text-white shrink-0"
      :style="{ background: avatarColor }"
    >
      {{ initials }}
    </div>

    <!-- Name -->
    <div class="flex-1 min-w-0">
      <p class="text-sm font-black text-slate-900 dark:text-white truncate">{{ name }}</p>
      <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
        {{ username ? `@${username}` : phone }}
      </p>
    </div>

    <!-- Stats -->
    <div class="text-right shrink-0">
      <p class="text-[12px] font-bold text-slate-500 dark:text-slate-400">{{ invites }} ta</p>
      <p class="text-[12px] font-black text-emerald-500">+{{ formattedBonus }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  rank: number
  name: string
  username?: string
  phone?: string
  invites: number
  bonus: number
}

const props = defineProps<Props>()

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
})

const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4']
const avatarColor = computed(() => colors[(props.rank - 1) % colors.length])

const medalClass = computed(() => {
  if (props.rank === 1) return 'bg-amber-400/20 text-amber-500'
  if (props.rank === 2) return 'bg-slate-300/40 text-slate-500'
  return 'bg-orange-400/20 text-orange-600'
})

const formattedBonus = computed(() => props.bonus.toLocaleString('ru-RU'))
</script>
