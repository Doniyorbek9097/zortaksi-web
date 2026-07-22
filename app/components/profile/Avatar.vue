<template>
  <div
    class="rounded-full overflow-hidden flex items-center justify-center font-black text-white shrink-0"
    :class="[sizeClass, !src && colorClass]"
  >
    <img v-if="src" :src="src" :alt="name" class="w-full h-full object-cover" >
    <span v-else>{{ initial }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const sizeMap = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-14 h-14 text-lg',
}

const palette = [
  'bg-gradient-to-br from-pink-500 to-rose-500',
  'bg-gradient-to-br from-violet-500 to-indigo-500',
  'bg-gradient-to-br from-emerald-500 to-teal-500',
  'bg-gradient-to-br from-amber-500 to-orange-500',
  'bg-gradient-to-br from-sky-500 to-blue-500',
  'bg-gradient-to-br from-fuchsia-500 to-purple-500',
]

const sizeClass = computed(() => sizeMap[props.size])
const initial = computed(() => (props.name?.trim()?.[0] || '?').toUpperCase())
const colorClass = computed(() => {
  const code = (props.name || '?').charCodeAt(0) || 0
  return palette[code % palette.length]
})
</script>
