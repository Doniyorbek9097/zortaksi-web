<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" @click.self="close"
        class="fixed inset-0 z-[9999] backdrop-blur-sm flex items-center justify-center">
        <transition name="pop">
          <div v-show="isOpen" :style="{ transform: `translateY(${translateY}px)` }" :class="[
            'relative flex flex-col overflow-hidden transition-all',
            isDesktop
              ? 'w-[900px] max-h-[90vh] rounded-2xl shadow-2xl bg-black'
              : 'w-full min-h-[100dvh] max-h-[100dvh]'
          ]" @touchstart="startDrag" @touchmove="onDrag" @touchend="endDrag">
            <!-- 🎥 VIDEO -->
            <video ref="videoRef" :src="videoUrl" playsinline autoplay
              :class="isFullscreen ? 'h-[100dvh] object-cover' : 'h-auto object-contain'"
              class="w-full flex-1  aspect-video object-contain frame-color" @timeupdate="onTimeUpdate"
              @loadedmetadata="onLoaded" @click="togglePlay" />

            <!-- PLAY / PAUSE BUTTON -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <button v-show="isPlaying || pauseVisible" @click.stop="togglePlay" class="pointer-events-auto w-20 h-20 rounded-full
           bg-black/60 backdrop-blur
           flex items-center justify-center
           shadow-2xl
           hover:scale-110 active:scale-95
           transition-all duration-200">
                <i :class="!isPlaying ? 'mdi mdi-pause' : 'mdi mdi-play'" class="text-white text-4xl"></i>
              </button>
            </div>

            <!-- 🎚 CONTROLS -->
            <div v-show="!isDesktop || (isPlaying || pauseVisible)"
              class="lg:absolute bottom-0 z-20 w-full space-y-2 bg-gradient-to-t bg-white dark:bg-black p-2 from-white/50 dark:from-black/50 to-transparent"
              :class="[
                isDesktop ? 'absolute bottom-0' : 'relative',
                isFullscreen ? 'bg-transparent' : ''
              ]">

              <!-- Slider -->
              <div class="flex flex-nowrap items-center justify-center gap-2 w-full">
                <span class="flex flex-nowrap font-bold">{{ formatTime(currentTime) }}</span>
                <input type="range" min="0" :max="duration" step="0.1" v-model="currentTime" @input="seek"
                  class="w-full h-2 rounded-lg bg-gray-300 dark:bg-gray-700 accent-pink-500 appearance-none" />
                <span class="flex flex-nowrap font-bold">{{ formatTime(duration) }}</span>
              </div>

              <!-- buttons row -->
              <div class="flex flex-nowrap gap-5 items-center justify-center text-white">
                <!-- Mute -->
                <button @click="toggleMute" class="w-12 h-12 rounded-xl
           bg-gray-500/60 backdrop-blur
           flex items-center justify-center
           transition">
                  <i :class="muted ? 'mdi mdi-volume-off' : 'mdi mdi-volume-high'" class="text-xl"></i>
                </button>

                <!-- Close -->
                <button @click="close" class="w-12 h-12 rounded-xl
           bg-gray-500/60 backdrop-blur
           flex items-center justify-center
           transition">
                  <i class="mdi mdi-close text-xl"></i>
                </button>

                <!-- Fullscreen -->
                <button @click="toggleFullscreen" class="w-12 h-12 rounded-xl
            bg-gray-500/60 backdrop-blur
           flex items-center justify-center
           transition">
                  <i class="text-xl" :class="[!isFullscreen ? 'mdi mdi-fullscreen' : 'mdi mdi-fullscreen-exit']"></i>
                </button>
              </div>

            </div>

          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  videoUrl: { type: String, required: true },
});

const isDesktop = ref(false);
const videoRef = ref(null);
const isPlaying = ref(false);
const muted = ref(false);
const duration = ref(0);
const currentTime = ref(0);
const pauseVisible = ref(false);
let pauseTimeout = null;
const isFullscreen = ref(false);

/* Modal */
const isOpen = ref(false);
const translateY = ref(0);
const dragging = ref(false);
const startY = ref(0);
const startX = ref(0);

watch(isDesktop, (val) => isFullscreen.value = !val, { immediate: true });

onMounted(() => {
  const checkWidth = () => (isDesktop.value = window.innerWidth >= 768);
  window.addEventListener("resize", checkWidth);
  checkWidth();
});

/* Video */
const togglePlay = () => {
  if (!videoRef.value) return;

  if (videoRef.value.paused) {
    videoRef.value.play();
    isPlaying.value = false;
  } else {
    videoRef.value.pause();
    isPlaying.value = true;
  }

  // Pause icon 2s ko'rinishi
  pauseVisible.value = true;
  if (pauseTimeout) clearTimeout(pauseTimeout);
  pauseTimeout = setTimeout(() => {
    pauseVisible.value = false;
  }, 2000);
};


const toggleMute = () => {
  muted.value = !muted.value;
  videoRef.value.muted = muted.value;
};

const onLoaded = () => {
  if (!videoRef.value) return;
  duration.value = videoRef.value.duration;
};

const onTimeUpdate = () => {
  if (!videoRef.value) return;
  currentTime.value = videoRef.value.currentTime;
};

const seek = () => {
  if (!videoRef.value) return;
  videoRef.value.currentTime = currentTime.value;
};


const toggleFullscreen = async () => {
  isFullscreen.value = !isFullscreen.value;
}


/* Utils */
const formatTime = (t) => {
  if (!t) return "00:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};



/* ------------------------------ */
/*            Modal               */
/* ------------------------------ */

const open = () => {
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
  document.body.style.overflow = "";
  history.back();
};

/* ---- BACK bosilganda modal yopish ---- */
const onBack = () => {
  if (isOpen.value) {
    isOpen.value = false;
    document.body.style.overflow = "";
  }
};

/* ---- PushState + Body scroll lock ---- */
onMounted(() => {
  window.addEventListener("popstate", onBack);

  watch(isOpen, (val) => {
    if (val) {
      document.body.style.overflow = "hidden";
      const url = window.location.pathname + window.location.search + window.location.hash;
      history.pushState(null, "", url);
    } else {
      document.body.style.overflow = "";
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("popstate", onBack);
});

/* ------------------------------ */
/*           Drag Close           */
/* ------------------------------ */
const startDrag = (e) => {

  dragging.value = true;
  const t = e.touches[0];
  startY.value = t.clientY;
  startX.value = t.clientX;
};

const onDrag = (e) => {

  const t = e.touches[0];
  const diffY = t.clientY - startY.value;
  const diffX = Math.abs(t.clientX - startX.value);

  if (diffX > diffY) return;

  e.preventDefault();

  if (diffY > 0) translateY.value = diffY;
};

const endDrag = () => {
  if (!dragging.value) return;

  dragging.value = false;

  if (translateY.value > 120) close();

  translateY.value = 0;
};

defineExpose({ open, close, isOpen });

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.pop-enter-active {
  transition: all 0.25s ease;
}

.pop-enter-from {
  transform: scale(0.92);
  opacity: 0;
}

:fullscreen video {
  height: 100vh;
  width: 100vw;
  object-fit: contain;
}

:-webkit-full-screen video {
  height: 100vh;
  width: 100vw;
  object-fit: contain;
}


/* Pulse animatsiya play tugmasi uchun */
.animate-pulse {
  animation: pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.7;
  }

  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

/* Fade animatsiya pause icon uchun */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
