<template>
  <div class="relative group">
    <!-- Label / Error Area -->
    <div class="flex justify-between items-center mb-1.5 px-1">
      <label :for="id" class="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
        {{ error ? '' : label }}
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
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus-within:border-emerald-500/60 focus-within:ring-4 focus-within:ring-emerald-500/10'
      ]"
    >
      <!-- Icon Left -->
      <div class="pl-4 pr-3 text-slate-400 dark:text-slate-600 transition-colors group-focus-within:text-emerald-500">
        <font-awesome-icon :icon="['fas', 'lock']" class="text-sm" />
      </div>

      <!-- Input Field -->
      <input
        :id="id"
        ref="inputRef"
        :type="showPassword ? 'text' : 'password'"
        :value="modelValue"
        @input="handleInput"
        :placeholder="placeholder"
        class="w-full py-4 pr-12 bg-transparent outline-none text-slate-900 dark:text-slate-100 font-bold text-base placeholder:text-slate-300 dark:placeholder:text-slate-800 tracking-widest selection:bg-emerald-500/20"
        :disabled="disabled"
      />

      <!-- Right Side Actions (Toggle Visibility) -->
      <button 
        type="button"
        @click="showPassword = !showPassword"
        class="absolute right-4 text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400 transition-colors"
      >
        <font-awesome-icon :icon="['fas', showPassword ? 'eye-slash' : 'eye']" class="text-sm" />
      </button>

      <!-- Inner Glow/Shadow for Dark Mode -->
      <div class="absolute inset-0 pointer-events-none rounded-2xl shadow-inner dark:opacity-20"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Parol',
  placeholder: '••••••••',
  error: '',
  disabled: false,
  id: 'password-input'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const showPassword = ref(false)

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>
