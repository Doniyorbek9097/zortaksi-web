<template>
  <article
    class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between gap-3"
  >
    <div class="min-w-0 flex-1 space-y-1">
      <div class="flex items-center gap-2 flex-wrap">
        <h2 class="text-[15px] font-black text-slate-900 dark:text-white">
          {{ name }}
        </h2>
        <span
          v-if="slug"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 font-mono"
        >
          /{{ slug }}
        </span>
        <span
          class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200/80 dark:border-violet-800/60"
        >
          {{ expireDays }} kun
        </span>
      </div>

      <p v-if="info" class="text-[12px] font-medium text-slate-400 dark:text-slate-500">
        {{ info }}
      </p>

      <p class="text-base font-black text-sky-600 dark:text-sky-400 pt-0.5">
        {{ formattedPrice }}
      </p>
    </div>

    <div class="flex flex-col gap-2 shrink-0">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black border transition-all active:scale-95 bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/60 dark:hover:bg-amber-950/50"
        @click="$emit('edit')"
      >
        <font-awesome-icon icon="fa-solid fa-pen-to-square" class="text-[10px]" />
        Tahrir
      </button>
      <button
        type="button"
        class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black border transition-all active:scale-95 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/60 dark:hover:bg-red-950/50"
        @click="$emit('delete')"
      >
        <font-awesome-icon icon="fa-solid fa-trash" class="text-[10px]" />
        O'chir
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string
  slug?: string
  info?: string
  price: number
  expireDays: number
}>()

defineEmits<{ edit: []; delete: [] }>()

const formattedPrice = computed(() => {
  const n = props.price.toLocaleString('ru-RU')
  return `${n} so'm`
})
</script>
