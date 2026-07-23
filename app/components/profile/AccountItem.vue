<template>
  <div
    class="flex items-center gap-3 px-4 py-3 transition-colors"
    :class="active ? 'bg-emerald-500/5' : 'active:bg-slate-50 dark:active:bg-slate-800/40'"
  >
    <!-- Butun qator — hisobga almashish (mobil touch uchun katta zona) -->
    <button
      type="button"
      class="flex items-center gap-3 flex-1 min-w-0 text-left touch-manipulation py-0.5"
      @click.stop="$emit('select')"
    >
      <ProfileAvatar :name="name" :src="avatar" :user-id="userId" size="sm" />

      <div class="flex-1 min-w-0">
        <p class="text-sm font-black text-slate-900 dark:text-white truncate">{{ name }}</p>
        <p class="text-[12px] font-medium text-slate-400 dark:text-slate-500 truncate">{{ phone }}</p>
      </div>

      <span
        v-if="active"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wide shrink-0"
      >
        <font-awesome-icon icon="fa-solid fa-check" class="text-[9px]" />
        Faol
      </span>
    </button>

    <button
      type="button"
      class="w-10 h-10 -mr-1 rounded-lg flex items-center justify-center text-slate-400 active:text-red-500 active:bg-red-500/10 transition-colors shrink-0 touch-manipulation"
      aria-label="O'chirish"
      @click.stop="$emit('delete')"
    >
      <font-awesome-icon icon="fa-solid fa-trash" class="text-sm" />
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
  phone: string
  avatar?: string
  userId?: string
  active?: boolean
}

defineProps<Props>()
defineEmits<{ select: []; delete: [] }>()
</script>
