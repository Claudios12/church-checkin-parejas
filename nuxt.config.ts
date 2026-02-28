// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
  ],

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
    // simple admin password for protected pages (not public)
    adminPassword: process.env.ADMIN_PASSWORD || 'admin',
    public: {
      churchName: process.env.CHURCH_NAME || 'Cima Iglesia',
      autoResetSeconds: process.env.AUTO_RESET_SECONDS || '5',
    }
  },

  app: {
    head: {
      title: 'Registro de Niños - Iglesia',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' }
      ],
      link: [
        { rel: 'icon', href: '/Logo_CimaKids.png' }
      ],
    },
  },

  nitro: {
    externals: {
      traceInclude: ['./node_modules/.prisma/client'],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },
})
