<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="m in POST_INTERVAL_PRESET_MINUTES"
      :key="m"
      type="button"
      class="px-3 py-2 rounded-xl text-[12px] font-black border transition-all active:scale-[0.98]"
      :class="model === m
        ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/25'
        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700'"
      @click="model = m"
    >
      {{ m }} daq
    </button>
  </div>
</template>

<script setup lang="ts">
import { POST_INTERVAL_PRESET_MINUTES } from '~/stores/post.store'

const model = defineModel<number>({ required: true })
</script>
