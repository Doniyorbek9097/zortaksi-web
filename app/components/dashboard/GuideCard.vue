<template>
  <div
    class="relative rounded-2xl p-4 md:p-5 border border-sky-400/30 dark:border-sky-500/20 bg-sky-50 dark:bg-sky-500/5"
  >
    <button
      type="button"
      class="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      aria-label="Yopish"
      @click="$emit('close')"
    >
      <font-awesome-icon icon="fa-solid fa-times" />
    </button>

    <div class="flex items-center gap-2 mb-3">
      <span class="text-sky-500 dark:text-sky-400">
        <font-awesome-icon icon="fa-solid fa-lightbulb" />
      </span>
      <h3 class="text-sm font-black text-slate-900 dark:text-white">
        Ilovadan qanday foydalanish
      </h3>
    </div>

    <ul class="space-y-2">
      <li v-for="item in items" :key="item.title" class="text-[11px] leading-relaxed">
        <span class="font-black text-sky-600 dark:text-sky-400">{{ item.title }}</span>
        <span class="text-slate-500 dark:text-slate-400"> — {{ item.desc }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
interface GuideItem {
  title: string
  desc: string
}

interface Props {
  items: GuideItem[]
}

defineProps<Props>()
defineEmits<{ close: [] }>()
</script>
