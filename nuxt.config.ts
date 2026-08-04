// https://nuxt.com/docs/api/configuration/nuxt-config
const isProd = process.env.NODE_ENV === 'production'
const apiProxyTarget =
  process.env.NUXT_API_PROXY_TARGET ||
  (isProd
    ? 'https://api.zortaksi.uz'
    : process.env.NUXT_DEV_API_BACKEND || 'http://127.0.0.1:5000')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: !isProd },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@vite-pwa/nuxt'],
  css: [
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],
  build: {
    transpile: [
      '@fortawesome/fontawesome-svg-core',
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/vue-fontawesome'
    ]
  },
  nitro: {
    compressPublicAssets: true,
    // Vercel deployda avtomatik `vercel` preset; lokal preview uchun node-server
    preset: process.env.VERCEL || process.env.NITRO_PRESET === 'vercel' ? 'vercel' : undefined,
  },
  routeRules: {
    /** Production + dev: brauzer same-origin /api/v1 → backend (Telegram WebView CORS muammosiz) */
    '/api/v1/**': {
      proxy: `${apiProxyTarget}/api/v1/**`,
    },
    '/': {
      ssr: true,
      headers: {
        'Cache-Control': 'private, no-store, no-cache, must-revalidate',
        Vary: 'Cookie',
      },
    },
    '/driver/**': {
      ssr: true,
      headers: {
        'Cache-Control': 'private, no-store, no-cache, must-revalidate',
        Vary: 'Cookie',
      },
    },
    '/admin/**': {
      ssr: true,
      headers: {
        'Cache-Control': 'private, no-store, no-cache, must-revalidate',
        Vary: 'Cookie',
      },
    },
    '/auth': {
      ssr: true,
      headers: {
        'Cache-Control': 'private, no-store, no-cache, must-revalidate',
        Vary: 'Cookie',
      },
    },
    '/login': {
      ssr: true,
      headers: { 'Cache-Control': 'private, no-store', Vary: 'Cookie' },
    },
    '/register': {
      ssr: true,
      headers: { 'Cache-Control': 'private, no-store', Vary: 'Cookie' },
    },
  },

  app: {
    head: {
      title: "Zo'r Taksi",
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      meta: [
        // theme-color / color-scheme — runtime useTheme (OS dark + app light bottom nav)
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'ZorTaksi' },
        { name: 'description', content: "ZorTaksi — Telegram buyurtmalari va haydovchi paneli" },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
        { rel: 'apple-touch-startup-image', href: '/logo.jpg' },
        // Backup if NuxtPwaManifest is missing from a layout; primary injection is <NuxtPwaManifest />
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
      // Telegram Mini App SDK — BackButton / history uchun
      script: [
        {
          src: 'https://telegram.org/js/telegram-web-app.js',
          defer: true,
          tagPriority: 1,
        },
      ],
    },
  },
  pwa: {
    strategies: 'injectManifest',
    srcDir: 'service-worker',
    filename: 'sw.ts',
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    // Manifest MIME / cache headers (Vercel/Nitro)
    registerWebManifestInRouteRules: true,
    manifest: {
      id: '/',
      name: "Zo'r Taksi",
      short_name: 'ZorTaksi',
      description: 'Telegram buyurtmalari — tez kirish',
      theme_color: '#020617',
      background_color: '#020617',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      scope: '/',
      lang: 'uz',
      // PNG any icons first — required for Chrome installability
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icons/icon-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico,jpg,woff2,webp}'],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: !isProd,
      type: 'module',
    },
  },
  runtimeConfig: {
    public: {
      // Same-origin proxy (/api/v1) — Telegram WebView CORS muammosiz; SSR to'g'ridan backend
      baseUrl:
        process.env.NUXT_PUBLIC_BASE_URL || '/api/v1',
      socketUrl:
        process.env.NUXT_PUBLIC_SOCKET_URL || 'https://api.zortaksi.uz',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
      adminTelegram: process.env.NUXT_PUBLIC_ADMIN_TELEGRAM || 'zortaksi_admin',
      paymentCard1: process.env.NUXT_PUBLIC_PAYMENT_CARD_1 || '4067070007722601',
      paymentCard2: process.env.NUXT_PUBLIC_PAYMENT_CARD_2 || '9860260115547846',
      paymentCardOwner: process.env.NUXT_PUBLIC_PAYMENT_CARD_OWNER || 'Doniyor Mirgiyozov',
    }
  },
})
