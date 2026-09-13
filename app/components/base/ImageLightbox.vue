<template>
  <Teleport to="body">
    <Transition name="zt-img-lightbox-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[9999] bg-black/92 flex items-center justify-center p-4"
        @click.self="close"
      >
        <button
          type="button"
          class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center active:scale-95"
          aria-label="Yopish"
          @click="close"
        >
          <font-awesome-icon icon="fa-solid fa-times" />
        </button>
        <img
          v-if="src"
          :src="src"
          :alt="alt"
          class="max-w-[min(100vw-2rem,1400px)] max-h-[min(100vh-4rem,90vh)] w-auto h-auto object-contain rounded-2xl shadow-2xl"
        >
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    src?: string
    alt?: string
  }>(),
  { alt: 'Rasm' },
)

const open = defineModel<boolean>({ default: false })

const close = () => {
  open.value = false
}

useHistoryBackClose(open, close, { key: 'ztImageLightbox' })
</script>

<style scoped>
.zt-img-lightbox-fade-enter-active,
.zt-img-lightbox-fade-leave-active {
  transition: opacity 0.2s ease;
}
.zt-img-lightbox-fade-enter-from,
.zt-img-lightbox-fade-leave-to {
  opacity: 0;
}
</style>
