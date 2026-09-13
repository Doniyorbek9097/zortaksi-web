<template>
  <section
    class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
  >
    <div
      class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-rose-950/20"
    >
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5 min-w-0">
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm shadow-sm shrink-0"
          >
            <font-awesome-icon icon="fa-solid fa-bullhorn" />
          </div>
          <div class="min-w-0">
            <p class="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-tight">
              E'lon avto-yuborish
            </p>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              12 soatlik statistika
            </p>
          </div>
        </div>
        <NuxtLink
          to="/driver/post"
          class="text-[10px] font-black text-amber-600 dark:text-amber-400 shrink-0"
        >
          Boshqarish
        </NuxtLink>
      </div>
    </div>

    <div class="p-3">
      <div v-if="loading && !summary" class="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />

      <div v-else-if="!summary?.activeCampaign" class="text-center py-5 px-3">
        <p class="text-[12px] font-bold text-slate-500 dark:text-slate-400">
          Faol avto-yuborish yo'q
        </p>
        <NuxtLink
          to="/driver/post"
          class="inline-flex mt-2 text-[11px] font-black text-amber-600 dark:text-amber-400"
        >
          E'lon joylash →
        </NuxtLink>
      </div>

      <div v-else class="space-y-2.5">
        <div class="flex items-center justify-between gap-2">
          <p class="text-[12px] font-black text-slate-800 dark:text-slate-100 truncate">
            {{ summary.activeCampaign.name }}
          </p>
          <span class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">
            Faol
          </span>
        </div>

        <PostCampaignWindowStats :campaign="summary.activeCampaign" />

        <p class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 text-center">
          Saqlangan xabarlar: {{ summary.totalCampaigns }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PostCampaignSummary } from '~/stores/post.store'

defineProps<{
  summary: PostCampaignSummary | null
  loading?: boolean
}>()
</script>
