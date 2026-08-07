<template>
  <LegalShell title="Foydalanish shartlari" updated="31.07.2026">
    <section class="legal-card space-y-3">
      <p class="legal-p">
        ZorTaksi xizmatidan foydalanish ushbu shartlarga rozilikni anglatadi.
      </p>
    </section>

    <section class="legal-card space-y-3">
      <h2 class="legal-h">Doira va huquqlar</h2>
      <p class="legal-p">
        Telegram hisobi buyurtmalar, chat va xabarlar uchun ishlatiladi. Ma'lumotlar xizmatdan
        tashqari ishlatilmaydi. Hisobni istalgan vaqtda uzishingiz mumkin. Batafsil:
        <NuxtLink to="/privacy" class="legal-link">Maxfiylik siyosati</NuxtLink>.
      </p>
    </section>
  </LegalShell>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

useSeoMeta({
  title: "Foydalanish shartlari — Zo'r Taksi",
  description: 'ZorTaksi foydalanish shartlari. Telegram hisobi va xizmatdan foydalanish qoidalari.',
})
</script>

<style scoped>
.legal-card {
  @apply rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800;
}
.legal-h {
  @apply text-[15px] font-black text-slate-900 dark:text-white;
}
.legal-p {
  @apply text-[14px] leading-relaxed text-slate-600 dark:text-slate-300;
}
.legal-link {
  @apply text-sky-600 dark:text-sky-400 font-bold underline-offset-2 hover:underline;
}
</style>
