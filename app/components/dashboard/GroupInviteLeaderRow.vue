<template>
  <div
    class="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
  >
    <div class="relative shrink-0">
      <ProfileAvatar :name="name" :src="avatar" :user-id="userId" size="md" />
      <span
        class="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center text-[10px] font-black shadow-md ring-2 ring-white dark:ring-slate-900"
        :class="rankBadgeClass"
      >
        <font-awesome-icon
          v-if="rank <= 3"
          icon="fa-solid fa-medal"
          class="text-[11px]"
        />
        <span v-else>{{ rank }}</span>
      </span>
    </div>

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

const rankBadgeClass = computed(() => {
  if (props.rank === 1) {
    return 'bg-amber-400 text-amber-950'
  }
  if (props.rank === 2) {
    return 'bg-slate-300 text-slate-800'
  }
  if (props.rank === 3) {
    return 'bg-orange-400 text-orange-950'
  }
  return 'bg-violet-500 text-white'
})

const formattedBonus = computed(() => props.bonus.toLocaleString('ru-RU'))
</script>
