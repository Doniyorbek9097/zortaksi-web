<template>
  <section
    class="rounded-2xl p-4 border border-violet-200/70 dark:border-violet-900/50 bg-gradient-to-br from-violet-50 via-fuchsia-50/80 to-pink-50 dark:from-violet-950/40 dark:via-fuchsia-950/20 dark:to-slate-900 shadow-sm space-y-4"
  >
    <div class="flex items-start gap-3">
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25"
      >
        <font-awesome-icon icon="fa-solid fa-gift" />
      </div>
      <div class="min-w-0 space-y-1">
        <p class="text-[10px] font-black uppercase tracking-[0.18em] text-violet-500 dark:text-violet-400">
          Referal dasturi
        </p>
        <p class="text-[13px] font-bold text-slate-700 dark:text-slate-200 leading-snug">
          Do'stingizni taklif qiling — ro'yxatdan o'tsa
        </p>
        <p class="pt-0.5">
          <span class="text-2xl font-black text-fuchsia-600 dark:text-fuchsia-400">
            {{ formattedReward }}
          </span>
          <span class="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            har bir yangi haydovchi uchun
          </span>
        </p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div
        class="rounded-xl px-3 py-2.5 bg-white/80 dark:bg-slate-900/70 border border-white dark:border-slate-800"
      >
        <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500">Takliflar</p>
        <p class="text-xl font-black text-violet-600 dark:text-violet-400">{{ invites }}</p>
      </div>
      <div
        class="rounded-xl px-3 py-2.5 bg-white/80 dark:bg-slate-900/70 border border-white dark:border-slate-800"
      >
        <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500">Har bir taklif</p>
        <p class="text-xl font-black text-emerald-500">+{{ formattedPerInvite }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  reward: number
  invites: number
  perInvite: number
}>()

const formattedReward = computed(() => `${props.reward.toLocaleString('ru-RU')} so'm`)
const formattedPerInvite = computed(() => props.perInvite.toLocaleString('ru-RU'))
</script>
