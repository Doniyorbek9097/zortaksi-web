<template>
  <section
    class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
  >
    <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
      Yangi tarif yaratish
    </p>

    <BaseInput
      :model-value="modelValue.name"
      label="Nomi"
      placeholder="Oylik tarif"
      @update:model-value="patch('name', $event)"
    />

    <BaseInput
      :model-value="modelValue.info"
      label="Tavsif"
      placeholder="30 kunlik buyurtmalar"
      @update:model-value="patch('info', $event)"
    />

    <div class="grid grid-cols-2 gap-3">
      <BaseInput
        :model-value="modelValue.price"
        label="Narxi (so'm)"
        placeholder="0"
        type="number"
        :min="0"
        @update:model-value="patch('price', $event)"
      />
      <BaseInput
        :model-value="modelValue.expireDays"
        label="Muddat (kun)"
        placeholder="30"
        type="number"
        :min="1"
        @update:model-value="patch('expireDays', $event)"
      />
    </div>

    <button
      type="button"
      class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white bg-sky-500 hover:bg-sky-600 active:scale-[0.98] transition-all shadow-lg shadow-sky-500/25"
      @click="onSubmit"
    >
      <font-awesome-icon :icon="editing ? 'fa-solid fa-check' : 'fa-solid fa-plus'" />
      {{ editing ? 'Saqlash' : 'Yaratish' }}
    </button>

    <button
      v-if="editing"
      type="button"
      class="w-full py-2.5 rounded-xl text-[12px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      @click="$emit('cancel')"
    >
      Bekor qilish
    </button>
  </section>
</template>

<script setup lang="ts">
export interface TariffFormModel {
  name: string
  info: string
  price: number | null
  expireDays: number | null
}

const props = defineProps<{
  modelValue: TariffFormModel
  editing?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TariffFormModel]
  submit: []
  cancel: []
}>()

const patch = <K extends keyof TariffFormModel>(key: K, value: TariffFormModel[K]) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const onSubmit = () => {
  const { name, price, expireDays } = props.modelValue
  if (!name.trim()) return
  if (price == null || price < 0) return
  if (expireDays == null || expireDays < 1) return
  emit('submit')
}
</script>
