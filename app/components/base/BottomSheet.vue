<template>
  <teleport to="body">
    <transition name="bottom-sheet-fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end md:items-center md:justify-center backdrop-blur-[2px]"
        @click="requestClose">
        <div ref="sheet"
          class="w-full frame-color max-w-xl overflow-hidden text-gray-800 dark:text-gray-100 rounded-t-2xl md:rounded-2xl shadow-2xl border border-gray-200/40 dark:border-gray-700/40 transform-gpu transition-all duration-300 relative"
          :class="[
            isDesktop
              ? (isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0')
              : isOpen
                ? 'translate-y-0'
                : 'translate-y-full'
          ]" :style="!isDesktop ? { transform: `translateY(${translateY}px)` } : {}" @touchstart="startDrag"
          @touchmove="onDrag" @touchend="endDrag" @mousedown="startDrag" @mousemove="onDrag" @mouseup="endDrag"
          @click.stop>
          <slot />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
const { sheetOpened, sheetClosed, getTopIndex } = useBottomSheetCounter()
// const { $lenis } = useNuxtApp()

const props = defineProps({
  disableScrollSafe: { type: Boolean, default: false },
  isConfirm: { type: Boolean, default: false },
})

const emit = defineEmits([
  'before-close',
  'closed'
])

const isOpen = ref(false)
const translateY = ref(0)
const startY = ref(0)
const startX = ref(0)
const dragging = ref(false)
const isDesktop = ref(false)

/* ❗ har bir sheet o‘z indexini eslab qoladi */
let myIndex = 0

const checkScreen = () => {
  isDesktop.value = window.innerWidth >= 768
}

const open = () => {
  isOpen.value = true
}

const forceClose = () => {  
  if (!isOpen.value) return
  isOpen.value = false
  translateY.value = 0
  // $lenis?.start()
  document.body.style.overflow = '';
  sheetClosed()
  emit('closed')

  // Agar sheet state eng oxirgi bo‘lsa, uni tarixdan o‘chirish
  const state = history.state
  if (state && state.sheet) {
    history.back() // ❌ yoki history.replaceState({}, '')
  }
}



const requestClose = async () => {
  if (!isOpen.value) return

  // Agar confirm kerak bo'lsa
  if (props.isConfirm) {
    // Parent component orqali confirm chaqirish
    const ok = await new Promise(resolve => {
      emit('before-close', {
        close: (allowed = true) => resolve(allowed)
      })
    })

    if (!ok) return
  }

  // Confirm bo‘lmasa yoki ruxsat berilgan bo‘lsa
  forceClose()
}



const onPopState = () => {
  // ❗ faqat eng oxirgi ochilgan sheet yopiladi
  if (isOpen.value) {
    requestClose()
  }
}

onMounted(() => {
  checkScreen()
  window.addEventListener('resize', checkScreen)
  window.addEventListener('popstate', onPopState)

   watch(isOpen, (val) => {
    if (val) {
      // $lenis?.stop()
      document.body.style.overflow = 'hidden'

      myIndex = sheetOpened()
      history.pushState({ sheet: true }, '')
      window.dispatchEvent(new Event('zt-history-layer'))
    } else {
      // $lenis?.start()
      document.body.style.overflow = ''
    }
  })

})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreen)
  window.removeEventListener('popstate', onPopState)
   if (isOpen.value) {
    sheetClosed()
  }
  if (getTopIndex() === 0) {
    // $lenis?.start()
    document.body.style.overflow = ''
  }
})

/* ---------------- DRAG ---------------- */
const startDrag = (e) => {
  if (isDesktop.value) return
  dragging.value = true
  const touch = e.touches ? e.touches[0] : e
  startY.value = touch.clientY
  startX.value = touch.clientX
}

const onDrag = (e) => {
  if (!dragging.value || isDesktop.value || props.disableScrollSafe) return

  const touch = e.touches ? e.touches[0] : e
  const diffY = touch.clientY - startY.value
  const diffX = Math.abs(touch.clientX - startX.value)

  if (diffX > diffY) return
  e.preventDefault()

  if (diffY > 0) translateY.value = diffY
}

const endDrag = () => {
  if (!dragging.value || isDesktop.value) return
  dragging.value = false

  if (translateY.value > 100) requestClose()
  translateY.value = 0
}

defineExpose({
  open,
  close: requestClose,
  isOpen,
  forceClose,
})
</script>


<style scoped>
.bottom-sheet-fade-enter-active,
.bottom-sheet-fade-leave-active {
  transition: all 0.3s ease;
}

.bottom-sheet-fade-enter-from,
.bottom-sheet-fade-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* Desktop animatsiya */
@media (min-width: 768px) {

  .bottom-sheet-fade-enter-from,
  .bottom-sheet-fade-leave-to {
    transform: scale(0.9);
    opacity: 0;
  }

  .bottom-sheet-fade-enter-active,
  .bottom-sheet-fade-leave-active {
    transition: transform 0.25s ease, opacity 0.25s ease;
  }
}
</style>
