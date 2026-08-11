<template>
  <div class="space-y-3">
    <!-- Online -->
    <div
      v-if="showOnline"
      class="rounded-2xl p-3.5 border border-sky-200/80 dark:border-sky-800/50 bg-sky-50/80 dark:bg-sky-950/25 space-y-3"
    >
      <div class="space-y-1">
        <p class="text-[12px] font-black text-slate-900 dark:text-white">
          Online to'lov — darhol faol
        </p>
        <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug">
          {{ onlineHint }}
        </p>
      </div>

      <button
        v-if="clickEnabled"
        type="button"
        :disabled="disabled || loading === 'click'"
        class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-white bg-[#00ADEF] hover:bg-[#0096d1] shadow-md shadow-sky-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
        @click="$emit('pay-click')"
      >
        <span class="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-1">
          <!-- Click brand mark -->
          <svg viewBox="0 0 120 40" class="w-9 h-6" aria-hidden="true">
            <rect width="120" height="40" rx="8" fill="#00ADEF" />
            <text
              x="60"
              y="27"
              text-anchor="middle"
              font-size="18"
              font-weight="800"
              font-family="Arial Black, Arial, sans-serif"
              fill="#fff"
              letter-spacing="-0.5"
            >Click</text>
          </svg>
        </span>
        <span class="flex-1 min-w-0">
          <span class="block text-[13px] font-black leading-tight">Click orqali to'lash</span>
          <span class="block text-[11px] font-semibold text-white/85 mt-0.5">
            {{ amountLabel }} · to'lovdan keyin darhol
          </span>
        </span>
        <font-awesome-icon
          :icon="loading === 'click' ? 'fa-solid fa-spinner' : 'fa-solid fa-chevron-right'"
          class="text-sm opacity-90"
          :class="{ 'animate-spin': loading === 'click' }"
        />
      </button>

      <button
        v-if="paymeEnabled"
        type="button"
        :disabled="disabled || loading === 'payme'"
        class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-white bg-[#00C2C2] hover:bg-[#00a8a8] shadow-md shadow-teal-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
        @click="$emit('pay-payme')"
      >
        <span class="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-1">
          <!-- Payme brand mark -->
          <svg viewBox="0 0 120 40" class="w-9 h-6" aria-hidden="true">
            <rect width="120" height="40" rx="8" fill="#00C2C2" />
            <text
              x="60"
              y="27"
              text-anchor="middle"
              font-size="16"
              font-weight="800"
              font-family="Arial Black, Arial, sans-serif"
              fill="#fff"
            >Payme</text>
          </svg>
        </span>
        <span class="flex-1 min-w-0">
          <span class="block text-[13px] font-black leading-tight">Payme orqali to'lash</span>
          <span class="block text-[11px] font-semibold text-white/85 mt-0.5">
            {{ amountLabel }} · to'lovdan keyin darhol
          </span>
        </span>
        <font-awesome-icon
          :icon="loading === 'payme' ? 'fa-solid fa-spinner' : 'fa-solid fa-chevron-right'"
          class="text-sm opacity-90"
          :class="{ 'animate-spin': loading === 'payme' }"
        />
      </button>
    </div>

    <!-- Admin -->
    <div
      v-if="showAdmin"
      class="rounded-2xl p-3.5 border border-violet-200/80 dark:border-violet-800/50 bg-violet-50/70 dark:bg-violet-950/20 space-y-3"
    >
      <div class="space-y-1">
        <p class="text-[12px] font-black text-slate-900 dark:text-white">
          Admin orqali to'lov
        </p>
        <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug">
          So'rov adminga yuboriladi. Admin to'lov xabarini ko'rib, qo'lda faollashtiradi.
        </p>
      </div>

      <button
        type="button"
        :disabled="disabled || adminLoading"
        class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
        @click="$emit('pay-admin')"
      >
        <span class="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
          <font-awesome-icon
            :icon="adminLoading ? 'fa-solid fa-spinner' : 'fa-solid fa-headset'"
            :class="{ 'animate-spin': adminLoading }"
          />
        </span>
        <span class="flex-1 min-w-0">
          <span class="block text-[13px] font-black leading-tight">{{ adminLabel }}</span>
          <span class="block text-[11px] font-semibold text-white/80 mt-0.5">
            Admin tasdiqlagach faol bo'ladi
          </span>
        </span>
        <font-awesome-icon icon="fa-solid fa-chevron-right" class="text-sm opacity-90" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
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
    onlineHint: "Click yoki Payme orqali to'lov tugashi bilan tizimda darhol aks etadi.",
    loading: null,
    adminLoading: false,
    disabled: false,
  }
)

defineEmits<{
  'pay-click': []
  'pay-payme': []
  'pay-admin': []
}>()

const showOnline = computed(() => !!(props.clickEnabled || props.paymeEnabled))
const amountLabel = computed(() => `${(props.amount ?? 0).toLocaleString('ru-RU')} so'm`)
</script>
