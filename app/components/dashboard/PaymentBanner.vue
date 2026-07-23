<template>
  <div
    class="relative overflow-hidden rounded-2xl p-4 md:p-5 flex items-center justify-between gap-4 border border-amber-400/40 dark:border-amber-500/20 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-500/10 dark:to-orange-500/5"
  >
    <div class="flex items-center gap-3 min-w-0">
      <div
        class="w-11 h-11 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 bg-amber-500/15 shrink-0"
      >
        <font-awesome-icon icon="fa-solid fa-wallet" class="text-lg" />
      </div>
      <div class="min-w-0">
        <h3 class="text-sm font-black text-slate-900 dark:text-white truncate">
          {{ title }}
        </h3>
        <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
          {{ subtitle }}
        </p>
      </div>
    </div>

    <button
      type="button"
      class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30 active:scale-95 transition-all shrink-0"
      @click="$emit('action')"
    >
      {{ buttonText }}
      <font-awesome-icon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  buttonText?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Tarifga ulaning',
  subtitle: "Hisobni to'ldiring, keyin tarifni o'zingiz ulang",
  buttonText: 'Ochish',
})

defineEmits<{ action: [] }>()
</script>
