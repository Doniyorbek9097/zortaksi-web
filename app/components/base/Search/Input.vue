<template>
  <div>
    <!-- Mobile & Tablet input always visible -->
    <form @submit.prevent="onEnter" class="block md:hidden">
      <label @click="openModal" class="relative flex items-center w-full">
        <span class="absolute z-10 left-3 pointer-events-none">
          <font-awesome-icon icon="fa-solid fa-search" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </span>

        <div class="relative w-full">
          <input ref="inputRef" type="text" readonly :value="search"
            class="w-full pl-10 pr-10 py-2 rounded-lg button-color cursor-pointer outline-none" />

          <!-- Placeholder -->
          <span v-if="!search" class="absolute left-10 top-1/2 -translate-y-1/2
    text-gray-400 dark:text-gray-500
    pointer-events-none
    text-sm">
            <i>{{ placeholderText }}</i>
          </span>
        </div>
      </label>
    </form>

    <!-- Fullscreen modal on focus (mobile/tablet) -->
    <transition name="slide-up">
      <div v-if="isFocused" class="md:hidden fixed inset-0 z-50 flex flex-col gap-2 body-color">
        <header class="flex flex-col gap-4 w-full frame-color p-2.5 rounded-b-xl">
          <section class="flex gap-4 items-center w-full">
            <font-awesome-icon icon="fa-solid fa-arrow-left" @click="blurInput" class="w-5 h-5 text-black dark:text-white cursor-pointer" />

            <div class="relative flex-1">
              <label class="relative flex items-center w-full">
                <span class="absolute left-3 pointer-events-none">
                  <font-awesome-icon icon="fa-solid fa-search" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </span>

                <input ref="inputRef" type="text" placeholder="Mahsulot qidirish" :value="search" @input="onInput"
                  @keydown.enter.prevent="onEnter" @keyup.esc="clear" autofocus
                  class="w-full pl-10 pr-10 py-2 rounded-lg placeholder:text-sm button-color outline-none duration-150" />
              </label>
              <button v-if="search" @click="clear"
                class="absolute right-0 top-0 h-full w-10 flex items-center justify-center">
                <!-- 🔄 Loading spinner -->
                <font-awesome-icon v-if="loading" icon="fa-solid fa-spinner" spin class="w-4 h-4 text-gray-500" />

                <!-- ❌ Clear icon -->
                <font-awesome-icon v-else icon="fa-solid fa-times" class="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-red-500 transition" />
              </button>

            </div>
          </section>

        </header>


        <section v-if="!filterSuggestions.length && savedSuggestions.length"
          class="flex flex-col gap-5 frame-color p-3 rounded-2xl">
          <div class="flex justify-between items-center">
            <p class="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400">QIDIRUV TARIXI</p>
            <button @click="searchStore.clearSavedSuggestion"
              class="text-blue-500 text-xs font-semibold tracking-wide">TOZALASH</button>
          </div>
          <div class="flex flex-wrap gap-2">
            <div v-for="(item, index) in savedSuggestions" :key="index"
              class="flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <span class="mr-2 cursor-pointer" @click="searchStore.selectItem(item)">
                {{ item }}
              </span>
              <button @click.stop="searchStore.removeSavedSuggestion(item)"
                class="w-4 h-4 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="O‘chirish">
                <font-awesome-icon icon="fa-solid fa-times" class="w-4 h-4 cursor-pointer" />
              </button>
            </div>
          </div>
        </section>

        <div v-if="filterSuggestions.length" class="flex flex-col  rounded-2xl frame-color
         shadow-sm border border-gray-100 dark:border-gray-800
         overflow-hidden">
          <!-- Header -->
          <div class="px-4 py-2 flex items-center justify-between">
            <p class="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400">
              O‘XSHASH SO‘ZLAR
            </p>
          </div>

          <!-- List -->
          <div class="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
            <div v-for="(item, index) in filterSuggestions" :key="index" @click="searchStore.selectItem(item.name)"
              :class="[{
                'button-color': item.isSelected
              }, 'group flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200 active:button-color']">
              <!-- Text -->
              <span class="truncate text-sm font-medium
               text-gray-800 dark:text-gray-200
               group-hover:text-primary-600 dark:group-hover:text-primary-400">
                {{ item.name }}
              </span>

              <!-- Icon -->
              <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-4 h-4 text-gray-400 dark:text-gray-500
               transition-transform duration-200
               group-hover:translate-x-1
               group-hover:text-primary-500" />
            </div>
          </div>
        </div>


      </div>
    </transition>

    <!-- Desktop input -->
    <div v-if="isFocused" @click="isFocused = false" class="bg-black/30 fixed top-0 left-0 z-10 w-full h-screen"></div>
    <section class="hidden md:block relative z-50">
      <form @submit.prevent="onEnter" class="relative flex items-center gap-2 rounded-xl
  bg-white dark:bg-zinc-900
  border border-zinc-200 dark:border-zinc-700
  shadow-sm
  focus-within:ring-2 focus-within:ring-blue-500
  transition overflow-hidden">

        <button type="submit" class="button-color flex flex-nowrap items-center gap-2 p-2.5 rounded-md">
          <!-- search icon -->
          <font-awesome-icon icon="fa-solid fa-search" class="w-4 h-4 text-gray-500 dark:text-gray-400 transition focus-within:text-blue-500" />

          <!-- search text -->
          <span class="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Qidirish
          </span>
        </button>

        <!-- input wrapper -->
        <div class="relative w-full">
          <input ref="inputRef" @focusin="isFocused = true" :value="search" @input="onInput"
            @keydown.enter.prevent="onEnter" @keyup.esc="clear" class="w-full px-2 py-1
      outline-none bg-transparent
      text-sm" />

          <!-- placeholder -->
          <span v-if="!search" class="absolute left-2 top-1/2 -translate-y-1/2
      text-gray-400 dark:text-gray-500
      pointer-events-none text-sm">
            {{ placeholderText }}
          </span>

        </div>

        <!-- clear / loading -->
        <button v-if="search" @click="clear" class="flex items-center justify-center w-8 h-8 rounded-lg
    hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">

          <!-- loading -->
          <font-awesome-icon v-if="loading" icon="fa-solid fa-spinner" spin class="w-4 h-4 text-gray-500" />

          <!-- clear -->
          <font-awesome-icon v-else icon="fa-solid fa-times" class="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-red-500 transition" />

        </button>

      </form>

      <!-- Fullscreen modal on focus (mobile/tablet) -->
      <transition name="dropdown">
        <div v-if="isFocused" class="max-md:hidden absolute mt-2 w-full z-50 flex flex-col gap-2">
          <section v-if="!filterSuggestions.length && savedSuggestions.length"
            class="flex flex-col gap-5 frame-color p-3 rounded-2xl">
            <div class="flex justify-between items-center">
              <p class="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400">QIDIRUV TARIXI</p>
              <button @click="searchStore.clearSavedSuggestion"
                class="text-blue-500 text-xs font-semibold tracking-wide">TOZALASH</button>
            </div>
            <div class="flex flex-wrap gap-2">
              <div v-for="(item, index) in searchStore.savedSuggestions" :key="index"
                class="flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                <span class="mr-2 cursor-pointer" @click="searchStore.selectItem(item)">
                  {{ item }}
                </span>
                <button @click.stop="searchStore.removeSavedSuggestion(item)"
                  class="w-4 h-4 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  aria-label="O‘chirish">
                  <font-awesome-icon icon="fa-solid fa-times" class="w-4 h-4 cursor-pointer" />
                </button>
              </div>
            </div>
          </section>

          <div v-if="filterSuggestions.length" class="flex flex-col  rounded-2xl frame-color
         shadow-sm border border-gray-100 dark:border-gray-800
         overflow-hidden">
            <!-- Header -->
            <div class="px-4 py-2 flex items-center justify-between">
              <p class="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400">
                O‘XSHASH SO‘ZLAR
              </p>
            </div>

            <!-- List -->
            <div class="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
              <div v-for="(item, index) in filterSuggestions" :key="index" @click="selectItem(item.name)"
                :class="[{
                  'button-color': item.isSelected
                }, 'group flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200 active:button-color']">
                <!-- Text -->
                <span class="truncate text-sm font-medium
               text-gray-800 dark:text-gray-200
               group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  {{ item.name }}
                </span>

                <!-- Icon -->
                <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-4 h-4 text-gray-400 dark:text-gray-500
               transition-transform duration-200
               group-hover:translate-x-1
               group-hover:text-primary-500" />
              </div>
            </div>
          </div>


        </div>
      </transition>
    </section>


  </div>
