// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
  ],

  runtimeConfig: {
    public: {
      autoResetSeconds: process.env.AUTO_RESET_SECONDS || '5',
    }
  },

  app: {
    head: {
      title: 'Un Ascenso con Propósito – Evento de Parejas',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' }
      ],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },
})
