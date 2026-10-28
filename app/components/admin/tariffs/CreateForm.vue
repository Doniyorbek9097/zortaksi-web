<template>
  <component
    :is="embedded ? 'div' : 'section'"
    :class="embedded
      ? 'space-y-3'
      : 'rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3'"
  >
    <p
      v-if="!embedded"
      class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500"
    >
      Yangi tarif yaratish
    </p>

    <BaseInput
      :model-value="model.name"
      label="Nomi"
      placeholder="Oylik tarif"
      @update:model-value="patch('name', $event)"
    />

    <BaseInput
      :model-value="model.slug"
      label="Slug (komanda)"
      placeholder="oylik"
      @update:model-value="patch('slug', $event)"
    />
    <p class="px-1 text-[10px] text-slate-400 leading-snug">
      Admin komanda: <code class="font-mono">/{{ model.slug || 'oylik' }}</code>
    </p>

    <BaseInput
      :model-value="model.info"
      label="Tavsif"
      placeholder="30 kunlik buyurtmalar"
      @update:model-value="patch('info', $event)"
    />

    <div class="space-y-2">
      <p class="px-1 text-[11px] font-semibold text-slate-500">Xizmatlar</p>
      <label class="flex items-center gap-2.5 px-1 py-1.5 cursor-pointer">
        <input
          type="checkbox"
          class="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
          :checked="model.serviceBuyurtma"
          @change="patch('serviceBuyurtma', ($event.target as HTMLInputElement).checked)"
        />
        <span class="text-sm font-medium text-slate-700 dark:text-slate-200">
          Haydovchi (buyurtma olish)
        </span>
      </label>
      <label class="flex items-center gap-2.5 px-1 py-1.5 cursor-pointer">
        <input
          type="checkbox"
          class="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
          :checked="model.servicePost"
          @change="patch('servicePost', ($event.target as HTMLInputElement).checked)"
        />
        <span class="text-sm font-medium text-slate-700 dark:text-slate-200">
          E'lon tarqatish (avto)
        </span>
      </label>
      <p v-if="servicesError" class="px-1 text-[11px] font-semibold text-red-500">
        {{ servicesError }}
      </p>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <BaseInput
        :model-value="model.price"
        label="Narxi (so'm)"
        placeholder="0"
        type="number"
        :min="0"
        @update:model-value="patch('price', $event)"
      />
      <BaseInput
        :model-value="model.expireDays"
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
      @click="emit('cancel')"
    >
      Bekor qilish
    </button>
  </component>
</template>

<script setup lang="ts">
export interface TariffFormModel {
  name: string
  slug: string
  info: string
  price: number | null
  expireDays: number | null
  serviceBuyurtma: boolean
  servicePost: boolean
}

const model = defineModel<TariffFormModel>({ required: true })

withDefaults(
  defineProps<{
    editing?: boolean
    embedded?: boolean
  }>(),
  {
    editing: false,
    embedded: false,
  }
)

const emit = defineEmits<{
  submit: [value: TariffFormModel]
  cancel: []
}>()

const servicesError = ref('')

const patch = <K extends keyof TariffFormModel>(key: K, value: TariffFormModel[K]) => {
  servicesError.value = ''
  model.value = { ...model.value, [key]: value }
}

const onSubmit = () => {
  const { name, slug, price, expireDays, serviceBuyurtma, servicePost } = model.value
  if (!name.trim()) return
  if (!slug.trim()) return
  if (price == null || price < 0) return
  if (expireDays == null || expireDays < 1) return
  if (!serviceBuyurtma && !servicePost) {
    servicesError.value = 'Kamida bitta xizmatni tanlang'
    return
  }
  emit('submit', {
    ...model.value,
    name: name.trim(),
    slug: slug.trim(),
    price: Number(price),
    expireDays: Number(expireDays),
    serviceBuyurtma: !!serviceBuyurtma,
    servicePost: !!servicePost,
  })
}
</script>
