<template>
  <Teleport to="body">
    <Transition name="pwa-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div class="absolute inset-0 bg-slate-950/70 backdrop-blur-md" @click="remindLater" />

        <div
          class="relative w-full max-w-sm rounded-3xl border border-slate-700/80 bg-slate-900 text-white shadow-2xl shadow-black/40 px-6 pt-5 pb-6"
        >
          <button
            type="button"
            class="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Yopish"
            @click="remindLater"
          >
            <span class="text-xl leading-none">&times;</span>
          </button>

          <div class="flex flex-col items-center text-center">
            <div
              class="w-20 h-20 rounded-full overflow-hidden border-2 border-sky-500/40 shadow-lg shadow-sky-500/20 bg-slate-800"
            >
              <img src="/logo.jpg" alt="Zo'r Taksi" class="w-full h-full object-cover" />
            </div>

            <h2 class="mt-4 text-xl font-black tracking-tight">Ilovani o'rnating</h2>
            <p class="mt-2 text-[13px] leading-relaxed text-slate-400 font-medium">
              ZorTaksi.Uz ni telefoningizga o'rnating — tezroq kirish va buyurtmalarni oson kuzatish uchun.
            </p>

            <ul class="mt-5 w-full space-y-2.5 text-left">
              <li
                v-for="item in benefits"
                :key="item"
                class="flex items-start gap-2.5 text-[13px] font-semibold text-slate-200"
              >
                <span
                  class="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-[11px]"
                >
                  ✓
                </span>
                <span>{{ item }}</span>
              </li>
            </ul>

            <button
              type="button"
              class="mt-6 w-full py-3.5 rounded-xl text-sm font-black text-white bg-gradient-to-r from-sky-500 to-violet-600 shadow-lg shadow-violet-600/25 active:scale-[0.98] transition-transform"
              @click="onInstall"
            >
              Telefonga o'rnating
            </button>

            <p
              v-if="iosHint"
              class="mt-3 text-[11px] text-slate-400 leading-relaxed"
            >
              Safari → Ulashish → <b class="text-slate-200">Add to Home Screen</b>
            </p>

            <button
              type="button"
              class="mt-3 text-[13px] font-bold text-slate-500 hover:text-slate-300"
              @click="remindLater"
            >
              Keyinroq eslat
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
  iosHint?: boolean
}>()

const emit = defineEmits<{
  install: []
  later: []
  'update:open': [boolean]
}>()

const benefits = [
  'Bir bosishda tez kirish',
  "Ekran o'chiq bo'lsa ham bildirishnoma",
  "Telegram buyurtmalarini doim qo'l ostida",
]

const remindLater = () => {
  emit('later')
  emit('update:open', false)
}

const onInstall = () => {
  emit('install')
}
</script>

<style scoped>
.pwa-fade-enter-active,
.pwa-fade-leave-active {
  transition: opacity 0.2s ease;
}
.pwa-fade-enter-from,
.pwa-fade-leave-to {
  opacity: 0;
}
</style>
