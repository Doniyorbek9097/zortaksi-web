<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28">
    <AdminHeader />
    <BaseEmptyState
      icon="fa-solid fa-image"
      title="Reklama bannerlari"
      subtitle="Tez orada — banner qo'shish va tartiblash"
      tone="slate"
    >
      <button
        type="button"
        class="mt-4 text-[12px] font-bold text-sky-600"
        @click="navigateTo('/admin/dashboard')"
      >
        ← Dashboardga qaytish
      </button>
    </BaseEmptyState>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>
