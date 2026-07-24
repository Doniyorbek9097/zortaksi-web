<template>
  <div class="space-y-2.5">
    <div class="relative">
      <span class="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500 pointer-events-none">
        <font-awesome-icon icon="fa-solid fa-search" class="text-sm" />
      </span>
      <textarea
        v-model="keywords"
        rows="3"
        placeholder="Kalit so'zlar: namangan, chortoq, andijon..."
        class="w-full min-h-[88px] pl-10 pr-3 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm leading-relaxed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/5 transition-all resize-y whitespace-pre-wrap break-words"
      />
    </div>

    <p class="px-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-snug">
      So'zlarni vergul bilan ajrating. Guruh nomi, username va xabar matnidan qidiriladi (lotin/krill bir xil).
    </p>

    <button
      type="button"
      class="w-full py-3 rounded-xl text-sm font-black text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
      @click="onSave"
    >
      <font-awesome-icon icon="fa-solid fa-floppy-disk" />
      Filterni saqlash
    </button>
  </div>
</template>

<script setup lang="ts">
const keywords = defineModel<string>({ default: '' })

const emit = defineEmits<{ save: [value: string] }>()

const onSave = () => {
  emit('save', keywords.value)
}
</script>
