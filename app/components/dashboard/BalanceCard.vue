<template>
  <div
    class="relative overflow-hidden rounded-2xl p-5 border border-indigo-400/30 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-100 via-violet-100 to-indigo-50 dark:from-indigo-500/15 dark:via-violet-500/10 dark:to-slate-900"
  >
    <div class="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />

    <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
      Sizning balansingiz
    </p>
    <div class="mt-1 flex items-baseline gap-1.5">
      <span class="text-3xl font-black text-slate-900 dark:text-white">{{ formattedBalance }}</span>
      <span class="text-sm font-bold text-slate-500 dark:text-slate-400">so'm</span>
    </div>

    <button
      type="button"
      class="mt-4 w-full flex items-center justify-between gap-3 rounded-xl p-3 text-left bg-white/70 dark:bg-slate-900/60 border border-amber-400/40 dark:border-amber-500/20 hover:border-amber-400 dark:hover:border-amber-500/50 active:scale-[0.98] transition-all"
      @click="$emit('buy')"
    >
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center text-amber-500 bg-amber-500/15 shrink-0">
          <font-awesome-icon icon="fa-solid fa-key" />
        </div>
        <div>
          <p class="text-sm font-black text-slate-900 dark:text-white">Tarif sotib olish</p>
          <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500">Buyurtmalarga ulanish uchun</p>
        </div>
      </div>
      <span class="w-8 h-8 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-amber-500 to-orange-500 shrink-0">
        <font-awesome-icon icon="fa-solid fa-chevron-right" class="text-xs" />
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  balance?: number
}

const props = withDefaults(defineProps<Props>(), {
  balance: 0,
})

defineEmits<{ buy: [] }>()

const formattedBalance = computed(() => props.balance.toLocaleString('ru-RU'))
</script>
