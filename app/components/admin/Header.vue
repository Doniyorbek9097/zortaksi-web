<template>
  <header class="sticky top-0 z-30 -mx-4 px-4 py-2.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <div
          class="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 ring-2 ring-sky-500/20 shadow-lg shadow-sky-500/20 bg-gradient-to-br from-sky-400 to-sky-600"
        >
          <img
            src="/logo.jpg"
            alt="Zo'r Taksi"
            class="w-full h-full object-cover"
            @error="imgBroken = true"
          >
          <div
            v-if="imgBroken"
            class="absolute inset-0 flex items-center justify-center text-white text-lg"
          >
            <font-awesome-icon icon="fa-solid fa-car" />
          </div>
        </div>
        <h1 class="text-lg font-black tracking-tight truncate leading-none">
          <span class="text-sky-500">Zo'r</span>
          <span class="text-slate-900 dark:text-white"> Taksi</span>
        </h1>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-500 active:scale-95 transition-all shadow-sm shrink-0"
        @click="$emit('bonus')"
      >
        <font-awesome-icon icon="fa-solid fa-gift" />
        Bonus
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{ bonus: [] }>()
const imgBroken = ref(false)
</script>