</template>


<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { storeToRefs, useCategoryStore, useSearchStore } from "#imports"
const searchStore = useSearchStore();
const { placeholderText, loading, filterSuggestions, savedSuggestions } = storeToRefs(searchStore);

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const search = ref("");


onMounted(() => {
  searchStore.startTyping();
})

const onBack = () => {
  if (isFocused.value) {
    isFocused.value = false
    document.body.style.overflow = '' // scrollni ochish
  }
}

onMounted(() => {
  // Back tugmasi listeneri
  window.addEventListener('popstate', onBack)

  // Ochiilganda pushState, yopilganda restore
  watch(isFocused, (val) => {
    if (val) {
      document.body.style.overflow = 'hidden'
      history.pushState(null, '')
    } else {
      document.body.style.overflow = ''
    }
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', onBack)
})


function onInput(e: Event) {
  search.value = (e.target as HTMLInputElement).value
  searchStore.getSuggestions(search.value)
}

function onEnter() {
  if(!search.value) return;
  isFocused.value = false
  searchStore.selectItem(search.value)
}

function selectItem(keyWord: string) {
  isFocused.value = false
  searchStore.selectItem(keyWord)
}

function clear() {
  searchStore.clear()
  inputRef.value?.focus()
}

function openModal() {
  isFocused.value = true
  nextTick(() => {
    // faqat mobile input fokus oladi
    inputRef.value?.focus()
  })
}

function blurInput() {
  isFocused.value = false
  inputRef.value?.blur()
}



</script>

<style>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.2s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0);
}


.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
