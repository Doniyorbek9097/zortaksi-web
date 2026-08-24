<template>
  <div
    class="rounded-xl border p-3 space-y-2"
    :class="isPrivate
      ? 'border-violet-200/80 dark:border-violet-900/40 bg-violet-50/40 dark:bg-violet-950/20'
      : 'border-sky-200/80 dark:border-sky-900/40 bg-sky-50/40 dark:bg-sky-950/20'"
  >
    <div class="flex items-center justify-between gap-2">
      <span
        class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide"
        :class="isPrivate ? 'text-violet-600 dark:text-violet-400' : 'text-sky-600 dark:text-sky-400'"
      >
        <font-awesome-icon :icon="isPrivate ? 'fa-solid fa-lock' : 'fa-solid fa-users'" class="text-[9px]" />
        {{ isPrivate ? 'Private' : 'Public' }}
      </span>
      <span
        class="text-[10px] font-black px-2 py-0.5 rounded-full"
        :class="side.botIsAdmin
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'"
      >
        {{ side.botIsAdmin ? 'Bot admin' : 'Admin emas' }}
      </span>
    </div>

    <p class="text-[12px] font-bold text-slate-800 dark:text-slate-100 break-all leading-snug">
      <template v-if="isPrivate">
        {{ side.inviteLink || "Invite link yo'q" }}
      </template>
      <template v-else>@{{ side.username }}</template>
    </p>

    <p v-if="side.botUsername" class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
      Bot: @{{ side.botUsername }}
    </p>

    <button
      type="button"
      class="inline-flex items-center gap-1.5 text-[11px] font-black text-violet-600 dark:text-violet-400 active:scale-95 transition-transform"
      :disabled="refreshing"
      @click="$emit('refresh')"
    >
      <font-awesome-icon
        :icon="refreshing ? 'fa-solid fa-spinner' : 'fa-solid fa-rotate-right'"
        :class="{ 'animate-spin': refreshing }"
        class="text-[10px]"
      />
      Tekshirish
    </button>
  </div>
</template>

<script setup lang="ts">
import type { BotGroupRow } from '~/stores/bot-group.store'

const props = defineProps<{
  side: BotGroupRow
  refreshing?: boolean
}>()

defineEmits<{ refresh: [] }>()

const isPrivate = computed(() => props.side.kind === 'private')
</script>
