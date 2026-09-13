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
  
        <div class="max-w-4xl mx-auto w-full relative z-10 flex flex-col items-center text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wide
                      bg-emerald-500/10 border border-emerald-500/25 text-emerald-800
                      dark:bg-emerald-400/10 dark:border-emerald-400/25 dark:text-emerald-300">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Shofyorlar uchun smart yechim</span>
          </div>

          <div class="flex items-center justify-center gap-3 mt-6">
            <span class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30
                         bg-gradient-to-br from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400">
              🚕
            </span>
            <h1 class="text-3xl md:text-4xl font-black tracking-tight">
              Zo'r <span class="text-emerald-600 dark:text-emerald-400">Taksi</span>
            </h1>
          </div>

          <p class="mt-5 text-xl md:text-2xl font-black max-w-2xl leading-snug text-neutral-900 dark:text-neutral-50">
            Ko'proq safar.
            <span class="text-emerald-600 dark:text-emerald-400">Kamroq kutish.</span>
          </p>

          <div class="mt-5 max-w-2xl space-y-3">
            <p class="text-base md:text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
              O'nlab guruhda buyurtma <strong class="font-bold text-neutral-800 dark:text-neutral-100">kutmang</strong> —
              Telegramdagi barcha buyurtmalar bitta ekranda, real vaqtda.
            </p>
            <p class="text-base md:text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
              Har guruhga alohida e'lon yozishni <strong class="font-bold text-neutral-800 dark:text-neutral-100">to'xtating</strong> —
              bir marta joylang, vaqtni belgilang — Telegram akkauntingiz reklamangizni o'zi avtomatik tashlaydi.
            </p>
            <p class="text-sm md:text-base font-semibold text-emerald-700 dark:text-emerald-400">
              📲 Ilovada kirish oson — yangi buyurtmada bildirishnoma darhol keladi.
            </p>
          </div>

          <div class="flex flex-wrap gap-3 justify-center pt-8">
            <LandingButton to="/auth" variant="primary">
              <font-awesome-icon icon="fa-solid fa-bolt" class="mr-2 text-sm" />
              Hoziroq boshlash
            </LandingButton>
            <LandingButton to="/download-app" variant="secondary">
              <font-awesome-icon icon="fa-solid fa-download" class="mr-2 text-sm" />
              Ilovani yuklab olish
            </LandingButton>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="py-20 px-5 max-w-6xl mx-auto">
        <LandingSectionHeader 
          badge="🚗 Haydovchilar uchun"
          title="Ikki muammo — bitta yechim"
          description="Buyurtma kutish va e'lon tarqatish endi oson."
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
            description="4 qadam"
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
        <h2 class="text-3xl md:text-4xl font-black text-center mb-10">Nega qulay?</h2>
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
          <h2 class="text-3xl font-black">Boshlashga tayyormisiz?</h2>
          <p class="text-lg text-neutral-600 dark:text-neutral-400">
            Buyurtmalar bir joyda — Telegram akkauntingiz reklamangizni o'zi avtomatik tashlaydi.
          </p>
          <div class="flex flex-wrap gap-3 justify-center">
            <LandingButton to="/auth" variant="primary">
              <font-awesome-icon icon="fa-solid fa-bolt" class="mr-2 text-sm" />
              Hoziroq boshlash
            </LandingButton>
            <LandingButton to="/download-app" variant="secondary">
              <font-awesome-icon icon="fa-solid fa-download" class="mr-2 text-sm" />
              Ilovani yuklab olish
            </LandingButton>
          </div>
        </div>
      </section>
  
      <footer class="py-8 text-center text-xs border-t text-neutral-400 border-neutral-200 dark:text-neutral-500 dark:border-neutral-800 space-y-2">
        <div class="flex flex-wrap items-center justify-center gap-4">
          <NuxtLink
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
  
  const features = [
    {
      icon: '📋',
      title: 'Buyurtmalar bir joyda',
      desc: 'O\'nlab guruh o\'rniga barcha Telegram buyurtmalari bitta panelda.',
      iconBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    },
    {
      icon: '📢',
      title: 'Avto e\'lon',
      desc: 'Bir marta yozing, vaqtni belgilang — Telegram akkauntingiz reklamangizni o\'zi avtomatik tashlaydi.',
      iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    },
    {
      icon: '⏱️',
      title: 'Vaqt rejasi',
      desc: 'Qachon yuborishni tanlaysiz — Telegram akkauntingiz belgilangan vaqtda avtomatik tashlaydi.',
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    },
    {
      icon: '📲',
      title: 'Ilova',
      desc: 'Kirish oson, yangi buyurtmada bildirishnoma — yanada qulay.',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    },
  ];
  
  const steps = [
    { title: 'Telegramni ulang', desc: 'Hisobingizni Zo\'r Taksi ga bog\'lang.' },
    { title: 'E\'lon + vaqt', desc: 'Reklamangizni yozing va vaqtni belgilang — akkauntingiz o\'zi avtomatik tashlaydi.' },
    { title: 'Buyurtmalar', desc: 'Telegramdagi buyurtmalar bir joyda — kutish shart emas.' },
    { title: 'Ilovani o\'rnating', desc: 'Tez kirish va yangi buyurtma bildirishnomalari.' },
  ];
  
  const trust = [
    { title: 'Guruhlarni aylanmang', desc: 'Buyurtmalar allaqachon jamlangan — bitta joydan ko\'rasiz.' },
    { title: 'Qo\'lda reklama yo\'q', desc: 'Har guruhga qo\'lda yozmasdan — akkauntingiz reklamangizni o\'zi tashlaydi.' },
    { title: 'O\'z akkauntingiz', desc: 'Telegram akkauntingiz reklamangizni o\'zi avtomatik tashlaydi.' },
    { title: 'Bildirishnomalar', desc: 'Ilovada yangi buyurtma tushganda darhol bilasiz.' },
  ];
  
  onMounted(() => {
    const tg = (window as Window & { Telegram?: { WebApp?: { expand: () => void } } }).Telegram?.WebApp;
    tg?.expand();
  });
  </script>