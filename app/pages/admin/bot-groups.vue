<template>
  <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pt-0 pb-28 space-y-4">
    <header class="flex items-center gap-2 sticky top-0 z-30 -mx-4 px-4 py-1.5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/50">
      <div
        class="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-white shrink-0 bg-gradient-to-br from-rose-500 to-pink-600 shadow-md shadow-rose-500/20"
      >
        <font-awesome-icon icon="fa-solid fa-bullhorn" />
      </div>
      <div class="leading-none min-w-0">
        <h1 class="text-[13px] font-black tracking-tight text-slate-900 dark:text-white">
          Bot guruhlari
        </h1>
        <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 truncate">
          Har bir guruh — alohida bot token
        </p>
      </div>
    </header>

    <section class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
      <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        Har bir guruh uchun BotFather dan olingan <strong>alohida bot token</strong> kiriting.
        Botni guruhga admin qiling, kalit so'zlarni yozing va bitta tugma bilan saqlang.
      </p>

      <form class="space-y-3" @submit.prevent="onSubmit">
        <label class="block space-y-1">
          <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300">Bot token</span>
          <input
            v-model="form.botToken"
            type="password"
            autocomplete="off"
            :placeholder="editingHasToken ? 'Yangi token (o\'zgartirmasangiz bo\'sh qoldiring)' : '1234567890:AA...'"
            class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-[13px] font-mono font-semibold outline-none focus:ring-2 focus:ring-violet-500/30"
            :required="!editingHasToken"
          />
          <span v-if="editingHasToken && editingTokenMasked" class="text-[10px] text-slate-400">
            Joriy: {{ editingTokenMasked }}
          </span>
        </label>

        <label class="block space-y-1">
          <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300">Guruh username</span>
          <input
            v-model="form.username"
            type="text"
            placeholder="@samarqand_taksi"
            class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-[13px] font-semibold outline-none focus:ring-2 focus:ring-rose-500/30"
            required
          />
        </label>

        <label class="block space-y-1">
          <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300">Viloyat kalit so'zlar</span>
          <textarea
            v-model="form.keywords"
            rows="3"
            placeholder="Samarqand, samarqand, Самарқанд"
            class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-[13px] font-semibold outline-none focus:ring-2 focus:ring-rose-500/30 resize-none"
            required
          />
          <span class="text-[10px] text-slate-400">Vergul yoki yangi qator bilan ajrating</span>
        </label>

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
            {{ store.isSaving ? 'Saqlanmoqda...' : editingId ? 'Saqlash' : "Qo'shish" }}
          </button>
          <button
            v-if="editingId"
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
      <div v-for="n in 3" :key="n" class="h-32 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse" />
    </div>

    <BaseEmptyState
      v-else-if="!store.groups.length"
      icon="fa-solid fa-bullhorn"
      title="Hali guruh yo'q"
      subtitle="Yuqoridagi forma orqali birinchi guruhni qo'shing"
      tone="slate"
    />

    <div v-else class="space-y-3">
      <article
        v-for="g in store.groups"
        :key="g.id"
        class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="text-[14px] font-black text-slate-900 dark:text-white truncate">
              @{{ g.username }}
            </p>
            <p v-if="g.botUsername" class="text-[11px] text-violet-600 dark:text-violet-400 font-bold truncate">
              Bot: @{{ g.botUsername }}
            </p>
            <p v-if="g.title" class="text-[11px] text-slate-500 truncate">{{ g.title }}</p>
          </div>
          <div class="flex flex-col items-end gap-1 shrink-0">
            <span
              class="text-[10px] font-black px-2 py-0.5 rounded-full"
              :class="g.active
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'"
            >
              {{ g.active ? 'Faol' : 'O\'chiq' }}
            </span>
            <span
              v-if="g.active"
              class="text-[10px] font-black px-2 py-0.5 rounded-full"
              :class="g.botRunning
                ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
                : g.launching
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                  : 'bg-slate-100 text-slate-500'"
            >
              {{ g.botRunning ? 'Bot ishlayapti' : g.launching ? 'Ishga tushmoqda...' : 'Bot to\'xtagan' }}
            </span>
          </div>
        </div>

        <p class="text-[11px] text-slate-600 dark:text-slate-300">
          <span class="font-bold">Kalit so'zlar:</span> {{ g.keywords.join(', ') }}
        </p>
        <p v-if="g.tokenMasked" class="text-[10px] text-slate-400 font-mono">{{ g.tokenMasked }}</p>

        <div class="flex flex-wrap gap-2 text-[10px] font-bold">
          <span
            class="px-2 py-0.5 rounded-full"
            :class="g.botIsAdmin
              ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'"
          >
            {{ g.botIsAdmin ? 'Bot admin' : 'Bot admin emas' }}
          </span>
          <span v-if="g.lastPostAt" class="text-slate-400">
            Oxirgi post: {{ formatDate(g.lastPostAt) }}
          </span>
        </div>

        <p v-if="g.botLastError" class="text-[10px] font-bold text-amber-600">{{ g.botLastError }}</p>
        <p v-if="g.lastError" class="text-[10px] font-bold text-red-500 leading-snug">{{ g.lastError }}</p>

        <div class="flex flex-wrap gap-2 pt-1">
          <button type="button" class="text-[11px] font-bold text-sky-600 dark:text-sky-400" @click="startEdit(g)">
            Tahrirlash
          </button>
          <button
            type="button"
            class="text-[11px] font-bold text-violet-600 dark:text-violet-400"
            :disabled="store.isSaving"
            @click="onRefresh(g)"
          >
            Tekshirish
          </button>
          <button type="button" class="text-[11px] font-bold text-red-500" @click="askDelete(g)">
            O'chirish
          </button>
        </div>
      </article>
    </div>

    <p v-if="error" class="text-center text-[12px] font-bold text-red-500">{{ error }}</p>

    <BaseConfirmDialog
      v-model="deleteOpen"
      title="Guruhni o'chirish"
      :message="deleteTarget ? `@${deleteTarget.username} va uning boti o'chirilsinmi?` : ''"
      confirm-text="O'chir"
      cancel-text="Bekor qilish"
      variant="danger"
      :loading="store.isSaving"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { BotGroupRow } from '~/stores/bot-group.store'
