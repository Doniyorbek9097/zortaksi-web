<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <header class="sticky top-0 z-30 -mx-4 px-4 py-2 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <h1 class="text-base font-black text-slate-900 dark:text-white">To'lov kartalari</h1>
      <p class="text-[11px] text-slate-400 mt-0.5">Haydovchilarga ko'rsatiladigan karta raqamlari</p>
    </header>

    <section class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
      <div>
        <label class="text-[11px] font-bold text-slate-400 uppercase">Karta egasi</label>
        <input
          v-model="owner"
          type="text"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm font-semibold"
          placeholder="Ism familiya"
        >
      </div>

      <div v-for="(card, idx) in cards" :key="idx" class="space-y-1">
        <label class="text-[11px] font-bold text-slate-400 uppercase">Karta {{ idx + 1 }}</label>
        <input
          v-model="card.number"
          type="text"
          inputmode="numeric"
          class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm font-mono"
          placeholder="8600 ..."
        >
      </div>

      <button
        type="button"
        class="text-[12px] font-bold text-sky-500"
        @click="cards.push({ number: '' })"
      >
        + Yana karta
      </button>

      <p v-if="error" class="text-[12px] font-bold text-red-500">{{ error }}</p>
      <p v-if="saved" class="text-[12px] font-bold text-emerald-500">Saqlandi</p>

      <button
        type="button"
        class="w-full rounded-xl bg-sky-500 text-white font-black py-3 active:scale-[0.98] disabled:opacity-50"
        :disabled="saving"
        @click="save"
      >
        {{ saving ? 'Saqlanmoqda...' : 'Saqlash' }}
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const owner = ref('')
const cards = ref<{ number: string }[]>([{ number: '' }, { number: '' }])
const saving = ref(false)
const error = ref('')
const saved = ref(false)

const load = async () => {
  try {
    const res = await useApi<{ success: boolean; data: any }>('/panel/me')
    if (!res?.success) return
    owner.value = String(res.data?.paymentCardOwner || '')
    const list = Array.isArray(res.data?.paymentCards) ? res.data.paymentCards : []
    cards.value = list.length
      ? list.map((c: any) => ({ number: String(c.number || '') }))
      : [{ number: '' }, { number: '' }]
  } catch { /* */ }
}

const save = async () => {
  saving.value = true
  error.value = ''
  saved.value = false
  try {
    const res = await useApi<{ success: boolean; message?: string }>('/panel/payment-cards', {
      method: 'PATCH',
      body: {
        paymentCardOwner: owner.value.trim(),
        paymentCards: cards.value
          .map((c) => ({ number: c.number.replace(/\D/g, '') }))
          .filter((c) => c.number),
      },
    })
    if (!res?.success) throw new Error(res?.message || 'Xato')
    saved.value = true
  } catch (e: any) {
    error.value = e?.message || 'Saqlab bo\'lmadi'
  } finally {
    saving.value = false
  }
}

onMounted(() => { void load() })
</script>
