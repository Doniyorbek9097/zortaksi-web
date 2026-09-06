<template>
  <section
    class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
  >
    <div
      class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-violet-50 via-indigo-50 to-sky-50 dark:from-violet-950/30 dark:via-indigo-950/20 dark:to-sky-950/20"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <div
          class="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm shadow-sm shrink-0"
        >
          <font-awesome-icon icon="fa-solid fa-wallet" />
        </div>
        <div class="min-w-0">
          <p class="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-tight">
            Balans
          </p>
          <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
            Hisobingizdagi mablag'
          </p>
        </div>
      </div>
    </div>

    <div class="p-3 space-y-2">
      <div
        class="rounded-xl p-3 border bg-violet-50 dark:bg-violet-950/35 border-violet-100 dark:border-violet-900/50"
      >
        <p class="text-[9px] font-black uppercase tracking-wide text-violet-600/90 dark:text-violet-400/90">
          Joriy balans
        </p>
        <div class="mt-1 flex items-baseline gap-1.5">
          <span class="text-[26px] font-black tabular-nums text-violet-800 dark:text-violet-200 leading-none">
            {{ formattedBalance }}
          </span>
          <span class="text-[12px] font-bold text-violet-600/70 dark:text-violet-400/70">so'm</span>
        </div>
      </div>

      <button
        v-if="!active"
        type="button"
        class="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left border border-amber-200/70 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 active:scale-[0.98] transition-all"
        @click="$emit('buy')"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <div
            class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white text-[11px] shrink-0 shadow-sm"
          >
            <font-awesome-icon icon="fa-solid fa-key" />
          </div>
          <div class="min-w-0">
            <p class="text-[12px] font-black text-amber-800 dark:text-amber-200">Tarif sotib olish</p>
            <p class="text-[10px] font-bold text-amber-600/80 dark:text-amber-400/80 truncate">
              Buyurtmalarga ulanish uchun
            </p>
          </div>
        </div>
        <font-awesome-icon icon="fa-solid fa-chevron-right" class="text-amber-500 text-xs shrink-0" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  balance?: number
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  balance: 0,
  active: false,
})

defineEmits<{ buy: [] }>()

const formattedBalance = computed(() => props.balance.toLocaleString('ru-RU'))
</script>
