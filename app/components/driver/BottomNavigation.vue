<template>
  <nav
    class="driver-tabbar fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
    aria-label="Asosiy navigatsiya"
  >
    <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-2">
      <!-- Fixed row height — badge/label o'zgarganda tabbar sakramasligi uchun -->
      <ul class="grid h-14 grid-cols-5 items-stretch">
        <li v-for="item in items" :key="item.to" class="min-w-0">
          <NuxtLink
            :to="item.to"
            class="relative flex h-full flex-col items-center justify-center gap-1 transition-colors"
            :class="isActive(item.to)
              ? 'text-sky-600 dark:text-sky-400'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'"
          >
            <span class="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
              <font-awesome-icon :icon="item.icon" class="text-lg" />
              <span
                v-if="item.badge"
                class="absolute -top-1.5 -right-2.5 z-10 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center tabular-nums leading-none"
              >
                {{ formatBadge(item.badge) }}
              </span>
            </span>
            <span class="max-w-full truncate px-0.5 text-[10px] font-bold tracking-wide leading-none">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useChatStore } from '~/stores/chat.store'
import { useOrderStore } from '~/stores/order.store'

interface NavItem {
  to: string
  label: string
  icon: string
  badge?: number
}

const chatStore = useChatStore()
const orderStore = useOrderStore()

const formatBadge = (n: number) => (n > 99 ? '99+' : n)

const items = computed<NavItem[]>(() => {
  const chatsBadge = chatStore.unreadTotal
  const ordersBadge = orderStore.recentMinuteCount

  return [
    {
      to: '/driver/dashboard',
      label: 'Asosiy',
      icon: 'fa-solid fa-house',
    },
    {
      to: '/driver/orders',
      label: 'Buyurtmalar',
      icon: 'fa-solid fa-clipboard-list',
      badge: ordersBadge > 0 ? ordersBadge : undefined,
    },
    {
      to: '/driver/chats',
      label: 'Chatlar',
      icon: 'fa-solid fa-comments',
      badge: chatsBadge > 0 ? chatsBadge : undefined,
    },
    { to: '/driver/post', label: "E'lon joylash", icon: 'fa-solid fa-bullhorn' },
    { to: '/driver/profile', label: 'Profil', icon: 'fa-solid fa-user' },
  ]
})

const route = useRoute()
const isActive = (to: string) => route.path === to || route.path.startsWith(to + '/')

onMounted(() => {
  orderStore.startRecentMinuteTicker()
})
</script>

<style scoped>
/* Fixed tabbar — scrollbar/viewport o'zgarganda sakramasligi uchun */
.driver-tabbar {
  bottom: 0;
  padding-bottom: var(--zt-safe-bottom, 0px);
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  overflow-anchor: none;
  contain: layout style;
}

/* Flutter WebView: pastki bo'shliqni majburan yopish */
:global(html[data-zt-embed='webview']) .driver-tabbar {
  padding-bottom: 0 !important;
}
</style>
