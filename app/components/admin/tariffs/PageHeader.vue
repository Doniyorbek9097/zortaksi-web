<template>
  <header class="flex items-start gap-3">
    <div
      class="w-11 h-11 rounded-2xl flex items-center justify-center text-lg text-white shrink-0 bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25"
    >
      <font-awesome-icon icon="fa-solid fa-key" />
    </div>
    <div class="leading-tight min-w-0">
      <h1 class="text-lg font-black tracking-tight text-slate-900 dark:text-white">
        Tariflar boshqaruvi
      </h1>
      <p class="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
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
