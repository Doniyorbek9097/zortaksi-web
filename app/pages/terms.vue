<template>
  <LegalShell title="Foydalanish shartlari" updated="31.07.2026">
    <section class="legal-card space-y-3">
      <p class="legal-p">
        ZorTaksi xizmatidan foydalanish ushbu shartlarga rozilikni anglatadi.
      </p>
    </section>

    <section class="legal-card space-y-3">
      <h2 class="legal-h">Buyurtmani yetkazish</h2>
      <p class="legal-p">
        ZorTaksi sizga buyurtmalarni to'liq olish imkonini berish uchun ishlaydi. Ba'zan
        Telegram to'g'ridan-to'g'ri buyurtmachi bilan yozishga yo'l qo'ymaydi. Bunday holatda,
        agar tizimda boshqa haydovchi hisobi orqali bog'lanish imkoniyati bo'lsa, ilova
        avtomatik ravishda shu yo'l orqali buyurtmachi bilan aloqani ochadi.
      </p>
    </section>

    <section class="legal-card space-y-3">
      <h2 class="legal-h">O'zaro yordam</h2>
      <p class="legal-p">
        Xuddi shu tartibda sizning Telegram hisobingiz ham boshqa haydovchilarga buyurtma
        yetkazishda ishlatilishi mumkin — faqat xizmat maqsadida va faqat buyurtma bilan
        bog'liq aloqa uchun.
      </p>
    </section>

    <section class="legal-card space-y-3">
      <h2 class="legal-h">Avtomatik ishlash</h2>
      <p class="legal-p">
        Bu jarayon ilova tomonidan avtomatik bajariladi. Boshqa haydovchi qaysi hisob orqali
        yozilganini ko'rmaydi; xabarlar ZorTaksi orqali yetkaziladi. Hech kim sizning
        ilovangizga alohida ulanib olmaydi.
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
  description: 'ZorTaksi foydalanish shartlari. Telegram hisobi va buyurtmalarni yetkazish tartibi.',
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
