<template>
  <div v-if="chips.length" class="flex flex-wrap gap-1.5">
    <span
      v-for="chip in chips"
      :key="chip"
      class="inline-flex items-center gap-1 max-w-full pl-2 pr-0.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-400/30 dark:border-indigo-500/30"
    >
      <font-awesome-icon icon="fa-solid fa-location-dot" class="text-[10px] shrink-0 opacity-80" />
      <span class="truncate">{{ chip }}</span>
      <button
        type="button"
        class="w-5 h-5 rounded-full inline-flex items-center justify-center text-indigo-500/80 hover:bg-indigo-500/15 active:scale-95 shrink-0"
        :aria-label="`${chip} ni olib tashlash`"
        @click="$emit('remove', chip)"
      >
        <font-awesome-icon icon="fa-solid fa-times" class="text-[9px]" />
      </button>
    </span>
  </div>
</template>

<script setup lang="ts">
import { parseKeywords } from '~/utils/orderFilterKeywords'

const props = defineProps<{ keywords?: string }>()

defineEmits<{ remove: [chip: string] }>()

const chips = computed(() => parseKeywords(props.keywords || ''))
</script>
