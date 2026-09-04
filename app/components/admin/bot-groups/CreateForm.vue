<template>
  <section
    class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
  >
  <button
      v-if="!editing"
      type="button"
      class="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
      @click="expanded = !expanded"
    >
      <span class="flex items-center gap-2.5 min-w-0">
        <span class="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
          <font-awesome-icon :icon="expanded ? 'fa-solid fa-chevron-up' : 'fa-solid fa-plus'" class="text-sm" />
        </span>
        <span class="text-[13px] font-black text-slate-900 dark:text-white">
          Yangi hudud qo'shish
        </span>
      </span>
      <span class="text-[11px] font-bold text-slate-400 shrink-0">
        {{ expanded ? 'Yopish' : 'Ochish' }}
      </span>
    </button>

    <div
      v-show="expanded || editing"
      class="px-4 pb-4 space-y-3 border-t border-slate-100 dark:border-slate-800"
      :class="editing ? 'pt-4' : 'pt-3'"
    >
      <p
        v-if="editing"
        class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400"
      >
        Tahrirlash
      </p>

      <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
        Har bir hudud uchun slug, bot token va public @username.
        <span v-if="showPrivateSection">Birinchi hudud uchun private invite link ham kerak.</span>
        <span v-else>Bu token uchun private allaqachon mavjud — faqat public qo'shiladi.</span>
      </p>

      <form class="space-y-3" @submit.prevent="onSubmit">
        <BaseInput
          :model-value="modelValue.regionSlug"
          label="Slug"
          placeholder="namangan"
          @update:model-value="patch('regionSlug', $event)"
        />
        <p
          v-if="editingSlug && String(modelValue.regionSlug).trim() !== editingSlug"
          class="text-[10px] font-semibold text-amber-600 dark:text-amber-400 px-1"
        >
          Slug o'zgarsa — haydovchilar va buyurtmalar ham yangilanadi.
        </p>

        <BaseInput
          :model-value="modelValue.title"
          label="Nom"
          placeholder="Masalan: Namangan"
          @update:model-value="patch('title', $event)"
        />

        <div v-if="showListenerSelect" class="space-y-1.5">
          <label class="px-1 text-xs text-slate-600 dark:text-slate-300">Tinglovchi userbot</label>
          <p class="px-1 text-[10px] text-slate-400 leading-snug">
            Faqat <strong>listenGroups</strong> yoqilgan userbotlar.
          </p>
          <select
            :value="modelValue.listenerUserId"
            class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-3 text-[13px] font-semibold outline-none focus:ring-2 focus:ring-rose-500/30"
            @change="patch('listenerUserId', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">— Tanlang —</option>
            <option
              v-if="modelValue.listenerUserId && !listenerCandidates.some(c => c.userId === modelValue.listenerUserId)"
              :value="modelValue.listenerUserId"
            >
              {{ modelValue.listenerUserId }} (listenGroups o'chiq?)
            </option>
            <option v-for="c in listenerCandidates" :key="c.userId" :value="c.userId">
              {{ c.label }}{{ c.username ? ` (@${c.username})` : '' }}
            </option>
          </select>
          <p v-if="!listenerCandidates.length" class="px-1 text-[10px] font-semibold text-amber-600">
            Admin sizga tinglovchi biriktirmagan.
          </p>
        </div>

        <div class="space-y-1.5">
          <label class="px-1 text-xs text-slate-600 dark:text-slate-300">Tariflar (bir nechta)</label>
          <p class="px-1 text-[10px] text-slate-400 leading-snug">
            Admin haydovchiga reply qilib <strong>/tarif</strong> yuborganda faqat shu tariflar ko'rsatiladi.
          </p>
          <div
            v-if="!tariffs.length"
            class="px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 text-[11px] font-semibold text-amber-700 dark:text-amber-300"
          >
            Tariflar yo'q — avval «Tariflar» bo'limida qo'shing.
          </div>
          <ul
            v-else
            class="max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800"
          >
            <li v-for="t in tariffs" :key="t.id">
              <label
                class="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50"
              >
                <input
                  type="checkbox"
                  class="w-4 h-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                  :checked="modelValue.tariffIds.includes(t.id)"
                  @change="toggleTariff(t.id, ($event.target as HTMLInputElement).checked)"
                />
                <span class="min-w-0 flex-1 text-[12px] font-bold text-slate-800 dark:text-slate-100 truncate">
                  {{ t.name }}
                </span>
                <span class="shrink-0 text-[10px] font-semibold text-slate-400">
                  {{ formatPrice(t.price) }}
                </span>
              </label>
            </li>
          </ul>
        </div>

        <div class="space-y-1">
          <label class="px-1 text-xs text-slate-600 dark:text-slate-300">Bot token (BotFather)</label>
          <input
            :value="modelValue.botToken"
            type="password"
            autocomplete="off"
            :placeholder="editingHasToken ? 'Yangi token (ixtiyoriy)' : '1234567890:AA...'"
            class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-3 text-[13px] font-mono font-semibold outline-none focus:ring-2 focus:ring-violet-500/30"
            @input="patch('botToken', ($event.target as HTMLInputElement).value)"
          />
          <p v-if="editingHasToken && editingTokenMasked" class="px-1 text-[10px] text-slate-400 font-mono">
            Joriy: {{ editingTokenMasked }}
          </p>
          <p v-if="tokenUsage" class="px-1 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
            Bu token: {{ tokenUsage.publicCount }}/{{ tokenUsage.maxPublic }} public,
            {{ tokenUsage.hasPrivate ? 1 : 0 }}/{{ tokenUsage.maxPrivate }} private
          </p>
          <p class="px-1 text-[10px] text-slate-400">
            Bitta bot — 10 tagacha public va 1 ta private guruh.
          </p>
        </div>

        <div class="rounded-xl border border-sky-200/80 dark:border-sky-900/50 bg-sky-50/60 dark:bg-sky-950/25 p-3 space-y-2">
          <p class="text-[11px] font-black text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
            <font-awesome-icon icon="fa-solid fa-users" class="text-[10px]" />
            Public guruh
          </p>
          <BaseInput
            :model-value="modelValue.public.username"
            placeholder="@namangan_public"
            @update:model-value="patchPublic('username', $event)"
          />
        </div>

        <div
          v-if="showPrivateSection"
          class="rounded-xl border border-violet-200/80 dark:border-violet-900/50 bg-violet-50/60 dark:bg-violet-950/25 p-3 space-y-2"
        >
          <p class="text-[11px] font-black text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
            <font-awesome-icon icon="fa-solid fa-lock" class="text-[10px]" />
            Private guruh
          </p>
          <BaseInput
            :model-value="modelValue.private.inviteLink"
            placeholder="https://t.me/+AbCdEf..."
            @update:model-value="patchPrivate('inviteLink', $event)"
          />
          <p class="text-[10px] text-slate-400 px-1">
            Botni invite link orqali guruhga qo'shing va admin qiling.
          </p>
        </div>

        <label class="flex items-center gap-2.5 px-1 py-1 cursor-pointer select-none">
          <input
            :checked="modelValue.postOrdersToPublic"
            type="checkbox"
            class="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
            @change="patch('postOrdersToPublic', ($event.target as HTMLInputElement).checked)"
          />
          <span class="text-[13px] font-bold text-slate-700 dark:text-slate-200">
            Public guruhga buyurtma tashlash
          </span>
        </label>
        <p class="px-1 text-[10px] text-slate-400 leading-snug -mt-1">
          O'chirilsa — buyurtmalar faqat private guruhga yuboriladi.
        </p>

        <div class="space-y-1.5">
          <label class="px-1 text-xs text-slate-600 dark:text-slate-300">
            Guruhga odam qo'shganda bonus (so'm)
          </label>
          <input
            :value="modelValue.groupInviteRewardAmount"
            type="number"
            min="0"
            step="100"
            placeholder="500"
            class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-3 text-[13px] font-semibold outline-none focus:ring-2 focus:ring-emerald-500/30"
            @input="patch('groupInviteRewardAmount', Number(($event.target as HTMLInputElement).value || 0))"
          />
          <p class="px-1 text-[10px] text-slate-400 leading-snug">
            0 bo'lsa — haydovchiga pul o'rniga minnatdorlik xabari yuboriladi.
          </p>
        </div>

        <label class="flex items-center gap-2.5 px-1 py-1 cursor-pointer select-none">
          <input
            :checked="modelValue.active"
            type="checkbox"
            class="w-4 h-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
            @change="patch('active', ($event.target as HTMLInputElement).checked)"
          />
          <span class="text-[13px] font-bold text-slate-700 dark:text-slate-200">Faol hudud</span>
        </label>

        <button
          type="submit"
          class="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white bg-rose-500 hover:bg-rose-600 active:scale-[0.98] transition-all shadow-lg shadow-rose-500/25 disabled:opacity-50"
          :disabled="saving"
        >
          <font-awesome-icon
            :icon="saving ? 'fa-solid fa-spinner' : editing ? 'fa-solid fa-check' : 'fa-solid fa-plus'"
            :class="{ 'animate-spin': saving }"
          />
          {{ saving ? 'Saqlanmoqda...' : editing ? 'Saqlash' : "Qo'shish" }}
        </button>

        <button
          v-if="editing"
          type="button"
          class="w-full py-2.5 rounded-xl text-[12px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          @click="$emit('cancel')"
        >
          Bekor qilish
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ListenerCandidate } from '~/stores/bot-group.store'

