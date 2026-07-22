<template>
  <header class="flex items-center gap-2 sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
    <div
      class="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-white shrink-0 bg-gradient-to-br from-sky-500 to-blue-600 shadow-md shadow-sky-500/20"
    >
      <font-awesome-icon icon="fa-solid fa-key" />
    </div>
    <div class="leading-none min-w-0">
      <h1 class="text-[13px] font-black tracking-tight text-slate-900 dark:text-white">
        Tariflar boshqaruvi
      </h1>
      <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 truncate">
        {{ greeting }} — {{ dateLabel }}
      </p>
    </div>
  </header>
</template>

<script setup lang="ts">
const greeting = 'Xayrli kun, Zor Taksi Admin!'

const dateLabel = computed(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const weekday = now.toLocaleDateString('en-US', { weekday: 'short' })
  return `${y} M${m} ${d}, ${weekday}`
})
</script>