import { useBotGroupStore } from '~/stores/bot-group.store'

definePageMeta({ layout: 'admin' })

const store = useBotGroupStore()

const emptyForm = () => ({
  botToken: '',
  username: '',
  keywords: '',
  active: true,
})

const form = ref(emptyForm())
const editingId = ref<string | null>(null)
const editingHasToken = ref(false)
const editingTokenMasked = ref('')
const deleteOpen = ref(false)
const deleteTarget = ref<BotGroupRow | null>(null)
const error = ref('')

const resetForm = () => {
  form.value = emptyForm()
  editingId.value = null
  editingHasToken.value = false
  editingTokenMasked.value = ''
}

const onSubmit = async () => {
  error.value = ''
  if (!editingId.value && !form.value.botToken.trim()) {
    error.value = 'Bot token kiriting'
    return
  }

  const payload = {
    username: form.value.username.trim(),
    keywords: form.value.keywords.trim(),
    active: form.value.active,
    botToken: form.value.botToken.trim() || undefined,
  }

  try {
    if (editingId.value) {
      await store.updateGroup(editingId.value, payload)
    } else {
      await store.createGroup(payload)
    }
    resetForm()
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'Xatolik yuz berdi'
  }
}

const startEdit = (g: BotGroupRow) => {
  editingId.value = g.id
  editingHasToken.value = !!g.hasBotToken
  editingTokenMasked.value = g.tokenMasked || ''
  form.value = {
    botToken: '',
    username: g.username,
    keywords: g.keywords.join(', '),
    active: g.active,
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

const askDelete = (g: BotGroupRow) => {
  deleteTarget.value = g
  deleteOpen.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  error.value = ''
  try {
    await store.deleteGroup(deleteTarget.value.id)
    deleteOpen.value = false
    deleteTarget.value = null
    if (editingId.value) resetForm()
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || 'O\'chirish xato'
  }
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

onMounted(() => {
  void store.fetchGroups()
})
</script>
