<template>
  <section
    class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
  >
    <div
      class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-pink-50 dark:from-violet-950/30 dark:via-fuchsia-950/20 dark:to-pink-950/20"
    >
      <div class="flex items-center gap-2.5">
        <div
          class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-xs shadow-sm"
        >
          <font-awesome-icon :icon="editing ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-plus'" />
        </div>
        <div>
          <p class="text-[13px] font-black text-slate-800 dark:text-slate-100">
            {{ editing ? 'Bannerni tahrirlash' : 'Yangi banner' }}
          </p>
          <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400">
            Nom, havola va rasm yuklang
          </p>
        </div>
      </div>
    </div>

    <div class="p-4 space-y-3">
      <BaseInput
        :model-value="modelValue.name"
        label="Banner nomi"
        placeholder="Masalan: Bonus aksiyasi"
        @update:model-value="patch('name', $event)"
      />

      <BaseInput
        :model-value="modelValue.targetUrl"
        label="URL yoki sahifa"
        placeholder="https://example.com yoki /driver/bonus"
        @update:model-value="patch('targetUrl', $event)"
      />
      <p class="px-1 text-[10px] font-semibold text-slate-400 leading-snug">
        Tashqi sayt yoki ilova yo'li.
        <span class="text-slate-500">Bo'sh — bosilganda hech narsa bo'lmaydi.</span>
      </p>

      <div class="grid grid-cols-2 gap-3">
        <BaseInput
          :model-value="modelValue.sortOrder"
          label="Tartib"
          type="number"
          :min="0"
          @update:model-value="patch('sortOrder', Number($event) || 0)"
        />
        <div class="flex flex-col justify-end pb-1">
          <span class="px-1 text-xs mb-1">Holat</span>
          <button
            type="button"
            class="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-[12px] font-black transition-all active:scale-[0.98]"
            :class="modelValue.active
              ? 'bg-emerald-50 dark:bg-emerald-950/35 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'"
            @click="patch('active', !modelValue.active)"
          >
            <span>{{ modelValue.active ? 'Faol' : 'Yashirin' }}</span>
            <span
              class="w-9 h-5 rounded-full relative transition-colors"
              :class="modelValue.active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'"
            >
              <span
                class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                :class="modelValue.active ? 'left-[18px]' : 'left-0.5'"
              />
            </span>
          </button>
        </div>
      </div>

      <div>
        <span class="px-1 text-xs">Rasm</span>
        <div
          class="mt-1 relative rounded-xl border-2 border-dashed overflow-hidden transition-colors"
          :class="previewSrc
            ? 'border-violet-300 dark:border-violet-700'
            : 'border-violet-200/80 dark:border-violet-800/50 bg-violet-50/50 dark:bg-violet-950/20'"
        >
          <div v-if="previewSrc" class="aspect-[3/1] w-full relative group">
            <img :src="previewSrc" alt="Banner preview" class="w-full h-full object-cover">
            <div
              class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <span class="text-white text-[11px] font-black px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                Rasmni almashtirish
              </span>
            </div>
          </div>
          <div
            v-else
            class="aspect-[3/1] flex flex-col items-center justify-center gap-2 text-violet-500/80 dark:text-violet-400/80"
          >
            <div class="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <font-awesome-icon icon="fa-solid fa-image" class="text-lg" />
            </div>
            <p class="text-[11px] font-black">Rasm yuklash uchun bosing</p>
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="absolute inset-0 opacity-0 cursor-pointer"
            @change="onFileChange"
          >
        </div>
        <div
          class="mt-2 rounded-xl px-3 py-2 bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50"
        >
          <p class="text-[10px] font-bold text-sky-700 dark:text-sky-300 leading-relaxed">
            <font-awesome-icon icon="fa-solid fa-image" class="mr-1 opacity-70" />
            Tavsiya:
            <span class="font-black">1200×400 px</span>
            (3:1) · JPG/PNG/WebP · maks. 2 MB
          </p>
        </div>
      </div>

      <p v-if="error" class="text-[12px] font-bold text-red-500 px-1">{{ error }}</p>
      <p v-if="saved" class="text-[12px] font-bold text-emerald-500 px-1">Saqlandi ✓</p>

      <button
        type="button"
        class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 active:scale-[0.98] transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50"
        :disabled="saving"
        @click="$emit('submit')"
      >
        <font-awesome-icon
          :icon="saving ? 'fa-solid fa-spinner' : editing ? 'fa-solid fa-check' : 'fa-solid fa-plus'"
          :class="{ 'animate-spin': saving }"
        />
        {{ saving ? 'Saqlanmoqda...' : editing ? 'Yangilash' : 'Qo\'shish' }}
      </button>

      <button
        v-if="editing"
        type="button"
        class="w-full py-2.5 rounded-xl text-[12px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        @click="$emit('cancel')"
      >
        Bekor qilish
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
export interface BannerFormModel {
  name: string
  targetUrl: string
  sortOrder: number
  active: boolean
}

const props = defineProps<{
  modelValue: BannerFormModel
  editing?: boolean
  previewSrc?: string
  saving?: boolean
  error?: string
  saved?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: BannerFormModel]
  submit: []
  cancel: []
  'file-change': [file: File | null]
}>()

const patch = <K extends keyof BannerFormModel>(key: K, value: BannerFormModel[K]) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const onFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0] || null
  emit('file-change', file)
}
</script>
