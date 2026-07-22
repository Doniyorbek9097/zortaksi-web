<template>
  <div
    class="flex items-center gap-3 px-4 py-3 transition-colors"
    :class="active ? 'bg-emerald-500/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'"
  >
    <!-- Butun qatorni bosilganda shu accountga almashadi -->
    <button type="button" class="flex items-center gap-3 flex-1 min-w-0 text-left" @click="$emit('select')">
      <ProfileAvatar :name="name" :src="avatar" :user-id="userId" size="sm" />

      <div class="flex-1 min-w-0">
        <p class="text-sm font-black text-slate-900 dark:text-white truncate">{{ name }}</p>
        <p class="text-[12px] font-medium text-slate-400 dark:text-slate-500 truncate">{{ phone }}</p>
      </div>
    </button>

    <!-- Faol belgisi -->
    <span
      v-if="active"
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wide shrink-0"
    >
      <font-awesome-icon icon="fa-solid fa-check" class="text-[9px]" />
      Faol
    </span>

    <!-- O'chirish -->
    <button
      type="button"
      class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
      aria-label="O'chirish"
      @click="$emit('delete')"
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
