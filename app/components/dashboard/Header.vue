<template>
  <header class="sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white shadow-md shadow-indigo-500/25 bg-gradient-to-br from-indigo-500 to-violet-600 shrink-0"
        >
          <font-awesome-icon icon="fa-solid fa-car" />
        </div>
        <div class="leading-none min-w-0">
          <h1 class="text-[13px] font-black tracking-tight truncate">
            <span class="text-indigo-500 dark:text-indigo-400">ZorTaksi</span><span class="text-red-500">.Uz</span>
          </h1>
          <p class="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-0.5 min-w-0">
            <font-awesome-icon
              :icon="isNight ? 'fa-solid fa-moon' : 'fa-solid fa-sun'"
              class="text-[10px] shrink-0"
              :class="isNight ? 'text-indigo-400' : 'text-amber-400'"
            />
            <span class="truncate min-w-0">{{ greeting }}, {{ name }}! · {{ date }}</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-500 active:scale-95 transition-all shadow-sm shrink-0"
        @click="$emit('bonus')"
      >
        <font-awesome-icon icon="fa-solid fa-gift" />
        Bonus
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  name: string
  greeting: string
  date: string
}

const props = defineProps<Props>()
defineEmits<{ bonus: [] }>()

const isNight = computed(() =>
  /tun|kech/i.test(props.greeting)
)
</script>
