<template>
  <component
    :is="previewable && showImg ? 'button' : 'div'"
    :type="previewable && showImg ? 'button' : undefined"
    class="overflow-hidden flex items-center justify-center font-black text-white shrink-0"
    :class="[
      sizeClass,
      shapeClass,
      !showImg && colorClass,
      previewable && showImg && 'cursor-zoom-in active:scale-95 transition-transform',
    ]"
    :aria-label="previewable && showImg ? `${name} rasmini ko'rish` : undefined"
    @click="onClick"
  >
    <img
      v-if="showImg"
      :src="resolvedSrc"
      :alt="name"
      loading="lazy"
      decoding="async"
      class="w-full h-full object-cover pointer-events-none"
      @error="onError"
    >
    <span v-else>{{ initial }}</span>
  </component>

  <BaseImageLightbox
    v-if="previewable"
    v-model="lightboxOpen"
    :src="resolvedSrc"
    :alt="name"
  />
</template>

<script setup lang="ts">
interface Props {
  name: string
  src?: string
  /** Telegram userId — src bo'lmasa `/media/avatars/{id}.jpg` sinab ko'riladi */
  userId?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Guruhlar uchun kvadratroq avatar */
  shape?: 'circle' | 'rounded'
  /** Rasm ustiga bosilganda katta ko'rinish */
  previewable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  shape: 'circle',
  previewable: false,
})

const lightboxOpen = ref(false)

const { avatarUrl } = useMediaUrl()
const broken = ref(false)

watch(
  () => [props.src, props.userId],
  () => {
    broken.value = false
  }
)

const resolvedSrc = computed(() => {
  if (broken.value) return undefined
  return avatarUrl(props.src, props.userId)
})

const showImg = computed(() => !!resolvedSrc.value)

const sizeMap = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-16 h-16 text-xl',
}

const sizeClass = computed(() => sizeMap[props.size])
const shapeClass = computed(() =>
  props.shape === 'rounded' ? 'rounded-2xl' : 'rounded-full'
)
const initial = computed(() => (props.name?.trim()?.[0] || '?').toUpperCase())
const colorClass = computed(() => {
  const code = (props.name || '?').charCodeAt(0) || 0
  const palette = [
    'bg-gradient-to-br from-pink-500 to-rose-500',
    'bg-gradient-to-br from-violet-500 to-indigo-500',
    'bg-gradient-to-br from-emerald-500 to-teal-500',
    'bg-gradient-to-br from-amber-500 to-orange-500',
    'bg-gradient-to-br from-sky-500 to-blue-500',
    'bg-gradient-to-br from-fuchsia-500 to-purple-500',
  ]
  return palette[code % palette.length]
})

const onError = () => {
  broken.value = true
}

const onClick = (e: MouseEvent) => {
  if (!props.previewable || !showImg.value) return
  e.stopPropagation()
  lightboxOpen.value = true
}
</script>
