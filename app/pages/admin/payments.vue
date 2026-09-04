<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <header class="flex items-center gap-2 sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <button
        type="button"
        class="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95"
        aria-label="Orqaga"
        @click="navigateTo('/admin/dashboard')"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" />
      </button>
      <div class="leading-none">
        <h1 class="text-base font-black text-slate-900 dark:text-white">To'lovlar tarixi</h1>
        <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
          Barcha haydovchilar bo'yicha
        </p>
      </div>
    </header>

    <DriverPaymentHistoryList
      api-path="/drivers/payments"
      show-driver
      deletable
      subtitle="Hisob to'ldirish va tarif to'lovlari"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>
