<template>
  <section
    class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
  >
    <button
      v-if="!active"
      type="button"
      class="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left border-b border-amber-200/50 dark:border-amber-800/40 bg-amber-50/80 dark:bg-amber-950/25 active:scale-[0.98] transition-all"
      @click="$emit('buy')"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <div
          class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white text-[11px] shrink-0 shadow-sm"
        >
          <font-awesome-icon icon="fa-solid fa-key" />
        </div>
        <p class="text-[12px] font-black text-amber-800 dark:text-amber-200 truncate">
          Tarif sotib olish
        </p>
      </div>
      <font-awesome-icon icon="fa-solid fa-chevron-right" class="text-amber-500 text-[10px] shrink-0" />
    </button>

    <div
      class="px-4 py-4 bg-gradient-to-br from-violet-50 via-indigo-50 to-sky-50 dark:from-violet-950/35 dark:via-indigo-950/25 dark:to-sky-950/20"
    >
      <div class="flex items-center justify-between gap-3 min-w-0">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm shadow-md shadow-violet-500/25 shrink-0"
          >
            <font-awesome-icon icon="fa-solid fa-wallet" />
          </div>
          <div class="min-w-0">
            <p class="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-tight">
              Balans
            </p>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Hisobingizdagi mablag'
            </p>
          </div>
        </div>

        <div class="text-right shrink-0">
          <div class="flex items-baseline justify-end gap-1">
            <span
              class="text-[22px] font-black tabular-nums text-violet-700 dark:text-violet-300 leading-none"
            >
              {{ formattedBalance }}
            </span>
            <span class="text-[11px] font-bold text-violet-600/70 dark:text-violet-400/70">
              so'm
            </span>
          </div>
          <button
            type="button"
            class="mt-1.5 inline-flex items-center gap-1 text-[10px] font-black text-violet-600 dark:text-violet-400 active:opacity-70 transition-opacity"
            @click="$emit('buy')"
          >
            To'ldirish
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="text-[8px]" />
          </button>
        </div>
      </div>
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
