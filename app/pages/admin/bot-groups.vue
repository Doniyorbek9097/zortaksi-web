<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <header class="flex items-center gap-2 sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-white shrink-0 bg-gradient-to-br from-rose-500 to-pink-600 shadow-md shadow-rose-500/20">
        <font-awesome-icon icon="fa-solid fa-bullhorn" />
      </div>
      <div class="leading-none min-w-0">
        <h1 class="text-[13px] font-black tracking-tight text-slate-900 dark:text-white">
          Bot guruhlari
        </h1>
        <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 truncate">
          Slug + public/private juftlik
        </p>
      </div>
    </header>

    <section class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
      <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        Har bir hudud uchun <strong>slug</strong>, kalit so'zlar va ikkita guruh: <strong>public</strong> (qisqa e'lon) va <strong>private</strong> (to'liq buyurtma).
      </p>

      <form class="space-y-3" @submit.prevent="onSubmit">
        <label class="block space-y-1">
          <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300">Slug</span>
          <input
            v-model="form.regionSlug"
            type="text"
            placeholder="namangan"
            class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-[13px] font-mono font-semibold outline-none focus:ring-2 focus:ring-rose-500/30"
            :disabled="!!editingSlug"
            required
          />
        </label>

        <label class="block space-y-1">
          <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300">Nom</span>
          <input
            v-model="form.title"
            type="text"
            placeholder="Masalan: Namangan"
            class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-[13px] font-semibold outline-none focus:ring-2 focus:ring-rose-500/30"
          />
        </label>

        <label class="block space-y-1">
          <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300">Kalit so'zlar</span>
          <textarea
            v-model="form.keywords"
            rows="3"
            placeholder="Namangan, namangan, Намangan"
            class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-[13px] font-semibold outline-none focus:ring-2 focus:ring-rose-500/30 resize-none"
            required
          />
        </label>

        <div class="rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/20 p-3 space-y-2">
          <p class="text-[11px] font-black text-sky-700 dark:text-sky-300">📢 Public guruh</p>
          <input
            v-model="form.public.botToken"
            type="password"
            autocomplete="off"
            :placeholder="editingPublicHasToken ? 'Yangi token (ixtiyoriy)' : 'Public bot token'"
            class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-[12px] font-mono outline-none"
            :required="!editingSlug && !editingPublicHasToken"
          />
          <input
            v-model="form.public.username"
            type="text"
            placeholder="@namangan_public"
            class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-[12px] outline-none"
            required
          />
        </div>

        <div class="rounded-xl border border-violet-200 dark:border-violet-900/50 bg-violet-50/50 dark:bg-violet-950/20 p-3 space-y-2">
          <p class="text-[11px] font-black text-violet-700 dark:text-violet-300">🔒 Private guruh</p>
          <input
            v-model="form.private.botToken"
            type="password"
            autocomplete="off"
            :placeholder="editingPrivateHasToken ? 'Yangi token (ixtiyoriy)' : 'Private bot token'"
            class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-[12px] font-mono outline-none"
            :required="!editingSlug && !editingPrivateHasToken"
          />
          <input
            v-model="form.private.username"
            type="text"
            placeholder="@namangan_private (ixtiyoriy)"
            class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-[12px] outline-none"
          />
          <input
            v-model="form.private.inviteLink"
            type="text"
            placeholder="Invite link (username bo'lmasa)"
            class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-[12px] outline-none"
          />
        </div>

        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="form.active" type="checkbox" class="rounded border-slate-300 text-rose-500 focus:ring-rose-500" />
          <span class="text-[12px] font-bold text-slate-700 dark:text-slate-200">Faol</span>
        </label>

        <div class="flex gap-2 pt-1">
          <button
            type="submit"
            class="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[12px] font-black py-2.5 disabled:opacity-50"
            :disabled="store.isSaving"
          >
            {{ store.isSaving ? 'Saqlanmoqda...' : editingSlug ? 'Saqlash' : "Qo'shish" }}
          </button>
          <button
            v-if="editingSlug"
            type="button"
            class="rounded-xl border border-slate-200 dark:border-slate-700 px-4 text-[12px] font-bold text-slate-600 dark:text-slate-300"
            @click="resetForm"
          >
            Bekor
          </button>
        </div>
      </form>
    </section>

    <div v-if="store.isLoading" class="space-y-3">
      <div v-for="n in 3" :key="n" class="h-40 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
    </div>

    <BaseEmptyState
      v-else-if="!store.regionCards.length"
      icon="fa-solid fa-bullhorn"
      title="Hali hudud yo'q"
      subtitle="Yuqoridagi forma orqali birinchi juftlikni qo'shing"
      tone="slate"
    />

    <div v-else class="space-y-3">
      <article
        v-for="card in store.regionCards"
        :key="card.slug"
        class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="text-[14px] font-black text-slate-900 dark:text-white truncate">
              {{ card.title }}
            </p>
            <p class="text-[11px] font-mono text-slate-500">{{ card.slug }}</p>
          </div>
          <span
            class="text-[10px] font-black px-2 py-0.5 rounded-full shrink-0"
            :class="card.active
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
              : 'bg-slate-100 text-slate-500'"
          >
            {{ card.active ? 'Faol' : 'O\'chiq' }}
          </span>
        </div>

        <p class="text-[11px] text-slate-600 dark:text-slate-300">
          <span class="font-bold">Kalit so'zlar:</span> {{ card.keywords.join(', ') }}
        </p>

        <div class="grid gap-2 sm:grid-cols-2">
          <div
            v-for="side in [card.public, card.private].filter(Boolean)"
            :key="side!.id"
            class="rounded-xl border border-slate-100 dark:border-slate-800 p-2.5 space-y-1"
          >
            <p class="text-[10px] font-black uppercase tracking-wide"
              :class="side!.kind === 'private' ? 'text-violet-600' : 'text-sky-600'"
            >
              {{ side!.kind === 'private' ? 'Private' : 'Public' }}
            </p>
            <p class="text-[11px] font-bold truncate">@{{ side!.username }}</p>
            <p v-if="side!.botUsername" class="text-[10px] text-slate-400">Bot: @{{ side!.botUsername }}</p>
            <span
              class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
              :class="side!.botIsAdmin
                ? 'bg-sky-100 text-sky-700'
                : 'bg-amber-100 text-amber-700'"
            >
              {{ side!.botIsAdmin ? 'Admin' : 'Admin emas' }}
            </span>
            <button
              type="button"
              class="block text-[10px] font-bold text-violet-600 mt-1"
              @click="onRefresh(side!)"
            >
              Tekshirish
            </button>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 pt-1">
          <button type="button" class="text-[11px] font-bold text-sky-600" @click="startEdit(card)">
            Tahrirlash
          </button>
          <button type="button" class="text-[11px] font-bold text-red-500" @click="askDelete(card)">
            O'chirish
          </button>
        </div>
      </article>
    </div>

    <p v-if="error" class="text-center text-[12px] font-bold text-red-500">{{ error }}</p>

    <BaseConfirmDialog
      v-model="deleteOpen"
      title="Hududni o'chirish"
      :message="deleteTarget ? `${deleteTarget.title} (${deleteTarget.slug}) o'chirilsinmi?` : ''"
      confirm-text="O'chir"
      cancel-text="Bekor qilish"
      variant="danger"
      :loading="store.isSaving"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { BotGroupRow, BotRegionCard } from '~/stores/bot-group.store'
import { useBotGroupStore } from '~/stores/bot-group.store'

definePageMeta({ layout: 'admin' })

const store = useBotGroupStore()

const emptyForm = () => ({
  regionSlug: '',
  title: '',
  keywords: '',
  active: true,
  public: { botToken: '', username: '' },
  private: { botToken: '', username: '', inviteLink: '' },
})

const form = ref(emptyForm())
const editingSlug = ref<string | null>(null)
const editingPublicHasToken = ref(false)
const editingPrivateHasToken = ref(false)
const deleteOpen = ref(false)
const deleteTarget = ref<BotRegionCard | null>(null)
const error = ref('')

const resetForm = () => {
  form.value = emptyForm()
  editingSlug.value = null
  editingPublicHasToken.value = false
  editingPrivateHasToken.value = false
}

const onSubmit = async () => {
  error.value = ''
  const payload = {
    regionSlug: form.value.regionSlug.trim(),
    title: form.value.title.trim(),
    keywords: form.value.keywords.trim(),
    active: form.value.active,
    public: {
      botToken: form.value.public.botToken.trim() || undefined,
      username: form.value.public.username.trim(),
    },
    private: {
      botToken: form.value.private.botToken.trim() || undefined,
      username: form.value.private.username.trim(),
      inviteLink: form.value.private.inviteLink.trim(),
    },
  }

  try {
    if (editingSlug.value) {
      await store.updateRegion(editingSlug.value, payload)
    } else {
      if (!payload.public.botToken || !payload.private.botToken) {
        error.value = 'Ikkala guruh uchun bot token kiriting'
        return
      }
      await store.createRegion(payload as any)
    }
    resetForm()
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Xatolik yuz berdi'
  }
}

const startEdit = (card: BotRegionCard) => {
  editingSlug.value = card.slug
  editingPublicHasToken.value = !!card.public?.hasBotToken
  editingPrivateHasToken.value = !!card.private?.hasBotToken
  form.value = {
    regionSlug: card.slug,
    title: card.title,
    keywords: card.keywords.join(', '),
    active: card.active,
    public: {
      botToken: '',
      username: card.public?.username || '',
    },
    private: {
      botToken: '',
      username: card.private?.username || '',
      inviteLink: card.private?.inviteLink || '',
    },
  }
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

const onRefresh = async (g: BotGroupRow) => {
  error.value = ''
  try {
    await store.refreshGroup(g.id)
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Tekshirish xato'
  }
}

const askDelete = (card: BotRegionCard) => {
  deleteTarget.value = card
  deleteOpen.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  error.value = ''
  try {
    await store.deleteRegion(deleteTarget.value.slug)
    deleteOpen.value = false
    deleteTarget.value = null
    if (editingSlug.value) resetForm()
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'O\'chirish xato'
  }
}

onMounted(() => {
  void store.fetchGroups()
})
</script>
