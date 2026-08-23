<template>
  <div class="space-y-4">
    <!-- Online to'lov — Click / Payme -->
    <section v-if="showOnline" class="premium-panel premium-panel--online">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="premium-badge premium-badge--sky">
            <font-awesome-icon icon="fa-solid fa-bolt" class="text-[13px]" />
          </span>
          <div class="min-w-0">
            <p class="text-[13px] font-black text-slate-900 dark:text-white leading-tight">
              Online to'lov
            </p>
            <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              {{ onlineHint }}
            </p>
          </div>
        </div>
        <span class="premium-pill premium-pill--instant shrink-0">
          <font-awesome-icon icon="fa-solid fa-circle-check" class="text-[9px]" />
          Darhol
        </span>
      </div>

      <!-- Click — asosiy premium tugma -->
      <button
        v-if="clickEnabled"
        type="button"
        :disabled="disabled || loading === 'click'"
        class="premium-pay-btn premium-pay-btn--click group"
        @click="$emit('pay-click')"
      >
        <span class="premium-pay-btn__shine" aria-hidden="true" />
        <span class="premium-pay-btn__glow premium-pay-btn__glow--click" aria-hidden="true" />

        <span class="relative z-[1] flex items-center gap-3 w-full">
          <span class="premium-logo-ring premium-logo-ring--click">
            <img
              :src="clickLogo"
              alt="Click"
              class="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            >
          </span>

          <span class="flex-1 min-w-0 text-left">
            <span class="flex items-center gap-2 flex-wrap">
              <span class="text-[15px] font-black text-white leading-tight tracking-tight">
                Click orqali to'lash
              </span>
              <span class="premium-chip premium-chip--click">Tez</span>
            </span>
            <span class="block text-[12px] font-bold text-white/90 mt-1 tabular-nums">
              {{ amountLabel }}
            </span>
            <span class="block text-[10px] font-semibold text-white/75 mt-0.5">
              To'lovdan keyin balans darhol yangilanadi
            </span>
          </span>

          <span
            class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/30 group-active:scale-95 transition-transform"
          >
            <font-awesome-icon
              :icon="loading === 'click' ? 'fa-solid fa-spinner' : 'fa-solid fa-arrow-right'"
              class="text-white text-sm"
              :class="{ 'animate-spin': loading === 'click' }"
            />
          </span>
        </span>
      </button>

      <!-- Payme — ikkinchi darajali premium -->
      <button
        v-if="paymeEnabled"
        type="button"
        :disabled="disabled || loading === 'payme'"
        class="premium-pay-btn premium-pay-btn--payme group mt-2.5"
        @click="$emit('pay-payme')"
      >
        <span class="relative z-[1] flex items-center gap-3 w-full">
          <span class="premium-logo-ring premium-logo-ring--payme">
            <img
              :src="paymeLogo"
              alt="Payme"
              class="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            >
          </span>

          <span class="flex-1 min-w-0 text-left">
            <span class="block text-[14px] font-black text-slate-900 dark:text-white leading-tight">
              Payme orqali to'lash
            </span>
            <span class="block text-[12px] font-bold text-slate-600 dark:text-slate-300 mt-1 tabular-nums">
              {{ amountLabel }}
            </span>
            <span class="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              To'lovdan keyin darhol
            </span>
          </span>

          <span
            class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-700 group-active:scale-95 transition-transform"
          >
            <font-awesome-icon
              :icon="loading === 'payme' ? 'fa-solid fa-spinner' : 'fa-solid fa-arrow-right'"
              class="text-slate-500 dark:text-slate-300 text-sm"
              :class="{ 'animate-spin': loading === 'payme' }"
            />
          </span>
        </span>
      </button>
    </section>

    <!-- Admin orqali to'lov -->
    <section v-if="showAdmin" class="premium-panel premium-panel--admin">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="premium-badge premium-badge--violet">
            <font-awesome-icon icon="fa-solid fa-headset" class="text-[13px]" />
          </span>
          <div class="min-w-0">
            <p class="text-[13px] font-black text-slate-900 dark:text-white leading-tight">
              Admin orqali to'lov
            </p>
            <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              Telegram ochiladi — tayyor xabar bilan yuboring
            </p>
          </div>
        </div>
        <span class="premium-pill premium-pill--admin shrink-0">
          Qo'lda
        </span>
      </div>

      <button
        type="button"
        :disabled="disabled || adminLoading"
        class="premium-pay-btn premium-pay-btn--admin group"
        @click="$emit('pay-admin')"
      >
        <span class="premium-pay-btn__shine" aria-hidden="true" />
        <span class="premium-pay-btn__glow premium-pay-btn__glow--admin" aria-hidden="true" />

        <span class="relative z-[1] flex items-center gap-3 w-full">
          <span class="premium-logo-ring premium-logo-ring--admin">
            <font-awesome-icon
              :icon="adminLoading ? 'fa-solid fa-spinner' : 'fa-solid fa-paper-plane'"
              class="text-[18px] text-white"
              :class="{ 'animate-spin': adminLoading }"
            />
          </span>

          <span class="flex-1 min-w-0 text-left">
            <span class="flex items-center gap-2 flex-wrap">
              <span class="text-[15px] font-black text-white leading-tight tracking-tight">
                {{ adminLabel }}
              </span>
              <span class="premium-chip premium-chip--admin">Telegram</span>
            </span>
            <span class="block text-[12px] font-bold text-white/90 mt-1 tabular-nums">
              {{ amountLabel }}
            </span>
            <span class="block text-[10px] font-semibold text-white/75 mt-0.5">
              Admin tasdiqlagach tarif / balans faol bo'ladi
            </span>
          </span>

          <span
            class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/30 group-active:scale-95 transition-transform"
          >
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="text-white text-sm" />
          </span>
        </span>
      </button>

      <p class="mt-2.5 text-[10px] font-medium text-violet-600/80 dark:text-violet-300/70 text-center leading-snug px-1">
        Xabar avtomatik tayyorlanadi — faqat yuborish tugmasini bosing
      </p>
    </section>
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
    onlineHint: "Click yoki Payme orqali to'lov tugashi bilan tizimda darhol aks etadi.",
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

