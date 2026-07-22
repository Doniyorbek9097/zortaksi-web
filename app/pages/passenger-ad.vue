<template>
  <div class="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between items-center py-8 px-4 transition-colors">
    <!-- Header / Back Button -->
    <header class="w-full max-w-[500px]">
      <button 
        @click="handleBack" 
        class="group inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-black text-slate-400 hover:text-emerald-500 transition-all active:scale-95"
      >
        <font-awesome-icon icon="fa-solid fa-chevron-left" class="transition-transform group-hover:-translate-x-0.5" />
        Orqaga
      </button>
    </header>

    <!-- Main Content -->
    <main class="w-full max-w-[500px] my-auto space-y-8 text-center">
      <!-- Icon & Title Section -->
      <div class="space-y-4">
        <div class="relative w-20 h-20 mx-auto">
          <div class="absolute inset-0 bg-emerald-500/25 dark:bg-emerald-500/15 rounded-3xl blur-2xl"></div>
          <div class="relative w-20 h-20 rounded-3xl bg-white dark:bg-slate-900 flex items-center justify-center text-emerald-500 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
            <span class="text-4xl animate-bounce">📢</span>
          </div>
        </div>

        <div class="space-y-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            ⚠️ Tezkor yangilik
          </span>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Yo'lovchi e'lon berish
          </h1>
          <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Xizmat yaqin kunlarda ishga tushadi
          </p>
        </div>
      </div>

      <!-- Detail Card -->
      <div class="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800/50 space-y-6">
        <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Hozirda veb-sayt orqali to'g'ridan-to'g'ri e'lon joylash imkoniyati ishlab chiqilmoqda. Siz o'z e'loningizni bizning rasmiy Telegram guruhlarimiz va botimiz orqali hoziroq bepul e'lon qilishingiz mumkin.
        </p>

        <!-- Interactive Info blocks -->
        <div class="space-y-3 pt-2">
          <div class="flex items-center gap-3 p-4 rounded-2xl border bg-emerald-500/5 border-emerald-500/10 dark:bg-emerald-400/5 dark:border-emerald-400/10 text-left">
            <span class="text-2xl shrink-0">🤖</span>
            <div>
              <h3 class="font-bold text-sm text-slate-900 dark:text-white">Telegram Bot</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Bizning bot orqali e'loningizni bir zumda joylang.</p>
            </div>
          </div>

          <div class="flex items-center gap-3 p-4 rounded-2xl border bg-indigo-500/5 border-indigo-500/10 dark:bg-indigo-400/5 dark:border-indigo-400/10 text-left">
            <span class="text-2xl shrink-0">💬</span>
            <div>
              <h3 class="font-bold text-sm text-slate-900 dark:text-white">Telegram Guruhlar</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Viloyat va tumanlararo taksi guruhlarida e'lon bering.</p>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 pt-2">
          <button 
            @click="handleBack"
            class="flex-1 py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs uppercase tracking-widest active:scale-[0.98] transition-all"
          >
            Orqaga qaytish
          </button>
          <a 
            href="https://t.me" 
            target="_blank"
            class="flex-1 py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest text-center shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
          >
            Telegramga o'tish
          </a>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
      ZorTaksi · {{ new Date().getFullYear() }}
    </footer>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();

const handleBack = () => {
  router.push('/');
};

definePageMeta({
  layout: 'default'
});
</script>
