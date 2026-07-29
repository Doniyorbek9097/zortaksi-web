<template>
  <div
    v-if="group"
    class="flex gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80"
  >
    <ProfileAvatar
      :name="group.title"
      :src="group.avatar"
      size="xl"
      shape="rounded"
      class="shrink-0"
    />
    <div class="flex-1 min-w-0 space-y-1">
      <h4 class="text-[15px] font-black text-slate-900 dark:text-white break-words leading-snug">
        {{ group.title }}
      </h4>
      <p class="text-[14px] font-bold text-sky-600 dark:text-sky-400 break-all">
        {{ group.username ? `@${group.username}` : "Username yo'q" }}
      </p>
      <p class="text-[12px] font-medium text-slate-500 dark:text-slate-400">
        {{ membersLabel }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PostGroup } from '~/stores/post.store'

const props = defineProps<{
  group: PostGroup | null
}>()

const formatMembers = (n?: number) => {
  const v = Number(n) || 0
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return v.toLocaleString('ru-RU')
}

const membersLabel = computed(() => {
  if (!props.group?.membersCount) return "A'zolar soni noma'lum"
  return `${formatMembers(props.group.membersCount)} a'zo`
})
</script>
