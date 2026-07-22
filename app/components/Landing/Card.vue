<template>
  <div
    class="relative rounded-2xl p-6 border transition duration-300 group"
    :class="[
      hoverEffect ? 'hover:-translate-y-1 hover:border-emerald-400 dark:hover:border-emerald-500/60' : '',
      variant === 'white' ? 'bg-white dark:bg-neutral-800' : 'bg-neutral-50 dark:bg-neutral-900',
      'border-neutral-200 dark:border-neutral-800'
    ]"
  >
    <div 
      v-if="icon || number" 
      class="rounded-xl flex items-center justify-center transition"
      :class="[
        number ? 'absolute -top-4 left-5 w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-black shadow-lg text-sm z-10' : 
                 'w-12 h-12 text-2xl mb-4 group-hover:scale-110 ' + iconBg
      ]"
    >
      {{ icon || number }}
    </div>
    
    <div :class="{ 'pt-10': number }">
      <h3 :class="[titleClass || 'text-lg font-bold mb-2']">
        {{ title }}
      </h3>
      <p class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
  icon?: string
  iconBg?: string
  number?: number | string
  hoverEffect?: boolean
  variant?: 'white' | 'neutral'
  titleClass?: string
}

withDefaults(defineProps<Props>(), {
  hoverEffect: false,
  variant: 'neutral'
})
</script>
