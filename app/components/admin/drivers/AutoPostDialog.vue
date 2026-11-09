<template>
  <Teleport to="body">
    <Transition name="cd-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[10000] flex items-end justify-center md:items-center bg-black/40 dark:bg-black/70 backdrop-blur-sm"
        @click.self="close"
      >
        <Transition name="cd-sheet" appear>
          <div
            v-if="modelValue"
            class="w-full md:max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 max-h-[90vh] overflow-y-auto"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">Avto e'lon</h3>
                <p class="text-[12px] font-medium text-slate-400 mt-0.5">
                  {{ groupIds.length }} ta guruh · haydovchi nomidan
                </p>
              </div>
              <button
                type="button"
                class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400"
                @click="close"
              >
                <font-awesome-icon icon="fa-solid fa-times" />
              </button>
            </div>

            <div class="mt-4 space-y-1">
              <label class="px-1 text-[11px] font-semibold text-slate-500">Xabar nomi</label>
              <input
                v-model="name"
                type="text"
                maxlength="80"
                placeholder="Masalan: Toshkent-Namangan"
                class="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
            </div>

            <CommonTelegramHtmlEditor
              v-model="text"
              class="mt-3"
              label="E'lon matni"
              toolbar="static"
              :rows="5"
              hide-hint
              placeholder="E'lon matnini yozing…"
            />

            <div class="mt-4 space-y-1">
              <label class="px-1 text-[11px] font-semibold text-slate-500">
                Har necha daqiqada qayta yuborilsin
              </label>
              <PostIntervalPicker v-model="intervalMin" />
              <p class="px-1 text-[10px] font-semibold text-slate-400 leading-snug">
                Birinchi yuborish darhol. Keyin har {{ intervalMin }} daqiqada tanlangan guruhlarga yuboriladi.
              </p>
            </div>

            <p v-if="error" class="mt-3 text-center text-[12px] font-bold text-rose-500">{{ error }}</p>

            <form class="mt-4" @submit.prevent="onSubmit">
              <button
                type="submit"
                :disabled="loading || !text.trim() || !name.trim()"
                class="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black border active:scale-[0.98] transition-all disabled:opacity-50 bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600"
              >
                <font-awesome-icon
                  :icon="loading ? 'fa-solid fa-spinner' : 'fa-solid fa-play'"
                  :class="loading ? 'animate-spin' : ''"
                />
                Saqlash va boshlash
              </button>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { DEFAULT_POST_INTERVAL_MIN } from '~/stores/post.store'

const props = defineProps<{
  modelValue: boolean
  userId: string
  groupIds: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [boolean]
  started: []
}>()

const name = ref('')
const text = ref('')
const intervalMin = ref(DEFAULT_POST_INTERVAL_MIN)
const loading = ref(false)
const error = ref('')

const close = () => emit('update:modelValue', false)

const reset = () => {
  name.value = ''
  text.value = ''
  intervalMin.value = DEFAULT_POST_INTERVAL_MIN
  error.value = ''
  loading.value = false
}

const onSubmit = async () => {
  if (!props.userId || !props.groupIds.length) return
  loading.value = true
  error.value = ''
  try {
    const res = await useApi(`/drivers/${encodeURIComponent(props.userId)}/auto-post-campaign`, {
      method: 'POST',
      body: {
        name: name.value.trim(),
        text: text.value.trim(),
        groupIds: props.groupIds,
        intervalMin: intervalMin.value,
        start: true,
      },
    })
    if (res.success) {
      emit('started')
      close()
    } else {
      error.value = res.message || 'Saqlanmadi'
    }
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Xatolik'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) reset()
  }
)
</script>
