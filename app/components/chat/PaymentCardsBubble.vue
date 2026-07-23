<template>
  <div class="space-y-2.5 min-w-[220px]">
    <div>
      <p class="text-[11px] font-black uppercase tracking-wider opacity-80 mb-1">
        To'lov ma'lumoti
      </p>
      <p class="text-[14px] font-bold leading-snug">
        Assalomu alaykum{{ name ? `, ${name}` : '' }}!
      </p>
      <p class="text-[13px] leading-relaxed mt-1 opacity-90">
        So'rovingiz qabul qilindi. Pulni quyidagi kartadan biriga o'tkazing.
      </p>
    </div>

    <button
      v-for="card in cards"
      :key="card"
      type="button"
      class="w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 active:scale-[0.99] transition-all"
      :class="out
        ? 'bg-white/15 hover:bg-white/20'
        : 'bg-teal-50 dark:bg-teal-950/50 border border-teal-200/70 dark:border-teal-800/50'"
      @click="copyCard(card)"
    >
      <span class="flex items-center gap-2 min-w-0">
        <font-awesome-icon icon="fa-solid fa-credit-card" class="shrink-0 opacity-80" />
        <span class="text-[15px] font-black tabular-nums tracking-wide truncate">
          {{ formatCard(card) }}
        </span>
      </span>
      <span
        class="text-[11px] font-black shrink-0"
        :class="out ? 'text-white/90' : 'text-teal-600 dark:text-teal-400'"
      >
        {{ copied === card ? 'Nusxa!' : 'Nusxa' }}
      </span>
    </button>

    <p v-if="owner" class="text-[12px] font-bold opacity-90">
      Karta egasi: {{ owner }}
    </p>

    <p class="text-[12px] leading-relaxed opacity-80">
      To'lovdan keyin chek yoki skrinshotni shu yerga yuboring. Tarif 5–10 daqiqada yoqiladi.
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name?: string
  owner?: string
  cards: string[]
  out?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  name: '',
  owner: '',
  out: false,
})

const copied = ref('')

const formatCard = (digits: string) =>
  String(digits || '').replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim()

const copyCard = async (card: string) => {
  try {
    await navigator.clipboard.writeText(card.replace(/\D/g, ''))
    copied.value = card
    setTimeout(() => {
      if (copied.value === card) copied.value = ''
    }, 2000)
  } catch {
    /* ignore */
  }
}
</script>
