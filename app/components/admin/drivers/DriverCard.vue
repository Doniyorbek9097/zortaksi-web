<template>
  <article
    class="rounded-2xl p-3 bg-white dark:bg-slate-900 border shadow-sm transition-colors"
    :class="selected
      ? 'border-amber-400/80 dark:border-amber-500/60'
      : 'border-slate-200 dark:border-slate-800'"
  >
    <!-- Yuqori qator: checkbox + avatar + info -->
    <div class="flex items-start gap-2.5">
      <button
        type="button"
        class="mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors"
        :class="selected
          ? 'border-sky-500 bg-sky-500 text-white'
          : 'border-slate-300 dark:border-slate-600'"
        aria-label="Belgilash"
        @click="$emit('toggle')"
      >
        <font-awesome-icon v-if="selected" icon="fa-solid fa-check" class="text-[9px]" />
      </button>

      <div
        class="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center"
      >
        <img
          v-if="avatarSrc"
          :src="avatarSrc"
          :alt="name"
          class="w-full h-full object-cover"
          @error="avatarBroken = true"
        >
        <font-awesome-icon v-else icon="fa-solid fa-car" class="text-slate-400" />
      </div>

      <div class="flex-1 min-w-0">
        <p
          class="text-sm font-black text-slate-900 dark:text-white truncate cursor-pointer hover:text-sky-600 dark:hover:text-sky-400"
          @click.stop="$emit('open')"
        >
          {{ name }}
        </p>
        <p class="text-[12px] font-medium text-slate-400 dark:text-slate-500 truncate">
          {{ phone }}
        </p>
        <p
          v-if="registeredAt"
          class="text-[10px] font-semibold text-slate-400 dark:text-slate-500"
        >
          Ro'yxat: {{ registeredAt }}
        </p>
        <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span
            class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black"
            :class="active
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-200/80 dark:bg-slate-700 text-slate-500'"
          >
            {{ active ? 'Faol' : 'Nofaol' }}
          </span>
          <span
            class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black"
            :class="listenGroups
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
              : 'bg-slate-200/80 dark:bg-slate-700 text-slate-500'"
          >
            {{ listenGroups ? 'Tinglovchi' : 'Tinglamaydi' }}
          </span>
          <span class="text-[12px] font-black text-sky-500">
            {{ formattedBalance }} so'm
          </span>
        </div>
        <p
          v-if="tariffLine"
          class="mt-1 text-[11px] font-semibold text-amber-600/90 dark:text-amber-400/90 truncate"
        >
          {{ tariffLine }}
        </p>
      </div>
    </div>

    <!-- Asosiy amallar -->
    <div class="mt-3 grid grid-cols-2 gap-2">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-black bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 active:scale-95 transition-all"
        @click="$emit('message')"
      >
        <font-awesome-icon icon="fa-solid fa-comments" />
        Xabar yozish
      </button>
      <button
        type="button"
        class="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 active:scale-95 transition-all"
        @click="$emit('call')"
      >
        <font-awesome-icon icon="fa-solid fa-phone" />
        Telefon qilish
      </button>
    </div>

    <!-- Boshqaruv amallari -->
    <div class="mt-2 grid grid-cols-3 gap-2">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-black bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 active:scale-95 transition-all"
        @click="$emit('balance')"
      >
        <font-awesome-icon icon="fa-solid fa-wallet" />
        Balans
      </button>
      <button
        type="button"
        class="inline-flex items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-black bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 active:scale-95 transition-all"
        @click="$emit('tariff')"
      >
        <font-awesome-icon icon="fa-solid fa-key" />
        Tarif
      </button>
      <button
        type="button"
        class="inline-flex items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-black active:scale-95 transition-all border"
        :class="active
          ? 'bg-red-500/10 text-red-500 border-red-500/20'
          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'"
        @click="$emit('block')"
      >
        <font-awesome-icon :icon="active ? 'fa-solid fa-ban' : 'fa-solid fa-circle-check'" />
        {{ active ? 'Blok' : 'Faollashtir' }}
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
interface Props {
  name: string
  phone: string
  avatar?: string
  userId?: string
  active?: boolean
  listenGroups?: boolean
  balance?: number
  tariffLine?: string
  registeredAt?: string
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  active: true,
  listenGroups: false,
  balance: 0,
  selected: false,
})

defineEmits<{
  toggle: []
  message: []
  call: []
  balance: []
  tariff: []
  block: []
  open: []
}>()

const { avatarUrl } = useMediaUrl()
const avatarBroken = ref(false)
watch(
  () => [props.avatar, props.userId],
  () => { avatarBroken.value = false }
)
const avatarSrc = computed(() =>
  avatarBroken.value ? undefined : avatarUrl(props.avatar, props.userId)
)

const formattedBalance = computed(() => (props.balance ?? 0).toLocaleString('ru-RU'))
</script>
