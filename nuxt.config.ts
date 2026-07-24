// https://nuxt.com/docs/api/configuration/nuxt-config
const isProd = process.env.NODE_ENV === 'production'

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
  app: {
    head: {
      title: "Zo'r Taksi",
      meta: [
        // Runtime theme syncs these via useTheme / app.vue (light: slate-50, dark: slate-950)
        { name: 'theme-color', content: '#020617' },
        { name: 'color-scheme', content: 'dark' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
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
      description: 'Telegram buyurtmalari — tez kirish va bildirishnomalar',
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
      // Nuxt env: NUXT_PUBLIC_BASE_URL → public.baseUrl (baseURL emas!)
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1',
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
      adminTelegram: process.env.NUXT_PUBLIC_ADMIN_TELEGRAM || 'doniyorbek_ergashev',
      vapidKey: process.env.NUXT_PUBLIC_VAPID_KEY || '',
      paymentCard1: process.env.NUXT_PUBLIC_PAYMENT_CARD_1 || '4067070007722601',
      paymentCard2: process.env.NUXT_PUBLIC_PAYMENT_CARD_2 || '9860260115547846',
      paymentCardOwner: process.env.NUXT_PUBLIC_PAYMENT_CARD_OWNER || 'Doniyor Mirgiyozov',
    }
  },
})
