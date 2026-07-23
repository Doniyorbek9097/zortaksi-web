<template>
  <div class="space-y-2.5 w-full min-w-0 max-w-full overflow-hidden">
    <div class="min-w-0 overflow-hidden">
      <p class="text-[11px] font-black uppercase tracking-wider opacity-80 mb-1">
        To'lov so'rovi
      </p>
      <p class="text-[14px] font-bold leading-snug break-words">
        Tarif sotib olmoqchiman
      </p>
    </div>

    <div
      class="rounded-xl px-3 py-2.5 space-y-1.5 overflow-hidden"
      :class="out
        ? 'bg-white/15'
        : 'bg-sky-50 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-800/50'"
    >
      <p v-if="name" class="text-[13px] font-bold truncate">
        <span class="opacity-70 font-semibold">Ism:</span> {{ name }}
      </p>
      <p v-if="phone" class="text-[13px] font-bold truncate">
        <span class="opacity-70 font-semibold">Tel:</span> {{ phone }}
      </p>
      <p v-if="tariff" class="text-[13px] font-bold truncate">
        <span class="opacity-70 font-semibold">Tarif:</span> {{ tariff }}
      </p>
      <p v-if="amount" class="text-[15px] font-black">
        <span class="opacity-70 text-[13px] font-semibold">Summa:</span> {{ amount }} so'm
      </p>
    </div>

    <p class="text-[12px] leading-relaxed opacity-80 break-words">
      To'lovdan keyin chek/skrinshot yuboriladi.
    </p>

    <a
      v-if="payUrl"
      :href="payUrl"
      class="inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-black active:scale-[0.99] transition-all overflow-hidden"
      :class="out
        ? 'bg-white text-sky-600'
        : 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'"
    >
      <font-awesome-icon icon="fa-solid fa-link" class="shrink-0" />
      <span class="truncate">To'lovni ochish</span>
    </a>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name?: string
  phone?: string
  tariff?: string
  amount?: string
  payUrl?: string
  out?: boolean
}

withDefaults(defineProps<Props>(), {
  name: '',
  phone: '',
  tariff: '',
  amount: '',
  payUrl: '',
  out: false,
})
</script>
