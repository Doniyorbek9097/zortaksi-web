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

    <ProfileAvatar :name="name" :src="avatar" :user-id="userId" size="sm" />

    <!-- Name -->
    <div class="flex-1 min-w-0">
      <p class="text-sm font-black text-slate-900 dark:text-white truncate">{{ name }}</p>
      <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
        {{ username ? `@${username}` : phone }}
      </p>
    </div>

    <!-- Stats — har user uchun taklif qilinganlar soni -->
    <div class="text-right shrink-0">
      <p class="text-[13px] font-black text-slate-800 dark:text-slate-100 tabular-nums">
        {{ invites }}
        <span class="text-[11px] font-bold text-slate-400">ta</span>
      </p>
      <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500">taklif</p>
      <p class="text-[12px] font-black text-emerald-500 mt-0.5">+{{ formattedBonus }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  rank: number
  name: string
  username?: string
  phone?: string
  avatar?: string
  userId?: string
  invites: number
  bonus: number
}

const props = defineProps<Props>()

const medalClass = computed(() => {
  if (props.rank === 1) return 'bg-amber-400/20 text-amber-500'
  if (props.rank === 2) return 'bg-slate-300/40 text-slate-500'
  return 'bg-orange-400/20 text-orange-600'
})

const formattedBonus = computed(() => props.bonus.toLocaleString('ru-RU'))
</script>
