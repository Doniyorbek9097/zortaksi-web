<template>
  <LegalShell title="Maxfiylik siyosati" updated="24.07.2026">
    <section class="legal-card space-y-3">
      <h2 class="legal-h">1. Kirish</h2>
      <p class="legal-p">
        Ushbu Maxfiylik siyosati Zo'r Taksi («Ilova», «biz») mobil va veb ilovasidan
        foydalanishda shaxsiy ma'lumotlaringiz qanday yig'ilishi, ishlatilishi va himoya
        qilinishini tushuntiradi. Ilovadan foydalanish orqali siz ushbu siyosatga rozilik
        bildirasiz.
      </p>
    </section>

    <section class="legal-card space-y-3">
      <h2 class="legal-h">2. Qanday ma'lumotlar yig'iladi</h2>
      <ul class="legal-list">
        <li>
          <strong>Hisob ma'lumotlari:</strong> telefon raqami, ism, Telegram user ID,
          username, avatar (Telegram orqali kirishda).
        </li>
        <li>
          <strong>Faoliyat ma'lumotlari:</strong> tarif/obuna holati, balans, to'lovlar
          tarixi, buyurtmalar bilan bog'liq amallar.
        </li>
        <li>
          <strong>Xabarlar:</strong> ilova ichidagi chat xabarlari (matn, ovoz, rasm).
        </li>
        <li>
          <strong>Qurilma ma'lumotlari:</strong> til/mavzu sozlamalari (brauzer yoki
          ilova xotirasida).
        </li>
        <li>
          <strong>Texnik jurnal:</strong> xatoliklarni tuzatish uchun minimal server
          jurnallari.
        </li>
      </ul>
    </section>

    <section class="legal-card space-y-3">
      <h2 class="legal-h">3. Ma'lumotlardan foydalanish maqsadi</h2>
      <ul class="legal-list">
        <li>Hisob yaratish va autentifikatsiya (Telegram orqali).</li>
        <li>Haydovchilarga buyurtma e'lonlarini ko'rsatish va bog'lanish.</li>
        <li>Tarif, balans va to'lov so'rovlarini boshqarish.</li>
        <li>Bildirishnomalar va qo'llab-quvvatlash (admin chat).</li>
        <li>Xavfsizlik, firibgarlikning oldini olish va xizmat sifatini yaxshilash.</li>
      </ul>
    </section>

    <section class="legal-card space-y-3">
      <h2 class="legal-h">4. Uchinchi tomonlar</h2>
      <p class="legal-p">
        Autentifikatsiya va ba'zi funksiyalar uchun Telegram xizmatlaridan foydalaniladi.
        Hosting va infratuzilma provayderlari (masalan, bulut server) ma'lumotlarni faqat
        xizmatni ko'rsatish uchun qayta ishlashi mumkin. Biz sizning ma'lumotlaringizni
        reklama maqsadida sotmaymiz.
      </p>
    </section>

    <section class="legal-card space-y-3">
      <h2 class="legal-h">5. Saqlash muddati</h2>
      <p class="legal-p">
        Hisob ma'lumotlari siz hisobni o'chirgungizcha yoki qonuniy majburiyat talab
        qilgunga qadar saqlanadi. Buyurtma e'lonlari vaqtincha saqlanadi va avtomatik
        muddati o'tishi mumkin. O'chirilgan hisob ma'lumotlari odatda zudlik bilan yoki
        qisqa texnik muddat ichida tizimdan olib tashlanadi.
      </p>
    </section>

    <section class="legal-card space-y-3">
      <h2 class="legal-h">6. Sizning huquqlaringiz</h2>
      <ul class="legal-list">
        <li>O'z ma'lumotlaringizga kirish va yangilash.</li>
        <li>
          Hisobni o'chirish —
          <NuxtLink to="/delete-account" class="legal-link">Hisobni o'chirish</NuxtLink>
          sahifasi orqali.
        </li>
        <li>Maxfiylik bo'yicha savollar uchun admin bilan bog'lanish.</li>
      </ul>
    </section>

    <section class="legal-card space-y-3">
      <h2 class="legal-h">7. Bolalar</h2>
      <p class="legal-p">
        Ilova 18 yoshdan kichik foydalanuvchilar uchun mo'ljallanmagan. Agar bola
        ma'lumotlari yig'ilganini aniqlasak, ularni o'chiramiz.
      </p>
    </section>

    <section class="legal-card space-y-3">
      <h2 class="legal-h">8. Aloqa</h2>
      <p class="legal-p">
        Maxfiylik bo'yicha murojaat:
        <a
          :href="`https://t.me/${adminUsername}`"
          target="_blank"
          rel="noopener noreferrer"
          class="legal-link"
        >@{{ adminUsername }}</a>
      </p>
      <p class="legal-p text-[12px] text-slate-400">
        Veb-manzil:
        <a :href="appUrl" class="legal-link">{{ appUrl }}</a>
      </p>
    </section>

    <section class="legal-card space-y-3">
      <h2 class="legal-h">Privacy Policy (English summary)</h2>
      <p class="legal-p">
        Zo'r Taksi collects account data (phone, Telegram ID, name), usage data (tariff,
        balance, payments), in-app chat messages, and device notification tokens to provide
        the driver order aggregation service. Data is not sold for advertising. You may
        request account deletion at
        <NuxtLink to="/delete-account" class="legal-link">/delete-account</NuxtLink>.
        Contact: @{{ adminUsername }}.
      </p>
    </section>
  </LegalShell>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

useSeoMeta({
  title: "Maxfiylik siyosati — Zo'r Taksi",
  description: "Zo'r Taksi ilovasi maxfiylik siyosati. Shaxsiy ma'lumotlar qanday yig'iladi va himoya qilinadi.",
})

const config = useRuntimeConfig()
const adminUsername = computed(() =>
  String(config.public.adminTelegram || 'zortaksi_admin').replace(/^@/, '')
)
const appUrl = computed(() => String(config.public.appUrl || 'https://www.zortaksi.uz').replace(/\/$/, ''))
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
.legal-list {
  @apply list-disc pl-5 space-y-2 text-[14px] leading-relaxed text-slate-600 dark:text-slate-300;
}
.legal-link {
  @apply text-sky-600 dark:text-sky-400 font-bold underline-offset-2 hover:underline;
}
</style>
