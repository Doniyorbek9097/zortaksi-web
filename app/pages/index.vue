<template>
    <div class="w-full overflow-x-hidden font-sans antialiased bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 transition-colors">
      <!-- Mavzu almashtirish tugmasi -->
      <button
        type="button"
        class="fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center
               bg-neutral-100 border border-neutral-200 hover:scale-105 hover:border-emerald-500
               dark:bg-neutral-900 dark:border-neutral-800 dark:hover:border-emerald-400
               transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2"
        :aria-label="theme === 'dark' ? 'Yorug\' rejimga o\'tish' : 'Qorong\'i rejimga o\'tish'"
        @click="toggleTheme"
      >
        {{ theme === 'dark' ? '☀️' : '🌙' }}
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
              Yo'lovchi so'rovlarini bitta joyda ko'ring, hududingizga mosini tanlang va tez bog'laning — qidirishga vaqt sarflamang.
            </p>
  
            <div class="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
              <LandingButton to="/auth" variant="primary">
                Haydovchi bo'lish
              </LandingButton>
              <LandingButton to="/passenger-ad" variant="secondary">
                Yo'lovchi e'lon berish
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
                  <span class="text-lg">🚗</span>
                  <span class="text-sm font-medium">Samarqand → Urgut · 2 kishi</span>
                </div>
                <div class="flex items-center gap-2 rounded-xl p-3 border
                            bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-400/15 dark:border-emerald-400/20">
                  <span class="text-lg">✅</span>
                  <span class="text-sm font-medium">Yangi buyurtma keldi!</span>
                </div>
                <div class="flex items-center gap-2 rounded-xl p-3 border
                            bg-violet-500/10 border-violet-500/20 dark:bg-violet-400/15 dark:border-violet-400/20">
                  <span class="text-lg">📢</span>
                  <span class="text-sm font-medium">E'loningiz joylandi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Features -->
      <section class="py-20 px-5 max-w-6xl mx-auto">
        <LandingSectionHeader 
          badge="🚗 Faqat haydovchilar uchun"
          title="Nega haydovchilar ZorTaksi ni tanlaydi?"
          description="Bu platforma yo'lovchilarga emas — <strong class='font-semibold text-neutral-900 dark:text-neutral-50'>taksi haydovchilariga</strong> mo'ljallangan. Qidirishga ketadigan vaqt o'rniga barcha mos so'rovlar bitta panelda jamlanadi."
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
            title="Haydovchi sifatida qanday ishlaydi?"
            description="Ro'yxatdan o'tishdan buyurtma olishgacha — 4 oddiy qadam"
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
          <h2 class="text-3xl font-black">Haydovchi yoki yo'lovchi?</h2>
          <p class="text-lg text-neutral-600 dark:text-neutral-400">Haydovchi bo'ling yoki yo'lovchi sifatida e'lon joylang</p>
          <div class="flex flex-wrap gap-3 justify-center">
            <LandingButton to="/auth" variant="primary">
              Haydovchi bo'lish
            </LandingButton>
            <LandingButton to="/passenger-ad" variant="secondary">
              Yo'lovchi e'lon berish
            </LandingButton>
          </div>
        </div>
      </section>
  
      <footer class="py-8 text-center text-xs border-t text-neutral-400 border-neutral-200 dark:text-neutral-500 dark:border-neutral-800 space-y-2">
        <div class="flex items-center justify-center gap-4">
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
  definePageMeta({ layout: 'default' });
  
  const { theme, toggleTheme } = useTheme();
  
  const features = [
    {
      icon: '📋',
      title: 'So\'rovlar bir joyda',
      desc: 'Turli manbalardagi yo\'lovchi so\'rovlari avtomatik yig\'iladi — bir nechta joyni qo\'lda kuzatib yurish shart emas.',
      iconBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    },
    {
      icon: '📞',
      title: 'Tez bog\'lanish',
      desc: 'Yo\'lovchining telefon raqami tayyor — bir bosishda qo\'ng\'iroq qiling va buyurtmani tezda oling.',
      iconBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    },
    {
      icon: '📢',
      title: 'O\'z e\'loningizni yuboring',
      desc: 'Bo\'sh o\'rin bormi? Bir marta e\'lon joylang — ko\'proq yo\'lovchiga ko\'rinasiz.',
      iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    },
    {
      icon: '📍',
      title: 'Hududingiz bo\'yicha',
      desc: 'Kalit so\'zlaringizni belgilang — faqat sizga mos so\'rovlar panelingizda chiqadi.',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    },
  ];
  
  const steps = [
    { title: 'Ro\'yxatdan o\'ting', desc: 'Haydovchi sifatida telefon raqam va Telegram hisobingizni ulang.' },
    { title: 'Kalit so\'zlarni kiriting', desc: 'Buyurtmalar sahifasida hududingiz nomlarini yozing: namangan, chortoq, uychi…' },
    { title: 'Buyurtmalarni kuzating', desc: 'Dashboardda yangi yo\'lovchi so\'rovlari real vaqtda tushadi.' },
    { title: 'Yo\'lovchi bilan bog\'laning', desc: 'Telefon orqali bog\'laning yoki o\'z e\'loningizni joylang.' },
  ];
  
  const trust = [
    { title: 'Haydovchilar uchun yaratilgan', desc: 'Platforma aynan taksichilar ehtiyojiga qarab ishlab chiqilgan.' },
    { title: 'Telegram orqali kirish', desc: 'Alohida ilova emas — o\'z Telegram akkauntingiz bilan ishlang.' },
    { title: 'Real vaqtda xabar', desc: 'Yangi buyurtma tushganda darhol bildirishnoma olasiz.' },
    { title: 'Qo\'llab-quvvatlash', desc: 'Muammo bo\'lsa admin bilan Telegram orqali bog\'lanasiz.' },
  ];
  
  onMounted(() => {
    const tg = (window as Window & { Telegram?: { WebApp?: { expand: () => void } } }).Telegram?.WebApp;
    tg?.expand();
  });
  </script>