<template>
  <header
    class="flex items-center justify-between gap-3 sticky top-0 z-30 -mx-4 px-4 py-2 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50"
  >
    <div class="flex items-center gap-2.5 min-w-0">
      <div
        class="w-9 h-9 rounded-xl flex items-center justify-center text-sm text-white shrink-0 bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-md shadow-violet-500/25"
      >
        <font-awesome-icon icon="fa-solid fa-image" />
      </div>
      <div class="min-w-0">
        <h1 class="text-[13px] font-black tracking-tight text-slate-900 dark:text-white">
          Reklama bannerlari
        </h1>
        <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 truncate">
          Haydovchi dashboard — slayd ko'rinishi
        </p>
      </div>
    </div>
    <div
      v-if="total != null"
      class="shrink-0 px-2.5 py-1 rounded-lg bg-violet-100 dark:bg-violet-950/50 border border-violet-200/70 dark:border-violet-800/50"
    >
      <p class="text-[14px] font-black tabular-nums text-violet-700 dark:text-violet-300 leading-none text-center">
        {{ total }}
      </p>
      <p class="text-[8px] font-black uppercase tracking-wide text-violet-500/80 text-center mt-0.5">
        Jami
      </p>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ total?: number | null }>()
</script>
