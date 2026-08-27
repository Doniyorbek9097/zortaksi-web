<template>
  <div
    class="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 px-5"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.12),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.1),transparent_40%)]"
    />

    <div class="relative w-full max-w-sm text-center">
      <div
        class="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl ring-1 ring-white/10"
        :class="reason === 'offline'
          ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/25'
          : 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/25'"
      >
        <font-awesome-icon
          :icon="reason === 'offline' ? 'fa-solid fa-wifi' : 'fa-solid fa-server'"
          class="text-white text-2xl"
        />
      </div>

      <h1 class="text-lg font-black text-slate-900 dark:text-white">
        {{ title }}
      </h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {{ hint }}
      </p>

      <p
        v-if="retryError"
        class="mt-3 text-xs font-semibold text-rose-500"
      >
        {{ retryError }}
      </p>

      <div class="mt-6 flex flex-col gap-2.5">
        <button
          type="button"
          class="w-full h-11 rounded-xl font-bold text-sm text-white bg-sky-500 hover:bg-sky-600 active:scale-[0.98] transition disabled:opacity-60 disabled:pointer-events-none shadow-lg shadow-sky-500/20"
          :disabled="retrying"
          @click="retry"
        >
          <font-awesome-icon
            v-if="retrying"
            icon="fa-solid fa-spinner"
            class="animate-spin mr-2"
          />
          Qayta urinish
        </button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  classifyApiError,
  connectionErrorHint,
  connectionErrorTitle,
  type ConnectionErrorReason,
} from '~/utils/connectionError'
import { resolveHomePath, resolveSafeNextPath } from '~/utils/userRole'
import { resolveAuthToken } from '~/utils/activeAccount'
import { getAuthCookieOptions } from '~/utils/authCookie'
import { getApiErrorMessage } from '~/utils/apiError'

definePageMeta({ layout: false })

const route = useRoute()
const authStore = useAuthStore()
const tokenCookie = useCookie('auth_token', { ...getAuthCookieOptions() })

const reason = ref<ConnectionErrorReason>(
  String(route.query.reason || '') === 'offline' ? 'offline' : 'server',
)
const retrying = ref(false)
const retryError = ref('')

const title = computed(() => connectionErrorTitle(reason.value))
const hint = computed(() => connectionErrorHint(reason.value))
const hasToken = computed(() => !!resolveAuthToken(tokenCookie.value))

const retry = async () => {
  if (!import.meta.client) return
  retrying.value = true
  retryError.value = ''

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    reason.value = 'offline'
    retryError.value = 'Internet hali yo\'q. Tarmoqni tekshiring.'
    retrying.value = false
    return
  }

  if (!hasToken.value) {
    retryError.value = 'Kirish talab qilinadi.'
    retrying.value = false
    return
  }

  try {
    await authStore.getMe({ authToken: resolveAuthToken(tokenCookie.value) })
    if (!authStore.user) {
      retryError.value = 'Hisob ma\'lumotlari olinmadi.'
      return
    }

    const next = resolveSafeNextPath(route.query.next, authStore.user)
    await navigateTo(next || resolveHomePath(authStore.user), { replace: true })
  } catch (e) {
    reason.value = classifyApiError(e)
    retryError.value = getApiErrorMessage(e, 'Ulanish tiklanmadi')
  } finally {
    retrying.value = false
  }
}

const onOnline = () => {
  if (!authStore.user && hasToken.value) void retry()
}

onMounted(() => {
  authStore.sessionReady = true
  window.addEventListener('online', onOnline)
})

onUnmounted(() => {
  window.removeEventListener('online', onOnline)
})
</script>
