<template>
  <div class="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
          Obuna / Tarif
        </p>
        <h3 class="mt-0.5 text-lg font-black text-slate-900 dark:text-white">{{ name }}</h3>
        <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500">{{ info }}</p>
      </div>
      <div class="text-right shrink-0">
        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Narx</p>
        <p class="text-lg font-black text-violet-600 dark:text-violet-400">{{ formattedPrice }} so'm</p>
        <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500">{{ expireDays }} kun</p>
      </div>
    </div>

    <!-- Warning banner -->
    <div
      v-if="!active"
      class="mt-4 rounded-xl px-4 py-3 text-center text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-400/30 dark:border-amber-500/20"
    >
      Buyurtmalarni olish uchun tarif faollashtiring
    </div>

    <!-- Dates -->
    <div class="mt-4 grid grid-cols-2 gap-4">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Ulangan sana</p>
        <p class="text-sm font-black text-slate-900 dark:text-white">{{ startDate }}</p>
      </div>
      <div>
        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tugash sanasi</p>
        <p class="text-sm font-black text-slate-900 dark:text-white">{{ endDate }}</p>
      </div>
    </div>

    <!-- Action — faqat tarifi yo'q / faol emas haydovchiga -->
    <button
      v-if="!active"
      type="button"
      class="mt-4 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/15 active:scale-[0.98] transition-all"
      @click="$emit('buy')"
    >
      <font-awesome-icon icon="fa-solid fa-wallet" />
      Tarif sotib olish
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name?: string
  info?: string
  price?: number
  expireDays?: number
  startDate?: string
  endDate?: string
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  name: 'Kunlik sinov',
  info: '1 - martalik sinov tarifi',
  price: 5000,
  expireDays: 1,
  startDate: '—',
  endDate: '—',
  active: false,
})

defineEmits<{ buy: [] }>()

const formattedPrice = computed(() => props.price.toLocaleString('ru-RU'))
</script>
