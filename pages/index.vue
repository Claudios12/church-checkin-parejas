<template>
  <div class="min-h-screen bg-black py-8 px-4">
    <!-- Header -->
    <header class="text-center mb-8">
      <img
        src="/Logo_LibresParaAmar.png"
        alt="Libres para Amar"
        class="mx-auto h-24 mb-4"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
      <h1 class="text-3xl font-bold text-white uppercase tracking-wide">
        Un Ascenso con Propósito
      </h1>
      <p class="text-lg text-gray-400 mt-1">Marzo 28, 2026 &nbsp;·&nbsp; Punto de Partida</p>
    </header>

    <!-- Main Content -->
    <main>
      <CoupleCheckInForm
        v-if="!showPreview"
        ref="formRef"
        @submit="handleSubmit"
      />

      <CoupleStickerPreview
        v-else
        :couple-data="coupleData!"
        @reset="handleReset"
      />
    </main>

    <!-- Footer -->
    <footer class="text-center mt-12 text-gray-600">
      <p class="text-xs opacity-40">Hecho por Christian Donado &amp; Cima Iglesia</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { CoupleData } from '~/composables/useCouplePrint'

const showPreview = ref(false)
const coupleData = ref<CoupleData | null>(null)
const formRef = ref<any>(null)

const handleSubmit = (data: CoupleData) => {
  coupleData.value = data
  showPreview.value = true
}

const handleReset = () => {
  showPreview.value = false
  coupleData.value = null
  if (formRef.value) {
    formRef.value.resetForm()
  }
}

useHead({
  title: 'Un Ascenso con Propósito – Evento de Parejas',
})
</script>

<style>
body {
  overflow-x: hidden;
  -webkit-user-select: none;
  user-select: none;
}
* {
  -webkit-tap-highlight-color: transparent;
}
body {
  -webkit-touch-callout: none;
}
</style>
