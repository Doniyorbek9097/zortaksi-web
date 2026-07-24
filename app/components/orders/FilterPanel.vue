<template>
  <div class="space-y-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm">
    <div class="flex items-center gap-2 px-0.5">
      <span class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 inline-flex items-center justify-center shrink-0">
        <font-awesome-icon icon="fa-solid fa-location-dot" />
      </span>
      <div class="min-w-0 leading-none">
        <p class="text-sm font-black text-slate-900 dark:text-white">Hudud belgilash</p>
        <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
          Qaysi shahar/tuman buyurtmalarini ko‘rmoqchisiz?
        </p>
      </div>
    </div>

    <textarea
      v-model="keywords"
      rows="3"
      placeholder="Masalan: Namangan, Chortoq, Andijon&#10;Bir nechta hududni vergul bilan yozing"
      class="w-full min-h-[96px] px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-sm leading-relaxed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/5 transition-all resize-y whitespace-pre-wrap break-words"
    />

    <p class="px-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-snug">
      Hudud nomlarini vergul bilan ajrating. Buyurtma guruh nomi, username va matndan qidiriladi.
    </p>

    <div class="flex items-center gap-2">
      <button
        type="button"
        class="flex-1 py-3 rounded-xl text-sm font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
        @click="emit('cancel')"
      >
        Bekor qilish
      </button>
      <button
        type="button"
        class="flex-1 py-3 rounded-xl text-sm font-black text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
        @click="onSave"
      >
        <font-awesome-icon icon="fa-solid fa-floppy-disk" />
        Saqlash
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const keywords = defineModel<string>({ default: '' })

const emit = defineEmits<{ save: [value: string]; cancel: [] }>()

const onSave = () => {
  emit('save', keywords.value)
}
</script>
