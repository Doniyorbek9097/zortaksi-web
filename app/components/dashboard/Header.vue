<template>
  <header class="space-y-4">
    <!-- Brand + Bonus -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div
          class="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-lg shadow-indigo-500/30 bg-gradient-to-br from-indigo-500 to-violet-600 shrink-0"
        >
          <font-awesome-icon icon="fa-solid fa-car" />
        </div>
        <div class="leading-tight">
          <h1 class="text-lg md:text-xl font-black tracking-tight">
            <span class="text-indigo-500 dark:text-indigo-400">ZorTaksi</span><span class="text-red-500">.Uz</span>
          </h1>
          <p class="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
            Haydovchilar platformasi
          </p>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-500 hover:border-amber-400 dark:hover:border-amber-500/60 active:scale-95 transition-all shadow-sm"
        @click="$emit('bonus')"
      >
        <font-awesome-icon icon="fa-solid fa-gift" />
        Bonus
      </button>
    </div>

    <!-- Greeting -->
    <div class="space-y-0.5">
      <h2 class="text-base md:text-lg font-black text-slate-900 dark:text-white">
        {{ greeting }}, {{ name }}!
      </h2>
      <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500">
        {{ date }}
      </p>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  name: string
  greeting: string
  date: string
}

defineProps<Props>()
defineEmits<{ bonus: [] }>()
</script>