<style scoped>
/* Premium to'lov kartalari — Click, Payme, Admin */
.premium-panel {
  position: relative;
  border-radius: 1.25rem;
  padding: 1rem;
  border: 1px solid transparent;
}

.premium-panel--online {
  background: linear-gradient(
    145deg,
    rgb(240 249 255 / 0.95),
    rgb(224 242 254 / 0.7)
  );
  border-color: rgb(125 211 252 / 0.45);
  box-shadow:
    0 1px 0 rgb(255 255 255 / 0.8) inset,
    0 12px 32px -12px rgb(14 165 233 / 0.22);
}

:global(.dark) .premium-panel--online {
  background: linear-gradient(
    145deg,
    rgb(8 47 73 / 0.55),
    rgb(12 74 110 / 0.35)
  );
  border-color: rgb(3 105 161 / 0.45);
  box-shadow:
    0 1px 0 rgb(255 255 255 / 0.06) inset,
    0 12px 32px -12px rgb(0 0 0 / 0.45);
}

.premium-panel--admin {
  background: linear-gradient(
    145deg,
    rgb(245 243 255 / 0.95),
    rgb(237 233 254 / 0.75)
  );
  border-color: rgb(167 139 250 / 0.4);
  box-shadow:
    0 1px 0 rgb(255 255 255 / 0.8) inset,
    0 12px 32px -12px rgb(124 58 237 / 0.2);
}

:global(.dark) .premium-panel--admin {
  background: linear-gradient(
    145deg,
    rgb(46 16 101 / 0.5),
    rgb(67 20 120 / 0.35)
  );
  border-color: rgb(109 40 217 / 0.45);
  box-shadow:
    0 1px 0 rgb(255 255 255 / 0.06) inset,
    0 12px 32px -12px rgb(0 0 0 / 0.45);
}

.premium-badge {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  shrink: 0;
  border: 1px solid transparent;
}

.premium-badge--sky {
  color: rgb(2 132 199);
  background: rgb(224 242 254);
  border-color: rgb(186 230 253);
}

:global(.dark) .premium-badge--sky {
  color: rgb(125 211 252);
  background: rgb(12 74 110 / 0.5);
  border-color: rgb(3 105 161 / 0.5);
}

.premium-badge--violet {
  color: rgb(109 40 217);
  background: rgb(237 233 254);
  border-color: rgb(221 214 254);
}

:global(.dark) .premium-badge--violet {
  color: rgb(196 181 253);
  background: rgb(76 29 149 / 0.45);
  border-color: rgb(109 40 217 / 0.5);
}

.premium-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.55rem;
  border-radius: 9999px;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid transparent;
}

.premium-pill--instant {
  color: rgb(4 120 87);
  background: rgb(209 250 229);
  border-color: rgb(167 243 208);
}

:global(.dark) .premium-pill--instant {
  color: rgb(110 231 183);
  background: rgb(6 78 59 / 0.55);
  border-color: rgb(4 120 87 / 0.5);
}

