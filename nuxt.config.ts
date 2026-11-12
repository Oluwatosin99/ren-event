// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    public: {
      // DEV MODE: shows "Override & Order Again" on the Thank You screen.
      // Set NUXT_PUBLIC_ALLOW_ORDER_OVERRIDE=false (or change to false) before go-live.
      allowOrderOverride: true
    }
  },
  experimental: {
    appManifest: false
  },
  vite: {
    $client: {
      resolve: {
        alias: {
          '#app-manifest': 'mocked-exports/empty'
        }
      }
    }
  },
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: '~/tailwind.config.js',
    config: {
      darkMode: 'class'
    }
  },
  nitro: {
    externals: {
      external: ['node:sqlite']
    }
  },
  app: {
    head: {
      title: 'Renaissance Event Platform — Access, Food Menu & Operations',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' },
        { name: 'description', content: 'Renaissance End of Year Event Platform: Gate QR Scanner, Guest Mobile Food App, Vendor Kitchen Dashboard & 80mm Thermal Printing.' },
        { name: 'theme-color', content: '#008751' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/images/brand/logo-mark-light.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700;800&display=swap'
        }
      ]
    },
    pageTransition: { name: 'page-slide', mode: 'out-in' }
  }
})
