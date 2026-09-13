<template>
  <div class="shrink-0 mx-auto w-full max-w-2xl px-3 py-2">
    <div class="relative overflow-hidden rounded-2xl border border-violet-400/25 bg-violet-500/[0.07] backdrop-blur-md">
      <div
        class="absolute inset-0 pointer-events-none bg-gradient-to-br from-violet-500/12 via-transparent to-indigo-500/8"
        aria-hidden="true"
      />
      <div
        class="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-amber-400/10 blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      <div class="relative px-3.5 py-3">
        <div class="flex items-start gap-3">
          <span :class="supportHeaderIconClass">
            <font-awesome-icon icon="fa-solid fa-user-shield" class="text-[15px]" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-[13px] font-black text-violet-50 leading-tight">
              Yordam xizmati
            </p>
            <p class="text-[11px] font-medium text-violet-200/75 mt-0.5 leading-snug">
              Savolingizni yozing — yordamchi operator javob beradi
            </p>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-3 gap-2">
          <div
            v-for="item in topics"
            :key="item.label"
            class="flex flex-col items-center gap-1 rounded-xl px-2 py-2 bg-violet-950/35 border border-violet-400/15"
          >
            <span class="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-200">
              <font-awesome-icon :icon="item.icon" class="text-[11px]" />
            </span>
            <span class="text-[9px] font-bold text-violet-200/80 text-center leading-tight">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { supportHeaderIconClass } from '~/utils/supportChatTheme'

const topics = [
  { icon: 'fa-solid fa-credit-card', label: "To'lov" },
  { icon: 'fa-solid fa-gem', label: 'Tarif' },
  { icon: 'fa-solid fa-wrench', label: 'Texnik' },
]
</script>
