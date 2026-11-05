<template>
  <section
    class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
  >
    <div
      class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 dark:from-rose-950/30 dark:via-orange-950/20 dark:to-amber-950/20"
    >
      <p class="text-[13px] font-black text-slate-800 dark:text-slate-100">
        {{ editing ? 'Realni tahrirlash' : 'Yangi real' }}
      </p>
      <p class="text-[10px] font-bold text-slate-500">Video + mahsulot havolasi</p>
    </div>

    <div class="p-4 space-y-3">
      <BaseInput
        :model-value="modelValue.title"
        label="Mahsulot nomi (ixtiyoriy)"
        placeholder="Masalan: Shampun"
        @update:model-value="patch('title', $event)"
      />

      <BaseInput
        :model-value="modelValue.productPrice"
        label="Narxi (ixtiyoriy)"
        placeholder="Masalan: 45 000 so'm"
        @update:model-value="patch('productPrice', formFieldString($event))"
      />

      <div>
        <BaseInput
          :model-value="modelValue.ctaLabel"
          label="Tugma matni"
          placeholder="Masalan: Batafsil"
          :maxlength="REAL_AD_CTA_MAX_LENGTH"
          @update:model-value="patch('ctaLabel', formFieldString($event))"
        />
        <div class="flex flex-wrap gap-1.5 mt-2">
          <button
            v-for="opt in REAL_AD_CTA_OPTIONS"
            :key="opt"
            type="button"
            class="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors"
            :class="modelValue.ctaLabel === opt
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-400'"
            @click="patch('ctaLabel', opt)"
          >
            {{ opt }}
          </button>
        </div>
      </div>

      <BaseInput
        :model-value="modelValue.productUrl"
        label="Havola (tashqi URL yoki ilova path)"
        placeholder="/driver/payment yoki https://example.com"
        @update:model-value="patch('productUrl', $event)"
      />

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
            class="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-[12px] font-black"
            :class="modelValue.active
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-slate-50 border-slate-200 text-slate-500'"
            @click="patch('active', !modelValue.active)"
          >
            <span>{{ modelValue.active ? 'Faol' : 'Yashirin' }}</span>
          </button>
        </div>
      </div>

      <div>
        <span class="px-1 text-xs">Video (MP4 / WebM)</span>
        <div
          class="mt-1 relative rounded-xl border-2 border-dashed overflow-hidden border-rose-200 dark:border-rose-800/50 bg-rose-50/40 dark:bg-rose-950/20 min-h-[140px]"
        >
          <video
            v-if="previewSrc"
            :src="previewSrc"
            class="w-full max-h-48 object-contain bg-black"
            controls
            playsinline
          />
          <div v-else class="h-36 flex flex-col items-center justify-center text-rose-500/80">
            <font-awesome-icon icon="fa-solid fa-clapperboard" class="text-2xl mb-2" />
            <p class="text-[11px] font-black">Video yuklash</p>
          </div>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            class="absolute inset-0 opacity-0 cursor-pointer"
            @change="onFileChange"
          >
        </div>
        <p class="mt-2 text-[10px] font-bold text-slate-400">Maks. 50 MB · vertikal video tavsiya etiladi</p>
      </div>

      <p v-if="error" class="text-[12px] font-bold text-red-500">{{ error }}</p>
      <p v-if="saved" class="text-[12px] font-bold text-emerald-500">Saqlandi ✓</p>

      <button
        type="button"
        class="w-full py-3.5 rounded-xl text-sm font-black text-white bg-gradient-to-r from-rose-500 to-orange-500 disabled:opacity-50"
        :disabled="saving"
        @click="$emit('submit')"
      >
        {{ saving ? 'Saqlanmoqda...' : editing ? 'Yangilash' : 'Qo\'shish' }}
      </button>
      <button
        v-if="editing"
        type="button"
        class="w-full py-2.5 text-[12px] font-bold text-slate-500"
        @click="$emit('cancel')"
      >
        Bekor qilish
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  REAL_AD_CTA_OPTIONS,
  DEFAULT_REAL_AD_CTA_LABEL,
  REAL_AD_CTA_MAX_LENGTH,
} from '~/constants/realAdCta'

export interface RealFormModel {
  title: string
  productPrice: string
  ctaLabel: string
  productUrl: string
  sortOrder: number
  active: boolean
}

const props = defineProps<{
  modelValue: RealFormModel
  editing?: boolean
  previewSrc?: string
  saving?: boolean
  error?: string
  saved?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: RealFormModel]
  submit: []
  cancel: []
  'file-change': [file: File | null]
}>()

const patch = <K extends keyof RealFormModel>(key: K, value: RealFormModel[K]) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const formFieldString = (v: string | number | null | undefined) => {
  if (v == null) return ''
  return String(v).trim()
}

const onFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0] || null
  emit('file-change', file)
}
</script>
