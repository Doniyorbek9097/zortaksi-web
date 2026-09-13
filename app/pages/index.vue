<template>
    <!-- Kirilgan foydalanuvchi intro ko'rmasin — middleware dashboard ga yo'naltiradi -->
    <div
      v-if="!showLanding"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-neutral-950"
    >
      <div class="flex flex-col items-center gap-3 text-neutral-500 dark:text-neutral-400">
        <font-awesome-icon icon="fa-solid fa-spinner" class="text-2xl animate-spin text-emerald-500" />
        <span class="text-xs font-semibold tracking-wide">Yuklanmoqda…</span>
      </div>
    </div>

    <div
      v-else
      class="w-full overflow-x-hidden font-sans antialiased bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 transition-colors"
    >
      <!-- Mavzu almashtirish tugmasi -->
      <button
        type="button"
        class="fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center
               bg-neutral-100 border border-neutral-200 hover:scale-105 hover:border-emerald-500
               dark:bg-neutral-900 dark:border-neutral-800 dark:hover:border-emerald-400
               transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2"
        :aria-label="effectiveTheme === 'dark' ? 'Yorug\' rejimga o\'tish' : 'Qorong\'i rejimga o\'tish'"
        @click="toggleTheme"
      >
        {{ effectiveTheme === 'dark' ? '☀️' : '🌙' }}
      </button>
  
      <!-- Hero -->
      <section class="relative min-h-[92vh] flex items-center px-5 py-16 md:py-24 overflow-hidden">
        <div class="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-emerald-400/25 dark:bg-emerald-400/20 blur-3xl pointer-events-none" />
        <div class="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-indigo-400/20 dark:bg-indigo-500/20 blur-3xl pointer-events-none" />
  
        <div class="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div class="space-y-6 text-center md:text-left">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wide
                        bg-neutral-900/5 border border-neutral-900/10 text-neutral-700
                        dark:bg-white/8 dark:border-white/10 dark:text-neutral-300">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Haydovchilar uchun platforma</span>
            </div>
  
            <div class="flex items-center justify-center md:justify-start gap-3">
              <span class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30
                           bg-gradient-to-br from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400">
                🚕
              </span>
              <h1 class="text-3xl font-black tracking-tight">
                Zo'r <span class="text-emerald-600 dark:text-emerald-400">Taksi</span>
              </h1>
            </div>
  
            <p class="text-lg md:text-xl font-light max-w-xl leading-relaxed mx-auto md:mx-0 text-neutral-600 dark:text-neutral-400">
              <strong class="font-semibold text-neutral-800 dark:text-neutral-200">Shofyor bo'lsangiz</strong>,
              Telegram akkauntingizni Zo'r Taksi ga ulang — Telegramdagi buyurtmalar bitta joyda ko'rinadi,
              yo'nalishingiz bo'yicha e'loningiz kerakli guruhlarga <strong class="font-semibold text-neutral-800 dark:text-neutral-200">avtomatik tarqaladi</strong>.
              Ishingiz osonlashadi, yo'lovchi topish tezlashadi.
            </p>

            <p
              v-if="showApkDownload"
              class="text-sm md:text-base max-w-xl leading-relaxed mx-auto md:mx-0 text-emerald-700 dark:text-emerald-400 font-medium"
            >
              📲 Ilovani yuklab olsangiz — yanada tez, qulay va doim qo'l ostida ishlaydi.
            </p>
  
            <div class="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
              <LandingButton to="/auth" variant="primary">
                Haydovchi bo'lish
              </LandingButton>
              <LandingButton to="/passenger-ad" variant="secondary">
                Yo'lovchi e'lon berish
              </LandingButton>
              <LandingButton
                v-if="showApkDownload"
                to="/download-app"
                variant="secondary"
              >
                Ilovani yuklab olish
              </LandingButton>
            </div>
          </div>
  
          <!-- Telefon maketi — 3 ta aniq karточка -->
          <div class="hidden md:flex justify-center items-center relative h-72">
            <div class="absolute inset-0 rounded-3xl bg-emerald-500/20 dark:bg-emerald-400/10 opacity-60 scale-95 rotate-3" />
            <div class="relative rounded-3xl p-8 w-full max-w-sm shadow-2xl
                        bg-white border border-neutral-200
                        dark:bg-neutral-900 dark:border-neutral-800">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-2xl">📱</div>
                <div>
                  <p class="font-black text-sm">ZorTaksi</p>
                  <p class="text-xs text-neutral-400 dark:text-neutral-500">Onlayn · 24/7</p>
                </div>
              </div>
  
              <div class="space-y-3">
                <div class="flex items-center gap-2 rounded-xl p-3 border
                            bg-sky-500/10 border-sky-500/20 dark:bg-sky-400/15 dark:border-sky-400/20">
                  <span class="text-lg">📋</span>
                  <span class="text-sm font-medium">Telegram buyurtmalar — bir joyda</span>
                </div>
                <div class="flex items-center gap-2 rounded-xl p-3 border
                            bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-400/15 dark:border-emerald-400/20">
                  <span class="text-lg">✅</span>
                  <span class="text-sm font-medium">Namangan → Toshkent · yangi so'rov</span>
                </div>
                <div class="flex items-center gap-2 rounded-xl p-3 border
                            bg-violet-500/10 border-violet-500/20 dark:bg-violet-400/15 dark:border-violet-400/20">
                  <span class="text-lg">📢</span>
                  <span class="text-sm font-medium">E'lon guruhlarga avtomatik yuborildi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Mobil ilova -->
      <section
        v-if="showApkDownload"
        class="px-5 pb-4 max-w-6xl mx-auto"
      >
        <div
          class="rounded-3xl border border-emerald-200/80 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50 via-white to-cyan-50
                 dark:from-emerald-950/40 dark:via-neutral-950 dark:to-cyan-950/30 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6"
        >
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-lg shadow-emerald-500/20
                   bg-gradient-to-br from-emerald-500 to-cyan-500 text-white"
          >
            📲
          </div>
          <div class="flex-1 text-center md:text-left space-y-2">
            <h2 class="text-xl md:text-2xl font-black text-neutral-900 dark:text-neutral-50">
              Telefonga ilovani o'rnating
            </h2>
            <p class="text-sm md:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
              Buyurtmalar va e'lonlarni kuzatish brauzerdan ham mumkin, lekin
              <strong class="font-semibold text-neutral-800 dark:text-neutral-200">Android ilovasi</strong>
              yanada qulay: tez ochiladi, bildirishnomalar keladi, yo'lda ham qulay ishlaydi.
            </p>
          </div>
          <LandingButton to="/download-app" variant="primary">
            Ilovani yuklab olish
          </LandingButton>
        </div>
      </section>
  
      <!-- Features -->
      <section class="py-20 px-5 max-w-6xl mx-auto">
        <LandingSectionHeader 
          badge="🚗 Faqat haydovchilar uchun"
          title="Zo'r Taksi nima qiladi?"
          description="Telegram hisobingizni ulang — buyurtmalar bitta joyda, e'loningiz yo'nalishingiz bo'yicha guruhlarga o'zi chiqadi. Siz faqat ishga e'tibor bering."
        />
  
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <LandingCard
            v-for="f in features" 
            :key="f.title"
            :title="f.title"
            :description="f.desc"
            :icon="f.icon"
            :icon-bg="f.iconBg"
            hover-effect
          />
        </div>
      </section>
  
      <!-- Steps -->
      <section class="py-20 px-5 bg-neutral-100 dark:bg-neutral-900/60">
        <div class="max-w-6xl mx-auto">
          <LandingSectionHeader 
            title="Qanday ishlaydi?"
            description="Telegramni ulang — qolganini Zo'r Taksi o'zi qiladi"
          />
  
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <LandingCard
              v-for="(step, i) in steps" 
              :key="step.title"
              :title="step.title"
              :description="step.desc"
              :number="i + 1"
              variant="white"
              hover-effect
            />
          </div>
        </div>
      </section>
  
      <!-- Trust -->
      <section class="py-20 px-5 max-w-4xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-black text-center mb-10">Haydovchilar nima uchun ishonadi?</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LandingTrustItem
            v-for="t in trust" 
            :key="t.title"
            :title="t.title"
            :description="t.desc"
          />
        </div>
      </section>
  
      <!-- CTA -->
      <section class="relative py-16 px-5 overflow-hidden">
        <div class="absolute -top-24 left-1/3 w-72 h-72 rounded-full bg-emerald-400/20 dark:bg-emerald-400/15 blur-3xl pointer-events-none" />
        <div class="max-w-2xl mx-auto text-center space-y-6 relative z-10">
          <h2 class="text-3xl font-black">Ishni bugun osonlashtiring</h2>
          <p class="text-lg text-neutral-600 dark:text-neutral-400">
            Telegramni ulang, buyurtmalarni bir joyda ko'ring, e'loningiz avtomatik tarqalsin.
            Ilovani yuklab olsangiz — yanada qulay.
          </p>
          <div class="flex flex-wrap gap-3 justify-center">
            <LandingButton to="/auth" variant="primary">
              Haydovchi bo'lish
            </LandingButton>
            <LandingButton to="/passenger-ad" variant="secondary">
              Yo'lovchi e'lon berish
            </LandingButton>
            <LandingButton
              v-if="showApkDownload"
              to="/download-app"
              variant="secondary"
            >
              Ilovani yuklab olish
            </LandingButton>
          </div>
        </div>
      </section>
  
      <footer class="py-8 text-center text-xs border-t text-neutral-400 border-neutral-200 dark:text-neutral-500 dark:border-neutral-800 space-y-2">
        <div class="flex flex-wrap items-center justify-center gap-4">
          <NuxtLink
            v-if="showApkDownload"
            to="/download-app"
            class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Ilovani yuklab olish
          </NuxtLink>
          <NuxtLink to="/terms" class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Foydalanish shartlari
          </NuxtLink>
          <NuxtLink to="/privacy" class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Maxfiylik siyosati
          </NuxtLink>
          <NuxtLink to="/delete-account" class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Hisobni o'chirish
          </NuxtLink>
        </div>
        <p>ZorTaksi © {{ new Date().getFullYear() }}</p>
      </footer>
    </div>
  </template>
  
  <script setup lang="ts">
  import { getAuthCookieOptions } from '~/utils/authCookie'
  import { shouldShowApkDownload } from '~/utils/appEmbed'

  definePageMeta({ layout: 'default' });
  
  const authStore = useAuthStore()
  const authToken = useCookie<string | null>('auth_token', { ...getAuthCookieOptions() })

  /** Token bor bo'lsa intro hech qachon; mehmon SSR da SEO uchun ochiq */
  const showLanding = computed(() => {
    if (authToken.value) return false
    if (import.meta.server) return true
    return authStore.sessionReady
  })

  const { effectiveTheme, toggleTheme } = useTheme();
  const showApkDownload = ref(false);
  
  const features = [
    {
      icon: '📋',
      title: 'Buyurtmalar bir joyda',
      desc: 'Telegramdagi yo\'lovchi so\'rovlari bitta panelda — guruhlarni alohida aylanib chiqish shart emas.',
      iconBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    },
    {
      icon: '📢',
      title: 'Avto-reklama',
      desc: 'E\'loningiz yo\'nalishingiz bo\'yicha kerakli Telegram guruhlarga o\'zi tarqaladi — qo\'lda yuborish bilan vaqt yo\'qotmaysiz.',
      iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    },
    {
      icon: '📞',
      title: 'Tez bog\'lanish',
      desc: 'Telefon raqam tayyor — bir bosishda qo\'ng\'iroq qiling, yo\'lovchini tezroq toping.',
      iconBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    },
    {
      icon: '📲',
      title: 'Ilova — yanada qulay',
      desc: 'Yuklab olsangiz tezroq ochiladi, bildirishnomalar keladi va yo\'lda ham qulay ishlaydi.',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    },
  ];
  
  const steps = [
    { title: 'Telegramni ulang', desc: 'Shofyor sifatida ro\'yxatdan o\'ting va Telegram akkauntingizni Zo\'r Taksi ga bog\'lang.' },
    { title: 'Yo\'nalishni belgilang', desc: 'Hududingiz va yo\'nalishingiz bo\'yicha sozlang — faqat sizga mos buyurtmalar chiqadi.' },
    { title: 'Buyurtmalarni ko\'ring', desc: 'Telegramdagi so\'rovlar bitta joyda jamlanadi — yangilari darhol ko\'rinadi.' },
    { title: 'E\'lon avtomatik tarqalsin', desc: 'Reklamangiz kerakli guruhlarga o\'zi yuboriladi — siz tezroq yo\'lovchi topasiz.' },
  ];
  
  const trust = [
    { title: 'Shofyorlar uchun', desc: 'Platforma aynan taksichilar uchun — buyurtma qidirish va reklama tarqatishni soddalashtiradi.' },
    { title: 'Telegram bilan ishlaydi', desc: 'O\'z Telegram hisobingizni ulang — buyurtmalar va guruhlar shu tizimda birlashtiriladi.' },
    { title: 'Vaqt tejaydi', desc: 'Bir nechta guruhni kuzatish o\'rniga hammasi bitta joyda — ko\'proq safar, kamroq qidiruv.' },
    { title: 'Ilova ixtiyoriy', desc: 'Brauzerdan ham ishlaydi, lekin ilovani yuklab olish yanada tez va qulay.' },
  ];
  
  onMounted(() => {
    showApkDownload.value = shouldShowApkDownload();
    const tg = (window as Window & { Telegram?: { WebApp?: { expand: () => void } } }).Telegram?.WebApp;
    tg?.expand();
  });
  </script>