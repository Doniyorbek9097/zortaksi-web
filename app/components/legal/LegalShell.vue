<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
    <header
      class="sticky top-0 z-20 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg pt-[env(safe-area-inset-top)]"
    >
      <div class="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
        <NuxtLink
          to="/"
          class="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition"
          aria-label="Orqaga"
        >
          <font-awesome-icon icon="fa-solid fa-chevron-left" />
        </NuxtLink>
        <div class="min-w-0">
          <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            Zo'r Taksi
          </p>
          <h1 class="text-base font-black truncate">{{ title }}</h1>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-2xl px-4 py-6 pb-16 space-y-5">
      <p v-if="updated" class="text-[12px] font-medium text-slate-400 dark:text-slate-500">
        Yangilangan: {{ updated }}
      </p>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  updated?: string
}>()
</script>
