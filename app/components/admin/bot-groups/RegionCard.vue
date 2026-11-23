<template>
  <article
    class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
  >
    <div
      class="px-4 py-3 border-b border-slate-100 dark:border-slate-800"
      :class="card.active
        ? 'bg-gradient-to-r from-rose-500/8 to-transparent dark:from-rose-500/12'
        : 'bg-slate-50/80 dark:bg-slate-950/40'"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <h2 class="text-[15px] font-black text-slate-900 dark:text-white truncate">
            {{ card.title }}
          </h2>
          <p class="mt-0.5 text-[11px] font-mono font-bold text-slate-400 truncate">
            {{ card.slug }}
          </p>
        </div>
        <span
          class="shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full"
          :class="card.active
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'"
        >
          {{ card.active ? 'Faol' : "O'chiq" }}
        </span>
      </div>
    </div>

    <div class="p-4 space-y-3">
      <div class="flex items-start gap-2 text-[12px]">
        <span class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500">
          <font-awesome-icon icon="fa-solid fa-headset" class="text-[11px]" />
        </span>
        <div class="min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Tinglovchi</p>
          <p class="font-semibold text-slate-700 dark:text-slate-200 truncate">{{ listenerLabel }}</p>
        </div>
      </div>

      <div
        v-if="botUsername"
        class="flex items-start gap-2 text-[12px]"
      >
        <span class="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 text-violet-500">
          <font-awesome-icon icon="fa-solid fa-robot" class="text-[11px]" />
        </span>
        <div class="min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Bot</p>
          <p class="font-bold text-violet-600 dark:text-violet-400 truncate">
            @{{ botUsername }}
            <span v-if="tokenMasked" class="text-slate-400 font-mono font-normal text-[10px] ml-1">{{ tokenMasked }}</span>
          </p>
        </div>
      </div>

      <div
        v-if="tariffLabels"
        class="flex items-start gap-2 text-[12px]"
      >
        <span class="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-600">
          <font-awesome-icon icon="fa-solid fa-tags" class="text-[11px]" />
        </span>
        <div class="min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Tariflar</p>
          <p class="font-semibold text-slate-700 dark:text-slate-200 leading-snug">{{ tariffLabels }}</p>
        </div>
      </div>

      <div class="flex items-start gap-2 text-[12px]">
        <span class="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0 text-sky-600">
          <font-awesome-icon icon="fa-solid fa-bullhorn" class="text-[11px]" />
        </span>
        <div class="min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Public buyurtma</p>
          <p class="font-semibold text-slate-700 dark:text-slate-200">
            {{ card.postOrdersToPublic !== false ? 'Yuboriladi' : 'Yuborilmaydi' }}
          </p>
        </div>
      </div>

      <div class="flex items-start gap-2 text-[12px]">
        <span class="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-600">
          <font-awesome-icon icon="fa-solid fa-user-plus" class="text-[11px]" />
        </span>
        <div class="min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Taklif bonusi</p>
          <p class="font-semibold text-slate-700 dark:text-slate-200">
            {{ inviteRewardLabel }}
          </p>
        </div>
      </div>

      <div class="space-y-2">
        <AdminBotGroupsGroupSidePanel
          v-if="card.public"
          :side="card.public"
          :refreshing="refreshingId === card.public.id"
          @refresh="$emit('refresh', card.public)"
        />
        <AdminBotGroupsGroupSidePanel
          v-if="card.private"
          :side="card.private"
          :refreshing="refreshingId === card.private.id"
          @refresh="$emit('refresh', card.private)"
        />
      </div>

      <div class="flex gap-2 pt-1">
        <button
          type="button"
          class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-black border transition-all active:scale-95 bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/60"
          @click="$emit('edit')"
        >
          <font-awesome-icon icon="fa-solid fa-pen-to-square" class="text-[10px]" />
          Tahrir
        </button>
        <button
          type="button"
          class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-black border transition-all active:scale-95 bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/60"
          @click="$emit('delete')"
        >
          <font-awesome-icon icon="fa-solid fa-trash" class="text-[10px]" />
          O'chir
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { BotGroupRow, BotRegionCard } from '~/stores/bot-group.store'

const props = defineProps<{
  card: BotRegionCard
  listenerLabel: string
  tariffLabels?: string
  refreshingId?: string | null
}>()

defineEmits<{
  edit: []
  delete: []
  refresh: [side: BotGroupRow]
}>()

const botUsername = computed(
  () => props.card.public?.botUsername || props.card.private?.botUsername || '',
)
const tokenMasked = computed(
  () => props.card.public?.tokenMasked || props.card.private?.tokenMasked || '',
)
const inviteRewardLabel = computed(() => {
  const n = Number(props.card.groupInviteRewardAmount ?? 500)
  if (!Number.isFinite(n) || n <= 0) return '0 — minnatdorlik xabari'
  return `${Math.round(n).toLocaleString('ru-RU')} so'm`
})
</script>
