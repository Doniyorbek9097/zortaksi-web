<template>
  <header class="sticky top-0 z-30 -mx-4 px-4 py-2 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
    <div class="flex items-center gap-2.5">
      <div
        class="w-9 h-9 rounded-xl flex items-center justify-center text-sm text-white shrink-0 bg-gradient-to-br from-rose-500 to-pink-600 shadow-md shadow-rose-500/25"
      >
        <font-awesome-icon icon="fa-solid fa-bullhorn" />
      </div>
      <div class="leading-tight min-w-0 flex-1">
        <h1 class="text-[15px] font-black tracking-tight text-slate-900 dark:text-white">
          Bot guruhlari
        </h1>
        <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
          Hududlar · public / private juftlik
        </p>
      </div>
      <span
        v-if="count > 0"
        class="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300"
      >
        {{ count }}
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ count?: number }>()
</script>
