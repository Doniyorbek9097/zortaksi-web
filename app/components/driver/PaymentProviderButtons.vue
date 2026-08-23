<template>
  <div class="space-y-2">
    <!-- Click -->
    <button
      v-if="clickEnabled"
      type="button"
      :disabled="disabled || loading === 'click'"
      class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-white bg-[#00ADEF] hover:bg-[#0096d1] active:scale-[0.98] transition-all disabled:opacity-50"
      @click="$emit('pay-click')"
    >
      <img :src="clickLogo" alt="Click" class="w-8 h-8 rounded-md shrink-0 object-cover bg-white" loading="lazy">
      <span class="flex-1 min-w-0 font-black text-[13px] leading-tight">Click · {{ amountLabel }}</span>
      <font-awesome-icon
        :icon="loading === 'click' ? 'fa-solid fa-spinner' : 'fa-solid fa-chevron-right'"
        class="text-xs shrink-0"
        :class="{ 'animate-spin': loading === 'click' }"
      />
    </button>

    <!-- Payme -->
    <button
      v-if="paymeEnabled"
      type="button"
      :disabled="disabled || loading === 'payme'"
      class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 active:scale-[0.98] transition-all disabled:opacity-50"
      @click="$emit('pay-payme')"
    >
      <img :src="paymeLogo" alt="Payme" class="w-8 h-8 rounded-md shrink-0 object-cover" loading="lazy">
      <span class="flex-1 min-w-0 font-black text-[13px] text-slate-900 dark:text-white leading-tight">Payme · {{ amountLabel }}</span>
      <font-awesome-icon
        :icon="loading === 'payme' ? 'fa-solid fa-spinner' : 'fa-solid fa-chevron-right'"
        class="text-xs text-slate-400 shrink-0"
        :class="{ 'animate-spin': loading === 'payme' }"
      />
    </button>

    <!-- Admin -->
    <button
      v-if="showAdmin"
      type="button"
      :disabled="disabled || adminLoading"
      class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-white bg-violet-600 hover:bg-violet-700 active:scale-[0.98] transition-all disabled:opacity-50"
      @click="$emit('pay-admin')"
    >
      <span class="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center shrink-0">
        <font-awesome-icon
          :icon="adminLoading ? 'fa-solid fa-spinner' : 'fa-solid fa-headset'"
          class="text-sm"
          :class="{ 'animate-spin': adminLoading }"
        />
      </span>
      <span class="flex-1 min-w-0 font-black text-[13px] leading-tight">Admin · {{ amountLabel }}</span>
      <font-awesome-icon icon="fa-solid fa-chevron-right" class="text-xs shrink-0 opacity-90" />
    </button>

    <p v-if="showOnline && onlineHint" class="text-[10px] font-medium text-slate-400 dark:text-slate-500 px-1">
      {{ onlineHint }}
    </p>
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
    adminLabel: "Adminga so'rov",
    onlineHint: "Online to'lovdan keyin darhol faol bo'ladi.",
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
