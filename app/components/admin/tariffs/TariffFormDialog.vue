<template>
  <Teleport to="body">
    <Transition name="cd-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-end justify-center md:items-center bg-black/40 dark:bg-black/70 backdrop-blur-sm"
        @click.self="close"
      >
        <Transition name="cd-sheet" appear>
          <div
            v-if="modelValue"
            class="w-full md:max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 md:p-6"
          >
            <div class="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">
                  {{ editing ? 'Tarifni tahrirlash' : 'Yangi tarif' }}
                </h3>
                <p class="mt-0.5 text-[11px] font-medium text-slate-400">
                  {{ kindLabel }}
                </p>
              </div>
              <button
                type="button"
                class="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
                aria-label="Yopish"
                @click="close"
              >
                <font-awesome-icon icon="fa-solid fa-times" />
              </button>
            </div>

            <AdminTariffsCreateForm
              v-model="formModel"
              embedded
              :editing="editing"
              :show-kind-select="showKindSelect"
              @submit="$emit('submit')"
              @cancel="close"
            />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { TariffFormModel } from '~/components/admin/tariffs/CreateForm.vue'
import type { TariffKind } from '~/stores/tariff.store'

const props = defineProps<{
  modelValue: boolean
  form: TariffFormModel
  editing?: boolean
  lockKind?: TariffKind | null
}>()

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  'update:form': [value: TariffFormModel]
  submit: []
  cancel: []
}>()

const formModel = computed({
  get: () => props.form,
  set: (v) => emit('update:form', v),
})

const showKindSelect = computed(() => props.editing === true)

const kindLabel = computed(() => {
  const k = props.lockKind || props.form.kind || 'driver'
  return k === 'driver_post' ? "E'lon tarqatish (avto)" : 'Haydovchi (buyurtma)'
})

const close = () => {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>
