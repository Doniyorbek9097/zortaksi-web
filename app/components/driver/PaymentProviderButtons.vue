<template>
  <div class="space-y-2.5">
  <!-- Online: Click / Payme -->
    <div
      v-if="showOnline"
      class="rounded-xl border border-sky-200/70 dark:border-sky-800/50 bg-sky-50/60 dark:bg-sky-950/20 p-2.5 space-y-2"
    >
      <p class="text-[10px] font-bold text-sky-700 dark:text-sky-300 px-0.5">
        Online — to'lovdan keyin darhol faol
      </p>

      <button
        v-if="clickEnabled"
        type="button"
        :disabled="disabled || loading === 'click'"
        class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-white bg-[#00ADEF] hover:bg-[#0096d1] shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
        @click="$emit('pay-click')"
      >
        <span class="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden">
          <img :src="clickLogo" alt="Click" class="w-full h-full object-cover" loading="lazy">
        </span>
        <span class="flex-1 min-w-0">
          <span class="block text-[13px] font-black leading-tight">Click orqali to'lash</span>
          <span class="block text-[11px] font-semibold text-white/85 tabular-nums">{{ amountLabel }}</span>
        </span>
        <font-awesome-icon
          :icon="loading === 'click' ? 'fa-solid fa-spinner' : 'fa-solid fa-chevron-right'"
          class="text-sm shrink-0"
          :class="{ 'animate-spin': loading === 'click' }"
        />
      </button>

      <button
        v-if="paymeEnabled"
        type="button"
        :disabled="disabled || loading === 'payme'"
        class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
        @click="$emit('pay-payme')"
      >
        <span class="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700">
          <img :src="paymeLogo" alt="Payme" class="w-full h-full object-cover" loading="lazy">
        </span>
        <span class="flex-1 min-w-0">
          <span class="block text-[13px] font-black text-slate-900 dark:text-white leading-tight">Payme orqali to'lash</span>
          <span class="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">{{ amountLabel }}</span>
        </span>
        <font-awesome-icon
          :icon="loading === 'payme' ? 'fa-solid fa-spinner' : 'fa-solid fa-chevron-right'"
          class="text-sm text-slate-400 shrink-0"
          :class="{ 'animate-spin': loading === 'payme' }"
        />
      </button>
    </div>

    <!-- Admin orqali to'lov -->
    <button
      v-if="showAdmin"
      type="button"
      :disabled="disabled || adminLoading"
      class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-white bg-violet-600 hover:bg-violet-700 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
      @click="$emit('pay-admin')"
    >
      <span class="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
        <font-awesome-icon
          :icon="adminLoading ? 'fa-solid fa-spinner' : 'fa-solid fa-headset'"
          :class="{ 'animate-spin': adminLoading }"
        />
      </span>
      <span class="flex-1 min-w-0">
        <span class="block text-[13px] font-black leading-tight">{{ adminLabel }}</span>
        <span class="block text-[11px] font-semibold text-white/85">
          {{ amountLabel }} · Telegramda tayyor xabar
        </span>
      </span>
      <font-awesome-icon icon="fa-solid fa-chevron-right" class="text-sm shrink-0 opacity-90" />
    </button>
  </div>
</template>

<script setup lang="ts">
import clickLogo from '~/assets/click-logo.png'
import paymeLogo from '~/assets/payme-logo.jpg'

const props = withDefaults(
  defineProps<{
    amount: number
    clickEnabled?: boolean
    paymeEnabled?: boolean
    showAdmin?: boolean
    adminLabel?: string
    onlineHint?: string
    loading?: 'click' | 'payme' | null
    adminLoading?: boolean
    disabled?: boolean
  }>(),
  {
    clickEnabled: false,
    paymeEnabled: false,
    showAdmin: true,
    adminLabel: "Adminga so'rov yuborish",
    onlineHint: '',
    loading: null,
    adminLoading: false,
    disabled: false,
  },
)

defineEmits<{
  'pay-click': []
  'pay-payme': []
  'pay-admin': []
}>()

const showOnline = computed(() => !!(props.clickEnabled || props.paymeEnabled))
const amountLabel = computed(() => `${(props.amount ?? 0).toLocaleString('ru-RU')} so'm`)
</script>
