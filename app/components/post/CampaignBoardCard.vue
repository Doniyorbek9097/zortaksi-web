<template>
  <section
    class="rounded-2xl border shadow-sm overflow-hidden transition-colors"
    :class="campaign.active
      ? 'border-emerald-200/90 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/25'
      : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900'"
  >
    <div
      class="px-4 py-3 border-b"
      :class="campaign.active
        ? 'border-emerald-100/80 dark:border-emerald-900/40 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-teal-950/20'
        : 'border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950'"
    >
      <div class="flex items-center justify-between gap-3 min-w-0">
        <div class="flex items-center gap-2.5 min-w-0">
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm shadow-sm shrink-0"
            :class="campaign.active
              ? 'bg-gradient-to-br from-emerald-500 to-green-600'
              : 'bg-gradient-to-br from-slate-400 to-slate-500'"
          >
            <font-awesome-icon icon="fa-solid fa-bullhorn" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 min-w-0">
              <p
                class="text-[14px] font-black leading-tight truncate"
                :class="campaign.active
                  ? 'text-emerald-900 dark:text-emerald-100'
                  : 'text-slate-800 dark:text-slate-100'"
              >
                {{ campaign.name }}
              </p>
              <span
                v-if="campaign.active"
                class="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide bg-emerald-500 text-white"
              >
                <span class="w-1 h-1 rounded-full bg-white animate-pulse" />
                Faol
              </span>
            </div>
            <p
              class="text-[10px] font-bold mt-0.5 truncate"
              :class="campaign.active
                ? 'text-emerald-600/80 dark:text-emerald-400/80'
                : 'text-slate-500 dark:text-slate-400'"
            >
              {{ campaign.groupIds.length }} guruh · {{ campaign.intervalMin }} daqiqa
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4">
      <PostCampaignCard
        :campaign="campaign"
        :busy="busy"
        flat
        hide-header
        :edit-to="campaignEditPath(campaign.id)"
        @start="$emit('start')"
        @stop="$emit('stop')"
        @delete="$emit('delete')"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import PostCampaignCard from '~/components/post/CampaignCard.vue'
import type { PostCampaign } from '~/stores/post.store'
import { campaignEditPath } from '~/utils/postCampaign'

defineProps<{
  campaign: PostCampaign
  busy?: boolean
}>()

defineEmits<{
  start: []
  stop: []
  delete: []
}>()
</script>
