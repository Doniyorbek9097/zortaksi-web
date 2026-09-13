<template>
  <component
    :is="previewable && userId ? 'button' : 'div'"
    :type="previewable && userId ? 'button' : undefined"
    class="overflow-hidden flex items-center justify-center font-black text-white shrink-0"
    :class="[
      sizeClass,
      shapeClass,
      !showImg && colorClass,
      previewable && userId && 'cursor-pointer active:scale-95 transition-transform',
    ]"
    :aria-label="previewable && userId ? `${name} profilini ko'rish` : undefined"
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

</template>

<script setup lang="ts">
import { avatarColorClass, avatarInitial } from '~/utils/avatarPlaceholder'

interface Props {
  name: string
  src?: string
  /** Telegram userId — src bo'lmasa `/media/avatars/{id}.jpg` sinab ko'riladi */
  userId?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Guruhlar uchun kvadratroq avatar */
  shape?: 'circle' | 'rounded'
  /** Rasm ustiga bosilganda Telegram profil sahifasi */
  previewable?: boolean
  profileChatId?: string
  profileOrderId?: string
  profilePhone?: string
  profileUsername?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  shape: 'circle',
  previewable: false,
})

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
const initial = computed(() => avatarInitial(props.name))
const colorClass = computed(() => avatarColorClass(props.name))

const onError = () => {
  broken.value = true
}

const onClick = (e: MouseEvent) => {
  if (!props.previewable) return
  e.stopPropagation()
  openUserProfile({
    userId: props.userId,
    name: props.name,
    avatar: props.src,
    chatId: props.profileChatId,
    orderId: props.profileOrderId,
    phone: props.profilePhone,
    username: props.profileUsername,
  })
}
</script>
