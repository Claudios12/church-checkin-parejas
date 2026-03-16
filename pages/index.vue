<template>
  <div class="min-h-screen bg-black py-8 px-4">
    <!-- Header: show logo in place of text -->
    <header class="text-center mb-8">
      <img src="/Logo_CimaKids.png" alt="{{ churchName }}" class="mx-auto h-24 mb-4" />
      <!-- optional title omitted since logo conveys branding -->
      <p class="text-2xl text-gray-300">Registro de Niños</p>
    </header>

    <!-- Main Content -->
    <main>
      <!-- Check-in Form (default view) -->
      <CheckInForm
        v-if="!showPreview"
        ref="checkInFormRef"
        @submit="handleCheckInSubmit"
        @cancel="handleCancel"
      />

      <!-- Sticker Preview (after successful check-in) -->
      <StickerPreview
        v-else
        :check-ins="completedCheckIns"
        @done="handlePreviewDone"
        @reset="handleReset"
      />
    </main>

    <!-- Footer -->
    <footer class="text-center mt-12 text-gray-400">
      <p class="text-sm">
        ¿Necesitas ayuda? Pregunta a un voluntario de Cima Iglesia Kids
      </p>
      <p class="text-xs mt-2 opacity-40">Hecho por Christian Donado &amp; Cima Iglesia</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { CheckInResult } from '~/composables/useCheckIn'

const config = useRuntimeConfig()
const churchName = config.public.churchName

const showPreview = ref(false)
const completedCheckIns = ref<CheckInResult[]>([])
const checkInFormRef = ref<any>(null)

const handleCheckInSubmit = (checkIns: CheckInResult[]) => {
  completedCheckIns.value = checkIns
  showPreview.value = true
}

const handlePreviewDone = () => {
  // User clicked "Done" button
  // The StickerPreview component will start the countdown
}

const handleReset = () => {
  // Reset everything
  showPreview.value = false
  completedCheckIns.value = []

  // Reset the form
  if (checkInFormRef.value) {
    checkInFormRef.value.resetForm()
  }
}

const handleCancel = () => {
  handleReset()
}

// Configurar meta de la página
useHead({
  title: `${churchName} - Registro de Niños`,
  meta: [
    {
      name: 'description',
      content: 'Sistema de registro para servicios infantiles de la iglesia',
    },
  ],
})
</script>

<style>
/* Global styles for kiosk mode */
body {
  overflow-x: hidden;
  -webkit-user-select: none;
  user-select: none;
}

/* Make everything touch-friendly */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Disable context menu */
body {
  -webkit-touch-callout: none;
}
</style>
