<template>
  <Teleport to="body">
    <Transition name="fp-fade">
      <div
        v-if="open && groups"
        class="fixed inset-0 flex items-end justify-center md:items-center bg-black/40 dark:bg-black/70 backdrop-blur-sm p-0 md:p-4 z-[10000]"
      >
        <Transition name="fp-sheet" appear>
          <div
            v-if="open && groups"
            class="w-full md:max-w-md max-h-[min(85vh,720px)] flex flex-col rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
            @click.stop
          >
            <div class="shrink-0 p-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-2 px-0.5">
                <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center shrink-0">
                  <font-awesome-icon icon="fa-solid fa-users" />
                </span>
                <div class="min-w-0 flex-1 leading-none">
                  <p class="text-sm font-black text-slate-900 dark:text-white">
                    {{ groups.telegramSessionOk === false ? 'Guruhlarga qo\'shiling' : 'Guruhlarga qo\'shildingiz' }}
                  </p>
                  <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                    {{ groups.regionTitle }} — public va private guruhlar
                  </p>
                </div>
              </div>
            </div>

            <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 space-y-2.5">
              <p
                v-if="groups.telegramSessionOk === false"
                class="text-[11px] font-bold text-amber-600 dark:text-amber-400 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 px-3 py-2"
              >
                Telegram session yo'q — guruhlarga avtomatik qo'shilmadi.
                Quyidagi tugmalar orqali Telegramda o'zingiz qo'shiling.
              </p>

              <p class="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed px-0.5">
                <template v-if="groups.telegramSessionOk === false">
                  Public guruhda e'lon bering, private guruhdan buyurtmalar oling.
                </template>
                <template v-else>
                  Sizga hudud guruhi qo'shildi. Public guruhda e'lon berishingiz mumkin,
                  private guruhdan esa buyurtmalar olasiz.
                </template>
              </p>

              <button
                v-if="groups.public"
                type="button"
                class="w-full text-left rounded-xl border px-3.5 py-3 transition-all border-sky-200 dark:border-sky-900/60 bg-sky-50/80 dark:bg-sky-950/20 hover:border-sky-400"
                @click="openPublicGroup"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="text-[10px] font-black uppercase tracking-wide text-sky-600 dark:text-sky-400">
                      Public guruh
                    </p>
                    <p class="text-[13px] font-black text-slate-900 dark:text-white mt-0.5 truncate">
                      {{ groups.public.title }}
                    </p>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {{ groups.public.hint }}
                    </p>
                  </div>
                  <span class="shrink-0 text-sky-500 text-[11px] font-black mt-1">
                    {{
                      groups.public.isMember
                        ? 'Ochish →'
                        : groups.public.canJoinManually
                          ? "Telegramda qo'shilish →"
                          : "Qo'shilish →"
                    }}
                  </span>
                </div>
              </button>

              <div
                v-if="groups.private"
                class="rounded-xl border px-3.5 py-3 border-violet-200 dark:border-violet-900/60 bg-violet-50/80 dark:bg-violet-950/20"
              >
                <p class="text-[10px] font-black uppercase tracking-wide text-violet-600 dark:text-violet-400">
                  Private guruh
                </p>
                <p class="text-[13px] font-black text-slate-900 dark:text-white mt-0.5 truncate">
                  {{ groups.private.title }}
                </p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {{ groups.private.hint }}
                </p>

                <button
                  v-if="groups.private.canJoin"
                  type="button"
                  class="mt-3 w-full rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-[12px] font-black py-2.5 disabled:opacity-50"
                  :disabled="joiningPrivate"
                  @click="joinPrivateGroup"
                >
                  {{
                    joiningPrivate
                      ? "Qo'shilmoqda…"
                      : groups.private.canJoinManually
                        ? "Telegramda qo'shilish"
                        : "Guruhga qo'shilish"
                  }}
                </button>
                <p
                  v-else-if="groups.private.isMember"
                  class="mt-3 text-[11px] font-bold text-emerald-600 dark:text-emerald-400"
                >
                  ✓ Siz allaqachon a'zosiz
                </p>
              </div>
            </div>

            <div class="shrink-0 p-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                class="w-full rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[13px] font-black py-3"
                @click="close"
              >
                Tushundim
              </button>
              <p v-if="error" class="text-center text-[11px] font-bold text-red-500 mt-2">{{ error }}</p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const {
  groups,
  open,
  joiningPrivate,
  error,
  openPublicGroup,
  joinPrivateGroup,
  close,
} = useRegionGroupsWelcome()
</script>

<style scoped>
.fp-fade-enter-active,
.fp-fade-leave-active { transition: opacity 0.2s ease; }
.fp-fade-enter-from,
.fp-fade-leave-to { opacity: 0; }
.fp-sheet-enter-active,
.fp-sheet-leave-active { transition: transform 0.25s ease, opacity 0.2s ease; }
.fp-sheet-enter-from,
.fp-sheet-leave-to { transform: translateY(16px); opacity: 0; }
</style>
