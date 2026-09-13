<template>
  <button
    type="button"
    class="flex items-center gap-2 w-full py-2 border-b border-slate-100/80 dark:border-slate-800/80 last:border-0 text-left active:opacity-80 transition-opacity disabled:opacity-60"
    :disabled="!userId"
    @click="openProfile"
  >
    <div class="relative shrink-0 pointer-events-none">
      <ProfileAvatar :name="name" :src="avatar" :user-id="userId" size="sm" />
      <span
        class="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-0.5 rounded-full flex items-center justify-center text-[8px] font-black shadow ring-[1.5px] ring-white dark:ring-slate-900"
        :class="rankBadgeClass"
      >
        <font-awesome-icon
          v-if="rank <= 3"
          icon="fa-solid fa-medal"
          class="text-[9px]"
        />
        <span v-else>{{ rank }}</span>
      </span>
    </div>

    <div class="flex-1 min-w-0 pointer-events-none">
      <p class="text-[12px] font-black text-slate-900 dark:text-white truncate leading-tight">
        {{ name }}
      </p>
      <p
        v-if="groupTitle || username"
        class="mt-0.5 text-[9px] font-semibold text-slate-400 dark:text-slate-500 truncate"
      >
        <template v-if="groupTitle">{{ groupTitle }}</template>
        <template v-else-if="username">@{{ username }}</template>
      </p>
    </div>

    <div class="text-right shrink-0 pointer-events-none">
      <p class="text-[11px] font-black tabular-nums leading-none">
        <span class="text-sky-600 dark:text-sky-400">{{ invites }}</span>
        <span class="text-[9px] font-bold text-slate-400 mx-0.5">ta</span>
        <span class="text-slate-300 dark:text-slate-600">·</span>
        <span class="text-emerald-600 dark:text-emerald-400 ml-0.5">+{{ formattedBonus }}</span>
      </p>
    </div>
  </button>
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
  if (props.rank === 1) return 'bg-amber-400 text-amber-950'
  if (props.rank === 2) return 'bg-slate-300 text-slate-800'
  if (props.rank === 3) return 'bg-orange-400 text-orange-950'
  return 'bg-violet-500 text-white'
})

const formattedBonus = computed(() => props.bonus.toLocaleString('ru-RU'))

const openProfile = () => {
  openUserProfile({
    userId: props.userId,
    name: props.name,
    avatar: props.avatar,
    username: props.username,
  })
}
</script>
