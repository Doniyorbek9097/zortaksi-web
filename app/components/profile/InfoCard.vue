<template>
  <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 md:p-5">
    <!-- Identity -->
    <div class="flex items-start gap-3">
      <ProfileAvatar :name="name" :src="avatar" :user-id="userId" size="lg" />
      <div class="min-w-0">
        <p class="text-[10px] font-black uppercase tracking-wider text-emerald-500">
          {{ showBilling ? 'Faol hisob' : 'Profil' }}
        </p>
        <h2 class="text-lg font-black text-slate-900 dark:text-white truncate">{{ name }}</h2>
        <p class="text-[13px] font-medium text-slate-500 dark:text-slate-400">{{ phone }}</p>
        <span
          v-if="showBilling"
          class="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider"
          :class="active
            ? 'bg-emerald-500/10 text-emerald-500'
            : 'bg-red-500/10 text-red-500'"
        >
          {{ active ? 'Faol' : 'Faol emas' }}
        </span>
      </div>
    </div>

    <template v-if="showBilling">
      <div class="my-4 border-t border-slate-100 dark:border-slate-800" />

      <!-- Balance / Tariff -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Balans</p>
          <p class="text-lg font-black text-blue-600 dark:text-blue-400">{{ formattedBalance }}</p>
          <button
            v-if="!active"
            type="button"
            class="text-[11px] font-bold text-amber-500 hover:underline"
            @click="$emit('topup')"
          >
            Hisobni to'ldirish
          </button>
        </div>
        <div>
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tarif</p>
          <p class="text-lg font-black text-violet-600 dark:text-violet-400 truncate">{{ tariffName }}</p>
          <button
            v-if="!active"
            type="button"
            class="text-[11px] font-bold text-amber-500 hover:underline"
            @click="$emit('buy')"
          >
            Sotib olish
          </button>
        </div>
      </div>

      <!-- Keywords -->
      <div class="mt-4">
        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Qidiruv kalit so'zlari</p>
        <p class="text-[13px] font-medium text-slate-600 dark:text-slate-300">Buyurtmalar sahifasida sozlang</p>
      </div>

      <button
        v-if="active"
        type="button"
        class="mt-4 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30 active:scale-[0.98] transition-all"
        @click="$emit('topup')"
      >
        <font-awesome-icon icon="fa-solid fa-wallet" />
        Hisobni to'ldirish
      </button>
      <button
        v-else
        type="button"
        class="mt-4 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30 active:scale-[0.98] transition-all"
        @click="$emit('buy')"
      >
        <font-awesome-icon icon="fa-solid fa-wallet" />
        Tarif sotib olish
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name?: string
  phone?: string
  avatar?: string
  userId?: string
  active?: boolean
  balance?: number
  tariffName?: string
  /** Admin — balans/tarif ko'rsatilmaydi */
  showBilling?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  name: 'Foydalanuvchi',
  phone: '',
  active: false,
  balance: 0,
  tariffName: 'Kunlik sinov',
  showBilling: true,
})

defineEmits<{ topup: []; buy: [] }>()

const formattedBalance = computed(() => props.balance.toLocaleString('ru-RU'))
</script>
