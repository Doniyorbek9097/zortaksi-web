<template>
  <header class="flex items-center justify-between gap-3">
    <div>
      <h1 class="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Buyurtmalar</h1>
      <p class="flex items-center gap-1.5 text-[12px] font-bold text-slate-400 dark:text-slate-500">
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
          <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span class="text-emerald-500">LIVE</span>
        <span>· {{ count.toLocaleString('ru-RU') }} buyurtma</span>
      </p>
    </div>

    <button
      type="button"
      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-black tracking-wide transition-all active:scale-95"
      :class="active
        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-400/50 dark:border-indigo-500/50'
        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'"
      @click="$emit('toggle')"
    >
      <font-awesome-icon icon="fa-solid fa-filter" />
      Filtrlash
    </button>
  </header>
</template>

<script setup lang="ts">
interface Props {
  count?: number
  active?: boolean
}

withDefaults(defineProps<Props>(), {
  count: 0,
  active: false,
})

defineEmits<{ toggle: [] }>()
</script>
