<template>
  <div class="sticker-preview max-w-6xl mx-auto">
    <div class="bg-gray-900 rounded-lg shadow-lg p-8 border border-gray-700">
      <!-- logo -->
      <div class="text-center mb-4">
        <img src="/Logo_CimaKids.png" alt="Logo" class="inline-block h-20 logo" />
      </div>
      <h2 class="text-3xl font-bold mb-6 text-center text-white">¡Registro Completado!</h2>

      <!-- Stickers Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <template v-for="checkIn in checkIns" :key="checkIn.id">
          <!-- Child Sticker -->
          <div class="sticker-card border-4 border-blue-500 rounded-lg p-6 bg-white">
            <div class="text-center">
              <img src="/Logo_CimaKids.png" alt="Logo" class="mx-auto h-12 mb-2" />
              <div class="sticker-type text-xs font-bold mb-2 text-blue-600 uppercase">
                NIÑO
              </div>
              <div class="church-name text-lg font-bold mb-3 text-gray-700">
                {{ churchName }}
              </div>
              <div class="child-name text-5xl font-bold mb-2 text-gray-900">
                {{ checkIn.child.firstName }}
              </div>
              <div class="family-name text-3xl mb-3 text-gray-600">
                {{ checkIn.child.lastName }}
              </div>
              <div class="timestamp text-sm text-gray-500">
                {{ formatDate(checkIn.checkInTime) }}
              </div>
              <div class="timestamp text-sm text-gray-500">
                {{ formatTime(checkIn.checkInTime) }}
              </div>
              <div class="mt-2 text-gray-600 font-semibold">
                {{ calculateAge(checkIn.child.birthDate) }} años
              </div>
            </div>
          </div>

          <!-- Parent Sticker -->
          <div class="sticker-card border-4 border-green-500 rounded-lg p-6 bg-white">
            <div class="text-center">
              <img src="/Logo_CimaKids.png" alt="Logo" class="mx-auto h-12 mb-2" />
              <div class="sticker-type text-xs font-bold mb-2 text-green-600 uppercase">
                PADRE/MADRE - RECOGIDA
              </div>
              <div class="church-name text-lg font-bold mb-3 text-gray-700">
                {{ churchName }}
              </div>
              <div class="child-name text-3xl font-bold mb-2 text-gray-900">
                Recoge a:
              </div>
              <div class="family-name text-4xl mb-4 text-gray-700 font-bold">
                {{ checkIn.child.firstName }}
              </div>
              <div class="timestamp text-sm text-gray-500">
                {{ formatDate(checkIn.checkInTime) }}
              </div>
              <div class="timestamp text-sm text-gray-500">
                {{ formatTime(checkIn.checkInTime) }}
              </div>
              <div class="mt-3 text-gray-600 font-semibold">
                Conserve este sticker
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Instructions -->
      <div class="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6">
        <p class="text-center text-lg text-gray-200">
          <strong>{{ checkIns.length * 2 }}</strong> etiquetas listas para imprimir ({{ checkIns.length }} niño{{ checkIns.length !== 1 ? 's' : '' }} + {{ checkIns.length }} padre{{ checkIns.length !== 1 ? 's' : '' }}).
        </p>
        <p class="text-center text-sm text-gray-300 mt-2">
          El niño conserva su etiqueta <span class="text-blue-400">AZUL</span>. El padre conserva su etiqueta <span class="text-green-400">VERDE</span> para la recogida.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-3">
        <!-- Tablet: print both stickers together -->
        <UiButton
          variant="primary"
          size="large"
          class="w-full"
          @click="handlePrint"
        >
          🖨 Imprimir Etiquetas (Tablet)
        </UiButton>

        <UiButton
          variant="secondary"
          size="large"
          class="w-full"
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
import { calculateAge } from '~/utils/age'

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
  aspect-ratio: 4 / 6;
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
