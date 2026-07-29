<template>
  <div
    class="w-full rounded-2xl border transition-colors overflow-hidden"
    :class="selected
      ? 'border-amber-400/70 bg-amber-50 dark:bg-amber-950/30'
      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'"
  >
    <div class="flex gap-3 p-3">
      <!-- Checkbox (Meniki) -->
      <button
        v-if="selectable"
        type="button"
        class="self-center w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0"
        :class="selected
          ? 'border-amber-500 bg-amber-500 text-white'
          : 'border-slate-300 dark:border-slate-600'"
        @click="emit('toggle')"
      >
        <font-awesome-icon
          v-if="selected"
          icon="fa-solid fa-check"
          class="text-[9px]"
        />
      </button>

      <!-- Katta avatar -->
      <button
        type="button"
        class="shrink-0 rounded-2xl focus:outline-none"
        :class="selectable ? 'cursor-pointer' : 'cursor-default'"
        :disabled="!selectable"
        @click="selectable && emit('toggle')"
      >
        <ProfileAvatar
          :name="group.title"
          :src="group.avatar"
          size="xl"
          shape="rounded"
        />
      </button>

      <!-- Title / username / members -->
      <button
        type="button"
        class="flex-1 min-w-0 text-left space-y-1.5"
        :class="selectable ? 'cursor-pointer' : 'cursor-default'"
        :disabled="!selectable"
        @click="selectable && emit('toggle')"
      >
        <div class="flex items-start gap-1.5 flex-wrap">
          <h3 class="text-[15px] font-black leading-snug text-slate-900 dark:text-white break-words">
            {{ group.title }}
          </h3>
          <span
            v-if="group.isAdmin && showAdminBadge"
            class="shrink-0 mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-wide bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-400/35"
          >
            Admin
          </span>
          <span
            v-if="showVisibleBadge && group.visibleToDrivers"
            class="shrink-0 mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-wide bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-400/35"
          >
            Haydovchiga
          </span>
        </div>

        <p class="text-[12px] font-semibold text-sky-600 dark:text-sky-400 truncate">
          {{ group.username ? `@${group.username}` : "Username yo'q" }}
        </p>

        <div class="flex items-center gap-2 flex-wrap">
          <span
            class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <font-awesome-icon icon="fa-solid fa-users" class="text-[10px] text-slate-400" />
            <template v-if="group.membersCount">
              {{ formatMembers(group.membersCount) }} a'zo
            </template>
            <template v-else>
              A'zolar noma'lum
            </template>
          </span>
          <span
            v-if="group.connections > 1"
            class="text-[10px] font-semibold text-slate-400"
          >
            {{ group.connections }} haydovchi
          </span>
        </div>
      </button>

      <!-- Actions -->
      <div class="shrink-0 self-center flex flex-col gap-1.5">
        <button
          v-if="showJoin"
          type="button"
          class="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-[10px] font-black border border-sky-400/50 text-sky-600 dark:text-sky-400 bg-sky-500/10 active:scale-95 disabled:opacity-60 whitespace-nowrap"
          :disabled="joining"
          @click.stop="emit('join')"
        >
          <font-awesome-icon
            v-if="joining"
            icon="fa-solid fa-spinner"
            class="animate-spin text-[9px]"
          />
          {{ joining ? 'Ulanmoqda...' : "A'zo bo'lish" }}
        </button>

        <button
          v-if="showVisibility"
          type="button"
          class="w-9 h-9 rounded-xl flex items-center justify-center border active:scale-95"
          :class="group.visibleToDrivers
            ? 'border-violet-400/60 bg-violet-500/15 text-violet-600 dark:text-violet-400'
            : 'border-slate-200 dark:border-slate-700 text-slate-400'"
          :title="group.visibleToDrivers ? 'Haydovchilardan yashirish' : 'Haydovchilarga korsatish'"
          @click.stop="emit('toggle-visibility')"
        >
          <font-awesome-icon
            :icon="group.visibleToDrivers ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"
            class="text-[12px]"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PostGroup } from '~/stores/post.store'

const props = defineProps<{
  group: PostGroup
  selected?: boolean
  selectable?: boolean
  showJoin?: boolean
  joining?: boolean
  showVisibility?: boolean
  showAdminBadge?: boolean
  showVisibleBadge?: boolean
}>()

const emit = defineEmits<{
  toggle: []
  join: []
  'toggle-visibility': []
}>()

const formatMembers = (n?: number) => {
  const v = Number(n) || 0
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return v.toLocaleString('ru-RU')
}
</script>