.premium-pill--admin {
  color: rgb(109 40 217);
  background: rgb(237 233 254);
  border-color: rgb(221 214 254);
}

:global(.dark) .premium-pill--admin {
  color: rgb(196 181 253);
  background: rgb(76 29 149 / 0.45);
  border-color: rgb(109 40 217 / 0.5);
}

.premium-pay-btn {
  position: relative;
  display: block;
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 1rem;
  text-align: left;
  overflow: hidden;
  border: 1px solid transparent;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}

.premium-pay-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.premium-pay-btn:not(:disabled):active {
  transform: scale(0.98);
}

.premium-pay-btn--click {
  background: linear-gradient(135deg, #00b4f0 0%, #0088cc 48%, #006daa 100%);
  border-color: rgb(255 255 255 / 0.25);
  box-shadow:
    0 1px 0 rgb(255 255 255 / 0.35) inset,
    0 14px 28px -10px rgb(0 136 204 / 0.65),
    0 0 0 1px rgb(0 136 204 / 0.15);
}

.premium-pay-btn--click:not(:disabled):hover {
  box-shadow:
    0 1px 0 rgb(255 255 255 / 0.4) inset,
    0 18px 36px -12px rgb(0 136 204 / 0.75),
    0 0 0 1px rgb(0 136 204 / 0.2);
}

.premium-pay-btn--payme {
  background: linear-gradient(180deg, rgb(255 255 255), rgb(248 250 252));
  border-color: rgb(226 232 240);
  box-shadow:
    0 1px 0 rgb(255 255 255) inset,
    0 8px 20px -10px rgb(15 23 42 / 0.12);
}

:global(.dark) .premium-pay-btn--payme {
  background: linear-gradient(180deg, rgb(30 41 59), rgb(15 23 42));
  border-color: rgb(51 65 85);
  box-shadow: 0 8px 20px -10px rgb(0 0 0 / 0.35);
}

.premium-pay-btn--admin {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 45%, #5b21b6 100%);
  border-color: rgb(255 255 255 / 0.2);
  box-shadow:
    0 1px 0 rgb(255 255 255 / 0.25) inset,
    0 14px 28px -10px rgb(109 40 217 / 0.55),
    0 0 0 1px rgb(109 40 217 / 0.15);
}

.premium-pay-btn--admin:not(:disabled):hover {
  box-shadow:
    0 1px 0 rgb(255 255 255 / 0.3) inset,
    0 18px 36px -12px rgb(109 40 217 / 0.65),
    0 0 0 1px rgb(109 40 217 / 0.2);
}

.premium-pay-btn__shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 30%,
    rgb(255 255 255 / 0.18) 48%,
    transparent 65%
  );
  transform: translateX(-120%);
  animation: premium-shine 4.5s ease-in-out infinite;
  pointer-events: none;
}

.premium-pay-btn__glow {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 9999px;
  filter: blur(28px);
  opacity: 0.45;
  pointer-events: none;
  right: -20px;
  top: -30px;
}

.premium-pay-btn__glow--click {
  background: rgb(56 189 248);
}

.premium-pay-btn__glow--admin {
  background: rgb(167 139 250);
}

.premium-logo-ring {
  width: 3rem;
  height: 3rem;
  border-radius: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  shrink: 0;
  overflow: hidden;
  border: 2px solid transparent;
}

.premium-logo-ring--click {
  background: rgb(255 255 255);
  border-color: rgb(255 255 255 / 0.85);
  box-shadow: 0 4px 14px rgb(0 0 0 / 0.12);
}

.premium-logo-ring--payme {
  background: rgb(255 255 255);
  border-color: rgb(226 232 240);
  box-shadow: 0 4px 12px rgb(15 23 42 / 0.08);
}

:global(.dark) .premium-logo-ring--payme {
  background: rgb(30 41 59);
  border-color: rgb(51 65 85);
}

.premium-logo-ring--admin {
  background: rgb(255 255 255 / 0.18);
  border-color: rgb(255 255 255 / 0.35);
  backdrop-filter: blur(6px);
}

.premium-chip {
  display: inline-flex;
  padding: 0.1rem 0.45rem;
  border-radius: 9999px;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 1px solid transparent;
}

.premium-chip--click {
  color: rgb(255 255 255);
  background: rgb(255 255 255 / 0.2);
  border-color: rgb(255 255 255 / 0.35);
}

.premium-chip--admin {
  color: rgb(255 255 255);
  background: rgb(255 255 255 / 0.16);
  border-color: rgb(255 255 255 / 0.3);
}

@keyframes premium-shine {
  0%,
  72% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(120%);
  }
}
</style>
