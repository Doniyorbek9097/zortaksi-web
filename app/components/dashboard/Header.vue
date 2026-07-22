<template>
  <header class="sticky top-0 z-30 -mx-4 px-4 py-2.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
    <div class="flex items-start justify-between gap-2.5">
      <div class="flex items-start gap-2.5 min-w-0">
        <div
          class="w-9 h-9 rounded-xl flex items-center justify-center text-base font-black text-white shadow-md shadow-indigo-500/25 bg-gradient-to-br from-indigo-500 to-violet-600 shrink-0"
        >
          <font-awesome-icon icon="fa-solid fa-car" />
        </div>
        <div class="leading-tight min-w-0">
          <h1 class="text-[15px] font-black tracking-tight truncate">
            <span class="text-indigo-500 dark:text-indigo-400">ZorTaksi</span><span class="text-red-500">.Uz</span>
          </h1>
          <p class="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 dark:text-slate-200 truncate mt-0.5">
            <font-awesome-icon
              :icon="isNight ? 'fa-solid fa-moon' : 'fa-solid fa-sun'"
              class="text-[11px] shrink-0"
              :class="isNight ? 'text-indigo-400' : 'text-amber-400'"
            />
            <span class="truncate">{{ greeting }}, {{ name }}!</span>
          </p>
          <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">
            {{ date }}
          </p>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-500 active:scale-95 transition-all shadow-sm shrink-0"
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
