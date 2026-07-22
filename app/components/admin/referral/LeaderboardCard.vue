<template>
  <section
    class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
  >
    <div class="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
      <div>
        <h3 class="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          Top 10 referal
        </h3>
        <p class="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-1">
          Eng ko'p taklif qilgan haydovchilar
        </p>
      </div>
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-100 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/50"
      >
        <font-awesome-icon icon="fa-solid fa-trophy" />
      </div>
    </div>

    <div class="px-4 pb-2">
      <AdminReferralItem
        v-for="item in items"
        :key="item.rank"
        :rank="item.rank"
        :name="item.name"
        :username="item.username"
        :invites="item.invites"
        :bonus="item.bonus"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
interface LeaderboardRow {
  rank: number
  name: string
  username: string
  invites: number
  bonus: number
}

defineProps<{ items: LeaderboardRow[] }>()
</script>
