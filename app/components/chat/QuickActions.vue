<template>
  <div
    v-if="show"
    class="shrink-0 border-b border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950"
  >
    <div class="mx-auto w-full max-w-2xl px-2 py-2 grid grid-cols-2 gap-1.5">
      <button
        type="button"
        class="min-h-[46px] inline-flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-[13px] font-black leading-none whitespace-nowrap transition-all active:scale-[0.98]"
        :class="telegramHref
          ? 'text-[#2AABEE] bg-[#2AABEE]/10 hover:bg-[#2AABEE]/15'
          : 'text-slate-400 bg-slate-100 dark:bg-slate-900 pointer-events-none'"
        :disabled="!telegramHref"
        @click="onTelegramClick"
      >
        <font-awesome-icon icon="fa-brands fa-telegram" class="text-[16px] shrink-0" />
        <span>Telegramda yozish</span>
      </button>

      <button
        type="button"
        class="min-h-[46px] inline-flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-[13px] font-black leading-none whitespace-nowrap transition-all active:scale-[0.98]"
        :class="groupHref
          ? 'text-violet-600 dark:text-violet-400 bg-violet-500/10 hover:bg-violet-500/15'
          : 'text-slate-400 bg-slate-100 dark:bg-slate-900 pointer-events-none'"
        :disabled="!groupHref"
        @click="onGroupClick"
      >
        <font-awesome-icon icon="fa-solid fa-users" class="text-[13px] shrink-0" />
        <span>Guruhda ko'rish</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { openTelegramExternalUrl } from '~/utils/telegramLinks'

interface Props {
  show?: boolean
  telegramHref?: string
  groupHref?: string
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  telegramHref: '',
  groupHref: '',
})

function onTelegramClick() {
  if (!props.telegramHref) return
  openTelegramExternalUrl(props.telegramHref)
}

function onGroupClick() {
  if (!props.groupHref) return
  openTelegramExternalUrl(props.groupHref)
}
</script>
