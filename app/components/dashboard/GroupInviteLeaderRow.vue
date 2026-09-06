<template>
  <div
    class="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
  >
    <div class="w-8 shrink-0 flex items-center justify-center">
      <span
        v-if="rank <= 3"
        class="w-8 h-8 rounded-full flex items-center justify-center text-[12px]"
        :class="medalClass"
      >
        <font-awesome-icon icon="fa-solid fa-medal" />
      </span>
      <span
        v-else
        class="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800"
      >
        {{ rank }}
      </span>
    </div>

    <ProfileAvatar :name="name" :src="avatar" :user-id="userId" size="md" />

    <div class="flex-1 min-w-0">
      <p class="text-[13px] font-black text-slate-900 dark:text-white truncate leading-tight">
        {{ name }}
      </p>
      <p
        v-if="groupTitle"
        class="mt-0.5 text-[10px] font-bold text-violet-600/90 dark:text-violet-400/90 truncate flex items-center gap-1"
      >
        <font-awesome-icon icon="fa-solid fa-user-group" class="text-[9px] shrink-0 opacity-70" />
        {{ groupTitle }}
      </p>
      <p
        v-if="username"
        class="mt-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate"
      >
        @{{ username }}
      </p>
    </div>

    <div class="text-right shrink-0 min-w-[72px]">
      <p class="text-[14px] font-black text-sky-600 dark:text-sky-400 tabular-nums leading-none">
        {{ invites }}
        <span class="text-[10px] font-bold text-slate-400">ta</span>
      </p>
      <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">qo'shgan</p>
      <p class="text-[12px] font-black text-emerald-500 dark:text-emerald-400 tabular-nums mt-1">
        +{{ formattedBonus }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  rank: number
  name: string
  username?: string
  avatar?: string
  userId?: string
  groupTitle?: string
  invites: number
  bonus: number
}

const props = defineProps<Props>()

const medalClass = computed(() => {
  if (props.rank === 1) return 'bg-amber-400/25 text-amber-500 ring-1 ring-amber-400/30'
  if (props.rank === 2) return 'bg-slate-300/40 text-slate-500 ring-1 ring-slate-300/50'
  return 'bg-orange-400/20 text-orange-600 ring-1 ring-orange-400/30'
})

const formattedBonus = computed(() => props.bonus.toLocaleString('ru-RU'))
</script>
