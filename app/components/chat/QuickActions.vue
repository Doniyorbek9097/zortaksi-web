<template>
  <div
    v-if="show"
    class="shrink-0 border-b border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950"
  >
    <div class="mx-auto w-full max-w-2xl px-2 py-2 grid grid-cols-3 gap-1.5">
      <a
        :href="telegramHref || undefined"
        :target="telegramHref ? '_blank' : undefined"
        :rel="telegramHref ? 'noopener noreferrer' : undefined"
        class="min-h-[46px] inline-flex items-center justify-center gap-1 px-1 py-2.5 rounded-xl text-[13px] font-black leading-none whitespace-nowrap transition-all active:scale-[0.98]"
        :class="telegramHref
          ? 'text-[#2AABEE] bg-[#2AABEE]/10 hover:bg-[#2AABEE]/15'
          : 'text-slate-400 bg-slate-100 dark:bg-slate-900 pointer-events-none'"
        @click="onTelegramClick"
      >
        <font-awesome-icon icon="fa-brands fa-telegram" class="text-[15px] shrink-0" />
        <span>Telegram orqali</span>
      </a>

      <a
        :href="groupHref || undefined"
        :target="groupHref ? '_blank' : undefined"
        :rel="groupHref ? 'noopener noreferrer' : undefined"
        class="min-h-[46px] inline-flex items-center justify-center gap-1 px-1 py-2.5 rounded-xl text-[13px] font-black leading-none whitespace-nowrap transition-all active:scale-[0.98]"
        :class="groupHref
          ? 'text-violet-600 dark:text-violet-400 bg-violet-500/10 hover:bg-violet-500/15'
          : 'text-slate-400 bg-slate-100 dark:bg-slate-900 pointer-events-none'"
        @click="onGroupClick"
      >
        <font-awesome-icon icon="fa-solid fa-users" class="text-[13px] shrink-0" />
        <span>Guruhda ko'rish</span>
      </a>

      <button
        type="button"
        class="min-h-[46px] inline-flex items-center justify-center gap-1 px-1 py-2.5 rounded-xl text-[13px] font-black leading-none whitespace-nowrap transition-all active:scale-[0.98]"
        :class="canCall
          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15'
          : 'text-slate-400 bg-slate-100 dark:bg-slate-900'"
        :disabled="!canCall"
        @click="$emit('call')"
      >
        <font-awesome-icon icon="fa-solid fa-phone" class="text-[13px] shrink-0" />
        <span>Qo'ng'iroq</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show?: boolean
  telegramHref?: string
  groupHref?: string
  canCall?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  telegramHref: '',
  groupHref: '',
  canCall: false,
})

defineEmits<{ call: [] }>()

function onTelegramClick(e: Event) {
  if (!props.telegramHref) e.preventDefault()
}

function onGroupClick(e: Event) {
  if (!props.groupHref) e.preventDefault()
}
</script>
