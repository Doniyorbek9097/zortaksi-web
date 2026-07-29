<template>
  <div
    class="w-full rounded-2xl border transition-colors overflow-hidden"
    :class="selected
      ? 'border-amber-400/70 bg-amber-50 dark:bg-amber-950/30'
      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'"
  >
    <!-- Yuqori: avatar + title/username -->
    <div class="flex gap-3 p-3 pb-2.5">
      <button
        type="button"
        class="relative shrink-0 rounded-2xl focus:outline-none"
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
        <span
          v-if="selectable && selected"
          class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow border-2 border-white dark:border-slate-900"
        >
          <font-awesome-icon icon="fa-solid fa-check" class="text-[9px]" />
        </span>
      </button>

      <button
        type="button"
        class="flex-1 min-w-0 text-left"
        :class="selectable ? 'cursor-pointer' : 'cursor-default'"
        :disabled="!selectable"
        @click="selectable && emit('toggle')"
      >
        <div class="flex items-start gap-1.5">
          <div class="flex-1 min-w-0 space-y-1">
            <div class="flex items-start gap-1.5 flex-wrap">
              <h3 class="text-[13px] font-bold leading-snug text-slate-800 dark:text-slate-100 break-words">
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

            <p class="text-[14px] font-black text-sky-600 dark:text-sky-400 break-all leading-snug">
              {{ group.username ? `@${group.username}` : "Username yo'q" }}
            </p>

            <p
              v-if="group.connections > 1"
              class="text-[10px] font-semibold text-slate-400"
            >
              {{ group.connections }} haydovchi
            </p>
          </div>

          <button
            v-if="showVisibility"
            type="button"
            class="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border active:scale-95"
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
      </button>
    </div>

    <!-- Past: avatar+title tagida horizontal tugmalar -->
    <div class="flex items-stretch gap-2 px-3 pb-3">
      <div
        class="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0"
      >
        <font-awesome-icon icon="fa-solid fa-users" class="text-[11px] text-slate-400" />
        <template v-if="group.membersCount">
          {{ formatMembers(group.membersCount) }} a'zo
        </template>
        <template v-else>
          — a'zo
        </template>
      </div>

      <button
        v-if="showJoin"
        type="button"
        class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-black border border-sky-400/50 text-sky-600 dark:text-sky-400 bg-sky-500/10 active:scale-[0.98] disabled:opacity-60"
        :disabled="joining"
        @click.stop="emit('join')"
      >
        <font-awesome-icon
          v-if="joining"
          icon="fa-solid fa-spinner"
          class="animate-spin text-[11px]"
        />
        <font-awesome-icon
          v-else
          icon="fa-solid fa-user-plus"
          class="text-[11px]"
        />
        {{ joining ? 'Ulanmoqda...' : "A'zo bo'lish" }}
      </button>

      <button
        v-if="viewUrl"
        type="button"
        class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-black border border-emerald-400/40 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 active:scale-[0.98]"
        @click.stop="openGroup"
      >
        <font-awesome-icon icon="fa-solid fa-eye" class="text-[11px]" />
        Ko'rish
      </button>
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

const viewUrl = computed(() => {
  const join = String(props.group.joinUrl || '').trim()
  if (join) return join
  const username = String(props.group.username || '').replace(/^@/, '').trim()
  if (username) return `https://t.me/${username}`
  const raw = String(props.group.id || '').replace(/\D/g, '')
  if (!raw) return ''
  const channelId = raw.startsWith('100') && raw.length > 10 ? raw.slice(3) : raw
  return `https://t.me/c/${channelId}`
})

const openGroup = () => {
  if (!viewUrl.value || !import.meta.client) return
  window.open(viewUrl.value, '_blank', 'noopener,noreferrer')
}
</script>
