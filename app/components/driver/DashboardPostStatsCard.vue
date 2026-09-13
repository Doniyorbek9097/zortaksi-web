<template>
  <section
    v-if="campaigns.length"
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
              Saqlangan xabarlar
            </p>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              12 soat avto-yuborish statistikasi
            </p>
          </div>
        </div>
        <NuxtLink
          to="/driver/post"
          class="text-[10px] font-black text-amber-600 dark:text-amber-400 shrink-0"
        >
          E'lon joylash
        </NuxtLink>
      </div>
    </div>

    <div class="p-3 space-y-2">
      <div v-if="loading && !campaigns.length" class="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />

      <PostCampaignCard
        v-for="c in campaigns"
        :key="c.id"
        :campaign="c"
        :busy="busyId === c.id"
        @start="$emit('start', c)"
        @stop="$emit('stop', c)"
        @edit="$emit('edit', c)"
        @delete="$emit('delete', c)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PostCampaign } from '~/stores/post.store'

defineProps<{
  campaigns: PostCampaign[]
  busyId?: string | null
  loading?: boolean
}>()

defineEmits<{
  start: [campaign: PostCampaign]
  stop: [campaign: PostCampaign]
  edit: [campaign: PostCampaign]
  delete: [campaign: PostCampaign]
}>()
</script>
