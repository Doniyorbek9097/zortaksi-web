<template>
  <section class="relative overflow-hidden rounded-2xl border border-amber-200/70 dark:border-amber-900/40 bg-gradient-to-br from-amber-50 via-orange-50/70 to-sky-50 dark:from-amber-950/35 dark:via-slate-900 dark:to-sky-950/30 shadow-sm">
    <!-- soft pattern -->
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
      style="background-image: radial-gradient(circle at 20% 20%, rgba(245,158,11,.25), transparent 40%), radial-gradient(circle at 90% 10%, rgba(14,165,233,.2), transparent 35%);"
    />

    <div class="relative p-4 space-y-4">
      <div class="flex items-start gap-3">
        <div
          class="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 animate-[ref-pop_0.5s_ease]"
        >
          <font-awesome-icon icon="fa-solid fa-gift" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
            Referal bonus
          </p>
          <p class="mt-0.5 text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-snug">
            Do'stingizni taklif qiling — u ro'yxatdan o'tsa sizga bonus tushadi
          </p>
        </div>
      </div>

      <div class="flex items-end justify-between gap-3">
        <div>
          <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Har bir taklif uchun</p>
          <p class="mt-0.5 text-3xl font-black tracking-tight text-amber-600 dark:text-amber-400 leading-none">
            +{{ formattedPerInvite }}
            <span class="text-base font-bold text-amber-600/80 dark:text-amber-400/80">so'm</span>
          </p>
        </div>
        <div
          class="px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-amber-100 dark:border-amber-900/40 text-right"
        >
          <p class="text-[10px] font-bold text-slate-400">Jami bonus</p>
          <p class="text-sm font-black text-emerald-600 dark:text-emerald-400">
            {{ formattedEarned }} so'm
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2.5">
        <div class="rounded-xl px-3 py-2.5 bg-white/85 dark:bg-slate-900/75 border border-white dark:border-slate-800">
          <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500">Takliflar</p>
          <p class="text-xl font-black text-sky-600 dark:text-sky-400">{{ invites }}</p>
        </div>
        <div class="rounded-xl px-3 py-2.5 bg-white/85 dark:bg-slate-900/75 border border-white dark:border-slate-800">
          <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500">Bir taklif</p>
          <p class="text-xl font-black text-amber-600 dark:text-amber-400">+{{ formattedPerInvite }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  reward: number
  invites: number
  perInvite: number
  earned?: number
}>()

const formattedPerInvite = computed(() => props.perInvite.toLocaleString('ru-RU'))
const formattedEarned = computed(() =>
  (props.earned ?? props.invites * props.perInvite).toLocaleString('ru-RU')
)
</script>

<style scoped>
@keyframes ref-pop {
  0% { transform: scale(0.85); opacity: 0.4; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
