<template>
  <div class="relative group">
    <!-- Label Area -->
    <div class="flex justify-between items-center mb-1.5 px-1">
      <label for="smsInput" class="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
        {{ error ? '' : 'Tasdiqlash kodi' }}
      </label>
      <span v-if="error" class="text-[10px] font-black text-red-500 uppercase tracking-wider animate-pulse bg-red-500/10 px-2 py-0.5 rounded-full">
        {{ error }}
      </span>
    </div>

    <!-- Input Container -->
    <div 
      class="relative flex items-center transition-all duration-300 rounded-2xl border shadow-sm overflow-hidden"
      :class="[
        error 
          ? 'border-red-500/40 ring-4 ring-red-500/5 bg-red-500/5' 
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus-within:border-sky-500/60 focus-within:ring-4 focus-within:ring-sky-500/10'
      ]"
    >
      <!-- Icon Left -->
      <div class="pl-4 pr-3 text-slate-400 dark:text-slate-600 transition-colors group-focus-within:text-sky-500">
        <font-awesome-icon icon="fa-solid fa-lock" class="text-sm" />
      </div>

      <!-- Input Field -->
      <input
        ref="inputRef"
        id="smsInput"
        type="text"
        inputmode="numeric"
        v-model="rawCode"
        placeholder="• • • •"
        maxlength="6"
        class="w-full py-4 pr-4 bg-transparent outline-none text-slate-900 dark:text-slate-100 font-black text-xl placeholder:text-slate-200 dark:placeholder:text-slate-900 tracking-[0.4em] selection:bg-sky-500/20"
        @input="handleInput"
        @keydown="restrictInput"
        :disabled="disabled"
      />

      <!-- Right Side Actions -->
      <div class="pr-4 flex items-center gap-2">
        <transition name="fade">
          <font-awesome-icon 
            v-if="loading" 
            icon="fa-solid fa-spinner" 
            spin 
            class="text-sky-500 w-4 h-4" 
          />
        </transition>
        
        <transition name="pop">
          <button 
            v-if="!loading && rawCode.length >= 4"
            @click="handleSubmit"
            type="button"
            :disabled="disabled"
            class="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all duration-300 disabled:opacity-30 active:scale-90"
          >
            <font-awesome-icon icon="fa-solid fa-paper-plane" class="text-xs" />
          </button>
        </transition>
      </div>

      <!-- Inner Glow/Shadow for Dark Mode -->
      <div class="absolute inset-0 pointer-events-none rounded-2xl shadow-inner dark:opacity-20"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'

const props = defineProps<{
    modelValue: string | null
    disabled?: boolean
    loading?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | null): void
    (e: 'submit', value: string): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const error = ref('')
const rawCode = ref(props.modelValue || '')

watch(() => props.modelValue, (val) => {
    if (val !== null) {
        rawCode.value = val.replace(/\D/g, "")
    }
})

const restrictInput = (event: KeyboardEvent) => {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter']
    if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
        event.preventDefault()
    }
    if (event.key === 'Enter') {
        handleSubmit()
    }
}

const handleInput = () => {
    const digits = rawCode.value.replace(/\D/g, '')
    rawCode.value = digits
    emit("update:modelValue", digits)
    error.value = ''
}

const handleSubmit = () => {
    if (rawCode.value.length >= 4) {
        emit("submit", rawCode.value)
        error.value = ""
    } else {
        error.value = "Kod juda qisqa"
    }
}

onMounted(() => {
    nextTick(() => {
        inputRef.value?.focus()
    })
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.pop-enter-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.pop-leave-active {
  transition: all 0.2s cubic-bezier(0.6, -0.28, 0.735, 0.045);
}
.pop-enter-from, .pop-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>
