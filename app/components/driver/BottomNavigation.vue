<template>
  <nav
    class="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg"
  >
    <div class="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl px-2">
      <ul class="flex items-stretch justify-between">
        <li v-for="item in items" :key="item.to" class="flex-1">
          <NuxtLink
            :to="item.to"
            class="relative flex flex-col items-center justify-center gap-1 py-2.5 transition-colors"
            :class="isActive(item.to)
              ? 'text-sky-600 dark:text-sky-400'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'"
          >
            <span class="relative">
              <font-awesome-icon :icon="item.icon" class="text-lg" />
              <span
                v-if="item.badge"
                class="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center"
              >
                {{ item.badge }}
              </span>
            </span>
            <span class="text-[10px] font-bold tracking-wide">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'

interface NavItem {
  to: string
  label: string
  icon: string
  badge?: number | string
}

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role === 'admin')

const items = computed<NavItem[]>(() => {
  const base: NavItem[] = [
    { to: '/driver/orders', label: 'Buyurtmalar', icon: 'fa-solid fa-clipboard-list' },
    { to: '/driver/chats', label: 'Chatlar', icon: 'fa-solid fa-comments' },
    { to: '/driver/post', label: "E'lon joylash", icon: 'fa-solid fa-bullhorn' },
    { to: '/driver/profile', label: 'Profil', icon: 'fa-solid fa-user' },
  ]

  // Admin — Home (Asosiy) yo'q; o'rniga Admin
  if (isAdmin.value) {
    return [
      { to: '/admin/dashboard', label: 'Admin', icon: 'fa-solid fa-shield-alt' },
      ...base,
    ]
  }

  return [
    { to: '/driver/dashboard', label: 'Asosiy', icon: 'fa-solid fa-house' },
    ...base,
  ]
})

const route = useRoute()
const isActive = (to: string) => route.path === to || route.path.startsWith(to + '/')
</script>
