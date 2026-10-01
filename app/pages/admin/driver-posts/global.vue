<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <header class="sticky top-0 z-30 -mx-4 px-4 py-2 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          @click="navigateTo('/admin/driver-posts')"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="text-sm" />
        </button>
        <div class="min-w-0 flex-1">
          <h1 class="text-base font-black text-violet-800 dark:text-violet-200">Global xabar</h1>
          <p class="text-[10px] font-semibold text-violet-600/80 dark:text-violet-400/80 mt-0.5 leading-snug">
            Barcha e'lonlarga avtomatik qo'shiladi. Haydovchi tahrir qila olmaydi.
          </p>
        </div>
      </div>
    </header>

    <CommonTelegramHtmlEditor
      v-model="draft"
      :rows="8"
      placeholder="Masalan: Zo'r Taksi — ishonchli haydovchilar platformasi"
      hint="Formatlangan matn barcha e'lonlarga qo'shiladi. Enter — yangi qator."
    />

    <button
      type="button"
      class="w-full py-3 rounded-xl text-sm font-black text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50"
      :disabled="store.isSavingGlobal"
      @click="onSave"
    >
      <font-awesome-icon
        v-if="store.isSavingGlobal"
        icon="fa-solid fa-spinner"
        class="animate-spin mr-1"
      />
      Global xabarni saqlash
    </button>

    <p v-if="success" class="text-center text-[12px] font-bold text-emerald-500">{{ success }}</p>
    <p v-if="store.error" class="text-center text-[12px] font-bold text-red-500">{{ store.error }}</p>
  </div>
</template>

<script setup lang="ts">
import { useAdminDriverPostsStore } from '~/stores/adminDriverPosts.store'

definePageMeta({ layout: 'admin' })

const store = useAdminDriverPostsStore()
const draft = ref('')
const success = ref('')

const onSave = async () => {
  success.value = ''
  await store.saveGlobalAppend(draft.value.trim())
  success.value = 'Saqlandi'
}

onMounted(async () => {
  await store.fetchGlobalAppend()
  draft.value = store.globalAdminAppendText || ''
})

watch(
  () => store.globalAdminAppendText,
  (v) => {
    draft.value = v || ''
  },
)
</script>