export interface BotGroupFormModel {
  regionSlug: string
  title: string
  listenerUserId: string
  tariffIds: string[]
  botToken: string
  active: boolean
  postOrdersToPublic: boolean
  groupInviteRewardAmount: number
  public: { username: string }
  private: { inviteLink: string }
}

const props = defineProps<{
  modelValue: BotGroupFormModel
  editing?: boolean
  editingSlug?: string | null
  editingHasToken?: boolean
  editingTokenMasked?: string
  listenerCandidates: ListenerCandidate[]
  showListenerSelect?: boolean
  showPrivateSection?: boolean
  tokenUsage?: {
    publicCount: number
    privateCount: number
    hasPrivate: boolean
    canAddPublic: boolean
    maxPublic: number
    maxPrivate: number
  } | null
  tariffs: Array<{ id: string; name: string; price: number; expireDays: number }>
  saving?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: BotGroupFormModel]
  submit: []
  cancel: []
}>()

const expanded = ref(false)

const showListenerSelect = computed(() => props.showListenerSelect !== false)
const showPrivateSection = computed(() => props.showPrivateSection !== false)

watch(
  () => props.editing,
  (v) => {
    if (v) expanded.value = true
  },
)

const patch = <K extends keyof BotGroupFormModel>(key: K, value: BotGroupFormModel[K]) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const patchPublic = (key: 'username', value: string | number | null) => {
  emit('update:modelValue', {
    ...props.modelValue,
    public: { ...props.modelValue.public, [key]: String(value ?? '') },
  })
}

const patchPrivate = (key: 'inviteLink', value: string | number | null) => {
  emit('update:modelValue', {
    ...props.modelValue,
    private: { ...props.modelValue.private, [key]: String(value ?? '') },
  })
}

const toggleTariff = (id: string, checked: boolean) => {
  const set = new Set(props.modelValue.tariffIds || [])
  if (checked) set.add(id)
  else set.delete(id)
  patch('tariffIds', [...set])
}

const formatPrice = (n: number) =>
  `${Math.round(Number(n || 0)).toLocaleString('ru-RU')} so'm`

const onSubmit = () => {
  emit('submit')
}
</script>
