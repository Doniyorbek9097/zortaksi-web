<template>
  <LegalShell title="Hisobni o'chirish" updated="24.07.2026">
    <section class="legal-card space-y-3">
      <h2 class="legal-h">Nima o'chiriladi?</h2>
      <ul class="legal-list">
        <li>Profil va telefon raqami</li>
        <li>Telegram sessiya / kirish tokenlari</li>
        <li>Ilova ichidagi chatlar va xabarlar</li>
        <li>Balans, tarif va to'lovlar tarixi</li>
      </ul>
      <p class="legal-p">
        O'chirish <strong>qaytarilmaydi</strong>. Keyin qayta kirish uchun yangidan
        ro'yxatdan o'tishingiz kerak bo'ladi.
      </p>
    </section>

    <section class="legal-card space-y-3">
      <h2 class="legal-h">Qanday o'chirish mumkin</h2>
      <ol class="legal-ol">
        <li>Zo'r Taksi ilovasiga kiring.</li>
        <li><strong>Profil</strong> bo'limiga o'ting.</li>
        <li>
          <strong>«Hisobni butunlay o'chirish»</strong> tugmasini bosing va tasdiqlang.
        </li>
      </ol>
      <p class="legal-p">
        Yoki quyida tizimga kirib, shu sahifadan o'chirishni so'rang.
      </p>
    </section>

    <!-- Logged-in delete -->
    <section v-if="isLoggedIn" class="legal-card space-y-4">
      <h2 class="legal-h">Hisobingizni hozir o'chirish</h2>
      <p class="legal-p">
        Kirilgan: <strong>{{ displayName }}</strong>
        <span v-if="phone" class="text-slate-400"> · +{{ phone }}</span>
      </p>
      <label class="flex items-start gap-2.5 text-[13px] font-medium text-slate-600 dark:text-slate-300">
        <input v-model="confirmed" type="checkbox" class="mt-1 rounded border-slate-300" />
        <span>
          Men ma'lumotlarim butunlay o'chirilishini tushunaman va roziman.
        </span>
      </label>
      <button
        type="button"
        class="w-full min-h-12 rounded-xl text-[13px] font-black text-white bg-red-500 hover:bg-red-600 disabled:opacity-40 active:scale-[0.98] transition"
        :disabled="!confirmed || loading"
        @click="showConfirm = true"
      >
        {{ loading ? 'O\'chirilmoqda...' : "Hisobni butunlay o'chirish" }}
      </button>
      <p v-if="error" class="text-[13px] font-bold text-red-500">{{ error }}</p>
      <p v-if="success" class="text-[13px] font-bold text-emerald-600">{{ success }}</p>
    </section>

    <section v-else class="legal-card space-y-4">
      <h2 class="legal-h">Tizimga kiring</h2>
      <p class="legal-p">
        Hisobni o'chirish uchun avval Zo'r Taksi hisobingizga kiring.
      </p>
      <NuxtLink
        to="/auth?next=/delete-account"
        class="inline-flex w-full min-h-12 items-center justify-center rounded-xl text-[13px] font-black text-white bg-sky-600 hover:bg-sky-700 active:scale-[0.98] transition"
      >
        Kirish
      </NuxtLink>
    </section>

    <section class="legal-card space-y-3">
      <h2 class="legal-h">Yordam</h2>
      <p class="legal-p">
        Muammo bo'lsa, admin bilan bog'laning:
        <a
          :href="`https://t.me/${adminUsername}`"
          target="_blank"
          rel="noopener noreferrer"
          class="legal-link"
        >@{{ adminUsername }}</a>
      </p>
      <p class="legal-p">
        Maxfiylik siyosati:
        <NuxtLink to="/privacy" class="legal-link">/privacy</NuxtLink>
      </p>
    </section>

    <section class="legal-card space-y-3">
      <h2 class="legal-h">Account deletion (English)</h2>
      <p class="legal-p">
        To delete your Zo'r Taksi account and associated personal data: open the app →
        Profile → «Hisobni butunlay o'chirish», or sign in on this page and confirm deletion.
        Deleted data includes profile, chats, payments, and sessions. This action cannot be undone.
      </p>
    </section>

    <BaseConfirmDialog
      v-model="showConfirm"
      title="Hisobni o'chirish"
      description="Qaytarib bo'lmaydi"
      message="Barcha ma'lumotlaringiz o'chiriladi. Davom etasizmi?"
      confirm-text="Ha, o'chirish"
      cancel-text="Bekor"
      variant="danger"
      :loading="loading"
      :close-on-confirm="false"
      @confirm="onDelete"
    />
  </LegalShell>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'
import { useAccountStore } from '~/stores/account.store'
import { clearAllAuthStorage } from '~/utils/activeAccount'

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: "Hisobni o'chirish — Zo'r Taksi",
  description: "Zo'r Taksi hisobini va shaxsiy ma'lumotlarni o'chirish yo'riqnomasi (Google Play talabi).",
})

const config = useRuntimeConfig()
const authStore = useAuthStore()
const accountStore = useAccountStore()
const token = useCookie('auth_token')

const adminUsername = computed(() =>
  String(config.public.adminTelegram || 'zortaksi_admin').replace(/^@/, '')
)

const isLoggedIn = computed(() => !!token.value && !!authStore.user)
const displayName = computed(() => authStore.user?.firstName || 'Foydalanuvchi')
const phone = computed(() => authStore.user?.phoneNumber || '')

const confirmed = ref(false)
const loading = ref(false)
const showConfirm = ref(false)
const error = ref('')
const success = ref('')

onMounted(async () => {
  if (token.value && !authStore.user) {
    try {
      await authStore.getMe()
    } catch { /* */ }
  }
})

const onDelete = async () => {
  if (!confirmed.value || loading.value) return
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    const res = await useApi('/delete-account', { method: 'POST' })
    if (!res?.success) {
      throw new Error(res?.message || "Hisobni o'chirib bo'lmadi")
    }
    const uid = String(authStore.user?.userId || '')
    if (uid) await accountStore.removeAccount(uid)
    token.value = null
    authStore.user = null
    clearAllAuthStorage()
    showConfirm.value = false
    success.value = "Hisob o'chirildi. Ilovadan foydalanish uchun qayta ro'yxatdan o'ting."
  } catch (e: any) {
    error.value =
      e?.response?.data?.message || e?.message || "Hisobni o'chirib bo'lmadi"
  } finally {
    loading.value = false
  }
}
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
.legal-ol {
  @apply list-decimal pl-5 space-y-2 text-[14px] leading-relaxed text-slate-600 dark:text-slate-300;
}
.legal-link {
  @apply text-sky-600 dark:text-sky-400 font-bold underline-offset-2 hover:underline;
}
</style>
