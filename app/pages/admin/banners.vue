<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-5 pb-28">
    <AdminHeader />
    <div class="mt-8 text-center space-y-2">
      <font-awesome-icon icon="fa-solid fa-image" class="text-3xl text-slate-300" />
      <p class="text-sm font-black text-slate-700 dark:text-slate-200">Reklama bannerlari</p>
      <p class="text-[12px] font-medium text-slate-400">Tez orada — banner qo'shish va tartiblash</p>
      <button
        type="button"
        class="mt-4 text-[12px] font-bold text-sky-600"
        @click="navigateTo('/admin/dashboard')"
      >
        ← Dashboardga qaytish
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>
