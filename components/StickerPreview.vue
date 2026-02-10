<template>
  <div class="sticker-preview max-w-6xl mx-auto">
    <div class="bg-gray-900 rounded-lg shadow-lg p-8 border border-gray-700">
      <h2 class="text-3xl font-bold mb-6 text-center text-white">¡Registro Completado!</h2>

      <!-- Stickers Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div
          v-for="checkIn in checkIns"
          :key="checkIn.id"
          class="sticker-card border-4 border-gray-800 rounded-lg p-6 bg-white"
        >
          <div class="text-center">
            <div class="church-name text-lg font-bold mb-3 text-gray-700">
              {{ churchName }}
            </div>
            <div class="child-name text-4xl font-bold mb-2 text-gray-900">
              {{ checkIn.child.firstName }}
            </div>
            <div class="family-name text-2xl mb-4 text-gray-600">
              {{ checkIn.child.lastName }}
            </div>
            <div class="security-code text-5xl font-bold border-4 border-yellow-500 rounded-lg py-3 px-4 mb-3 bg-yellow-500 text-black">
              {{ checkIn.checkInNumber }}
            </div>
            <div class="timestamp text-sm text-gray-500">
              {{ formatDate(checkIn.checkInTime) }}
            </div>
            <div class="timestamp text-sm text-gray-500">
              {{ formatTime(checkIn.checkInTime) }}
            </div>
            <div v-if="checkIn.child.allergies || checkIn.child.specialNeeds" class="mt-2 text-red-600 font-bold">
              ⚠ Ver notas
            </div>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6">
        <p class="text-center text-lg text-gray-200">
          <strong>{{ checkIns.length }}</strong> etiqueta{{ checkIns.length !== 1 ? 's' : '' }} lista{{ checkIns.length !== 1 ? 's' : '' }} para imprimir.
          Cada niño debe conservar su etiqueta para la recogida.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4">
        <UiButton
          variant="primary"
          size="large"
          class="flex-1"
          @click="handlePrint"
        >
          🖨 Imprimir Etiquetas
        </UiButton>

        <UiButton
          variant="secondary"
          size="large"
          class="flex-1"
          @click="handleDone"
        >
          Listo
        </UiButton>
      </div>

      <!-- Auto-reset countdown -->
      <div v-if="showCountdown" class="mt-6 text-center">
        <div class="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
          <p class="text-xl font-semibold mb-2 text-yellow-100">
            Reiniciando automáticamente en {{ countdown }} segundo{{ countdown !== 1 ? 's' : '' }}...
          </p>
          <UiButton
            variant="danger"
            size="small"
            @click="cancelReset"
          >
            ¡Espera! Necesito más tiempo
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CheckInResult } from '~/composables/useCheckIn'

interface Props {
  checkIns: CheckInResult[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  done: []
  reset: []
}>()

const config = useRuntimeConfig()
const churchName = config.public.churchName
const autoResetSeconds = parseInt(config.public.autoResetSeconds)

const { printStickers, formatTime, formatDate } = usePrint()

const showCountdown = ref(false)
const countdown = ref(autoResetSeconds)
let countdownInterval: ReturnType<typeof setInterval> | null = null

const handlePrint = () => {
  printStickers(props.checkIns)
}

const handleDone = () => {
  emit('done')
  startCountdown()
}

const startCountdown = () => {
  showCountdown.value = true
  countdown.value = autoResetSeconds

  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      stopCountdown()
      emit('reset')
    }
  }, 1000)
}

const cancelReset = () => {
  stopCountdown()
  showCountdown.value = false
}

const stopCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
}

// Cleanup on unmount
onUnmounted(() => {
  stopCountdown()
})
</script>

<style scoped>
.sticker-card {
  aspect-ratio: 2.25 / 4;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

@media (max-width: 768px) {
  .sticker-card {
    aspect-ratio: auto;
  }
}
</style>
